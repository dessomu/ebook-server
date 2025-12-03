require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const ebookRoutes = require("./routes/ebooks");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(bodyParser.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/ebooks", ebookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("API running"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
