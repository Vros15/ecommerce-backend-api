const mongoose = require("mongoose");
const dotenv = require("dotenv");

const dns = require("node:dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const connectToMongoDB = async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB CONNECTED");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToMongoDB;