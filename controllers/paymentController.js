const crypto = require("crypto");
const Order = require("../models/Order");
const Purchase = require("../models/Purchase");

exports.verify = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  try {
    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated !== razorpay_signature)
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "paid";
    await order.save();

    await Purchase.create({
      user: order.user,
      ebook: order.ebook,
      order: order._id,
    });

    return res.status(200).json({ success: true, order: order });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};
