const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectToMongoDB = async function () {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB CONNECTED");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};

module.exports = connectToMongoDB;