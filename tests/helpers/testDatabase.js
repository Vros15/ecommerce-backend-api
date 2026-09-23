require("dotenv").config();

const mongoose = require("mongoose");
const connectToMongoDB = require("../../database/connectToMongoDB");
const Product = require("../../models/Product");
const { testProducts } = require("../fixtures/products");

// Tests write to and wipe collections, so they must never touch the real
// database. Three guards, because getting this wrong is unrecoverable:
// MONGODB_URI_TEST has to be set, it has to differ from MONGODB_URI, and its
// database name has to contain "test".
const requireTestDatabaseUri = () => {
  const uri = process.env.MONGODB_URI_TEST;

  if (!uri) {
    throw new Error("MONGODB_URI_TEST must be set to run the tests. See .env.example.");
  }

  if (uri === process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI_TEST must not be the same as MONGODB_URI.");
  }

  const databaseName = new URL(uri).pathname.replace(/^\//, "");

  if (!/test/i.test(databaseName)) {
    throw new Error(
      `Refusing to run tests against database "${databaseName}": its name must contain "test".`
    );
  }

  return uri;
};

// The app and the connection helper both read MONGODB_URI at call time, so
// pointing that variable at the test database is enough to redirect
// everything the tests touch.
//
// `node --test` runs each file in its own process, in parallel, so every file
// gets its own database ("MegaMart-test" becomes "MegaMart-test-products").
// Sharing one would mean a file seeding its fixtures while another is mid-run.
const useTestDatabase = (namespace) => {
  const uri = new URL(requireTestDatabaseUri());

  uri.pathname = `${uri.pathname.replace(/^\//, "")}-${namespace}`;
  process.env.MONGODB_URI = uri.toString();
};

// Replaces the products collection with the fixture catalogue, so query
// assertions describe known data instead of whatever the live store holds.
const seedTestProducts = async () => {
  await connectToMongoDB();
  await Product.deleteMany({});
  await Product.insertMany(testProducts);
};

const closeTestDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = { useTestDatabase, seedTestProducts, closeTestDatabase, testProducts };
