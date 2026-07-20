const express = require("express");
const app = express();
const logger = require("morgan");
const connectToMongoDB = require("./database/connectToMongoDB");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");


app.use(express.json());
app.use(logger(`dev`));

app.use("/api/customers", require("./routes/customersRouter"));
app.use("/api/products", require("./routes/productsRouter"));
app.use("/api/carts", require("./routes/cartsRouter"));
app.use("/api/orders", require("./routes/ordersRouter"));

app.use(notFound);
app.use(errorHandler);
  
const PORT = 3000;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});