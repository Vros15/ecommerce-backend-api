const express = require("express");
const app = express();
const logger = require("morgan");
const connectToMongoDB = require("./database/connectToMongoDB");


app.use(express.json());
app.use(logger(`dev`));

app.use("/api/customers", require("./routes/customersRouter"));

const PORT = 3000;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});