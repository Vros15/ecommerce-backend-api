const mongoose = require("mongoose");
const app = require("./app");
const connectToMongoDB = require("./database/connectToMongoDB");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToMongoDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
