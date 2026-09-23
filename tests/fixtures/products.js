// A small, fixed catalogue the query tests can make exact assertions against.
// Chosen to exercise every filter: three Electronics, two out of stock, two
// names that only sort correctly under a case-insensitive collation
// ("Laptop Backpack" before "LED Desk Lamp"), four priced between 50 and 100,
// and "wireless" appearing in both a name and a description.
const testProducts = [
  {
    name: "LED Desk Lamp",
    description: "Adjustable desk lamp with three brightness levels.",
    price: 34.99,
    category: "Home Office",
    stock: 12,
  },
  {
    name: "Laptop Backpack",
    description: "Water-resistant backpack with a padded laptop sleeve.",
    price: 59.99,
    category: "Apparel & Accessories",
    stock: 8,
  },
  {
    name: "Wireless Earbuds",
    description: "True wireless earbuds with active noise cancelling.",
    price: 79.99,
    category: "Audio",
    stock: 25,
  },
  {
    name: "Wireless Charging Pad",
    description: "Ten-watt charging pad for phones and earbud cases.",
    price: 24.99,
    category: "Electronics",
    stock: 0,
  },
  {
    name: "27-Inch 4K Monitor",
    description: "Ultra HD monitor with an IPS panel and HDR support.",
    price: 329.99,
    category: "Electronics",
    stock: 6,
  },
  {
    name: "Mechanical Keyboard",
    description: "Tactile switches, hot-swappable, with a detachable cable.",
    price: 89.99,
    category: "Electronics",
    stock: 14,
  },
  {
    name: "Ceramic Mug Set",
    description: "Four stoneware mugs, dishwasher and microwave safe.",
    price: 22.5,
    category: "Home & Kitchen",
    stock: 30,
  },
  {
    name: "Yoga Mat",
    description: "Six-millimetre mat with an alignment print.",
    price: 45.0,
    category: "Fitness & Wellness",
    stock: 0,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with twelve-hour battery life.",
    price: 64.99,
    category: "Audio",
    stock: 18,
  },
];

module.exports = { testProducts };
