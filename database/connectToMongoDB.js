const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Serverless platforms may run many short-lived instances of this module, so the
// connection is cached on globalThis and reused across warm invocations. A
// long-running server hits the cache once at startup and never again.
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

const connectToMongoDB = async function () {
  if (cached.conn) {
    return cached.conn;
  }

  // Cache the promise rather than the resolved connection so that concurrent
  // requests arriving on a cold instance share one connection attempt.
  if (!cached.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((connection) => {
        console.log("MONGODB CONNECTED");
        return connection;
      })
      .catch((error) => {
        // Clear the cached attempt so a transient failure does not poison this
        // instance for the rest of its life.
        cached.promise = null;
        console.error("Failed to connect to MongoDB", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectToMongoDB;
