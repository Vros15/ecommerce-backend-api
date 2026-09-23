// Unit tests for the structured logger. Each case captures the stream write
// and parses the line back, so the assertions describe what a log viewer
// would actually receive.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const logger = require("../utils/logger");

// Swaps in a capturing write for one call, then restores it.
const capture = (stream, run) => {
  const lines = [];
  const original = stream.write;

  stream.write = (chunk) => {
    lines.push(chunk);
    return true;
  };

  try {
    run();
  } finally {
    stream.write = original;
  }

  return lines.map((line) => JSON.parse(line));
};

const withLevel = (level, run) => {
  const original = process.env.LOG_LEVEL;
  process.env.LOG_LEVEL = level;
  try {
    return run();
  } finally {
    if (original === undefined) delete process.env.LOG_LEVEL;
    else process.env.LOG_LEVEL = original;
  }
};

describe("logger", () => {
  test("writes one JSON line carrying the event, level, time, and fields", () => {
    const [line] = withLevel("info", () =>
      capture(process.stdout, () => logger.info("ticket.created", { ticketId: "t_1", amountCents: 4999 }))
    );

    assert.equal(line.event, "ticket.created");
    assert.equal(line.level, "info");
    assert.equal(line.ticketId, "t_1");
    assert.equal(line.amountCents, 4999);
    assert.ok(!Number.isNaN(Date.parse(line.time)), "time should be an ISO timestamp");
  });

  test("sends warnings and errors to stderr, ordinary events to stdout", () => {
    const out = withLevel("info", () => capture(process.stdout, () => logger.info("a.b", {})));
    const err = withLevel("info", () => capture(process.stderr, () => logger.error("c.d", {})));

    assert.equal(out.length, 1);
    assert.equal(err.length, 1);
  });

  test("redacts values that look like secrets, wherever they appear", () => {
    const [line] = withLevel("info", () =>
      capture(process.stdout, () =>
        logger.info("stripe.called", {
          note: "used sk_test_51QxSecretValueHere to authenticate",
          nested: { webhookSecret: "whsec_abc123def456" },
        })
      )
    );

    assert.ok(!line.note.includes("sk_test_51QxSecretValueHere"));
    assert.ok(line.note.includes("[redacted]"));
    assert.equal(line.nested.webhookSecret, "[redacted]");
  });

  test("redacts fields whose name suggests a credential, whatever the value", () => {
    const [line] = withLevel("info", () =>
      capture(process.stdout, () => logger.info("auth.checked", { authorization: "Bearer abc", userId: "user_1" }))
    );

    assert.equal(line.authorization, "[redacted]");
    assert.equal(line.userId, "user_1", "non-secret fields are untouched");
  });

  test("serializes an error into name, message, and stack", () => {
    const error = new Error("boom");
    error.code = "E_BOOM";

    const [line] = withLevel("info", () =>
      capture(process.stderr, () => logger.error("job.failed", { jobId: 7 }, error))
    );

    assert.equal(line.error.name, "Error");
    assert.equal(line.error.message, "boom");
    assert.equal(line.error.code, "E_BOOM");
    assert.ok(line.error.stack.includes("logger.test.js"));
  });

  test("drops events below the configured level", () => {
    const lines = withLevel("error", () => capture(process.stdout, () => logger.info("ignored.event", {})));

    assert.deepEqual(lines, []);
  });

  test("writes nothing at all when silenced", () => {
    const out = withLevel("silent", () => capture(process.stdout, () => logger.info("x", {})));
    const err = withLevel("silent", () => capture(process.stderr, () => logger.error("y", {})));

    assert.deepEqual([...out, ...err], []);
  });
});
