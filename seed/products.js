const products = [
  {
    name: "Wireless Gaming Mouse",
    description: "Ergonomic wireless gaming mouse with RGB lighting and adjustable DPI.",
    price: 49.99,
    category: "Electronics",
    stock: 75,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Mechanical Keyboard",
    description: "Compact mechanical keyboard with blue switches and customizable RGB lighting.",
    price: 89.99,
    category: "Electronics",
    stock: 42,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with 12-hour battery life and deep bass.",
    price: 64.99,
    category: "Audio",
    stock: 58,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "27-Inch 4K Monitor",
    description: "Ultra HD monitor with IPS display and HDR support.",
    price: 329.99,
    category: "Electronics",
    stock: 18,
    image: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Men's Running Shoes",
    description: "Lightweight running shoes designed for everyday training.",
    price: 109.99,
    category: "Footwear",
    stock: 34,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated 32 oz water bottle that keeps drinks cold for up to 24 hours.",
    price: 24.95,
    category: "Home & Kitchen",
    stock: 120,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Office Desk Chair",
    description: "Adjustable ergonomic office chair with lumbar support.",
    price: 189.99,
    category: "Furniture",
    stock: 15,
    image: "https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Cotton T-Shirt",
    description: "100% cotton crew neck t-shirt available in multiple colors.",
    price: 19.99,
    category: "Clothing",
    stock: 200,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Coffee Maker",
    description: "12-cup programmable coffee maker with auto shut-off.",
    price: 79.99,
    category: "Appliances",
    stock: 27,
    image: "https://images.unsplash.com/photo-1651669844044-ab4b90bdb754?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Yoga Mat",
    description: "Non-slip exercise yoga mat with carrying strap.",
    price: 34.99,
    category: "Fitness",
    stock: 90,
    image: "https://images.unsplash.com/photo-1646239646963-b0b9be56d6b5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "USB-C Fast Charger",
    description: "30W USB-C wall charger compatible with smartphones and tablets.",
    price: 24.99,
    category: "Electronics",
    stock: 85,
    image: "https://example.com/images/usb-c-charger.jpg"
  },
  {
    name: "Wireless Earbuds",
    description: "Noise-canceling wireless earbuds with charging case.",
    price: 99.99,
    category: "Audio",
    stock: 45,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Laptop Backpack",
    description: "Water-resistant backpack that fits laptops up to 17 inches.",
    price: 54.99,
    category: "Accessories",
    stock: 60,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Gaming Headset",
    description: "Over-ear gaming headset with surround sound and detachable microphone.",
    price: 79.99,
    category: "Gaming",
    stock: 30,
    image: "https://images.unsplash.com/photo-1610041321327-b794c052db27?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "External SSD 1TB",
    description: "Portable 1TB SSD with USB 3.2 high-speed data transfer.",
    price: 139.99,
    category: "Storage",
    stock: 22,
    image: "https://images.unsplash.com/photo-1674303440321-707bb3047ec8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Air Fryer",
    description: "6-quart digital air fryer with multiple cooking presets.",
    price: 119.99,
    category: "Appliances",
    stock: 18,
    image: "https://images.unsplash.com/photo-1695089028114-ce28248f0ab9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Smart Watch",
    description: "Fitness smartwatch with heart rate monitoring and GPS.",
    price: 199.99,
    category: "Wearables",
    stock: 40,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls and USB charging port.",
    price: 39.99,
    category: "Home Office",
    stock: 55,
    image: "https://images.unsplash.com/photo-1652198050957-fd1c6aab021f?q=80&w=524&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Electric Toothbrush",
    description: "Rechargeable electric toothbrush with multiple cleaning modes.",
    price: 59.99,
    category: "Personal Care",
    stock: 48,
    image: "https://images.unsplash.com/photo-1612181819081-950d35f4d826?q=80&w=1043&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Cast Iron Skillet",
    description: "12-inch pre-seasoned cast iron skillet for versatile cooking.",
    price: 34.99,
    category: "Kitchen",
    stock: 70,
    image: "https://images.unsplash.com/photo-1579805625996-db7b60587362?q=80&w=729&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

module.exports = products;