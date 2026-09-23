// One JSON object per line, which is what Vercel's log viewer, and anything
// that ships logs onward, can actually filter on. No dependency: this is
// roughly the useful half of a logging library in forty lines.
//
// Usage: logger.info("checkout.session.created", { sessionId, amountCents })
//        logger.error("refund.failed", { ticketId }, error)

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const threshold = () => LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

// Anything matching a live secret's shape is replaced wherever it appears.
// Belt and braces alongside the key-name check below: a Stripe key pasted
// into an unexpected field is still a leaked key.
const SECRET_VALUE = /\b(sk|rk|whsec|pk)_[A-Za-z0-9_]{6,}/g;
const SECRET_KEY = /(key|secret|token|password|authorization|cookie)/i;

const scrub = (value, depth = 0) => {
  if (typeof value === "string") return value.replace(SECRET_VALUE, "[redacted]");
  if (value === null || typeof value !== "object" || depth > 4) return value;
  if (Array.isArray(value)) return value.map((entry) => scrub(entry, depth + 1));

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) =>
      SECRET_KEY.test(key) ? [key, "[redacted]"] : [key, scrub(entry, depth + 1)]
    )
  );
};

const serializeError = (error) => ({
  name: error.name,
  message: error.message,
  code: error.code,
  stack: error.stack,
});

const write = (level, event, fields, error) => {
  if (LEVELS[level] < threshold()) return;

  const line = {
    time: new Date().toISOString(),
    level,
    event,
    ...scrub(fields ?? {}),
    ...(error ? { error: scrub(serializeError(error)) } : {}),
  };

  // Errors and warnings go to stderr so they stay separable from ordinary
  // traffic in any log viewer that splits the two streams.
  const stream = LEVELS[level] >= LEVELS.warn ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(line)}\n`);
};

const logger = {
  debug: (event, fields) => write("debug", event, fields),
  info: (event, fields) => write("info", event, fields),
  warn: (event, fields, error) => write("warn", event, fields, error),
  error: (event, fields, error) => write("error", event, fields, error),
};

module.exports = logger;
