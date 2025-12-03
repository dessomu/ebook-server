const Order = require("../models/Order");
const Ebook = require("../models/Ebook");
const razorpay = require("../config/razorPay");

exports.createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { ebookId } = req.body;

    const ebook = await Ebook.findById(ebookId);
    if (!ebook) {
      return res.status(404).json({ message: "Ebook not found" });
    }

    const amountInPaise = ebook.price * 100;

    const rOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
      payment_capture: 1,
    });

    const order = await Order.create({
      user: user._id,
      ebook: ebook._id,
      razorpayOrderId: rOrder.id,
      amount: ebook.price,
      status: "created",
    });

    return res.json({
      orderId: order._id,
      razorpayOrder: rOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the order",
      error: error.message,
    });
  }
};
