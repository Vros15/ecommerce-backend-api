const express = require("express");
const app = express();
const logger = require("morgan");
const connectToMongoDB = require("./database/connectToMongoDB");


app.use(express.json());
app.use(logger(`dev`));

app.use("/api/customers", require("./routes/customersRouter"));
app.use("/api/products", require("./routes/productsRouter"));
app.use("/api/carts", require("./routes/cartsRouter"));
app.use("/api/orders", require("./routes/ordersRouter"));
  
const PORT = 3000;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});