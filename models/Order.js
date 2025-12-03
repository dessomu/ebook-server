const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ebook: { type: mongoose.Schema.Types.ObjectId, ref: "Ebook" },
    razorpayOrderId: String,
    amount: Number,
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
