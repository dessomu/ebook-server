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

    const alreadyPurchased = await Purchase.findOne({
      user: order.user,
      productId: order.productId,
    });

    if (!alreadyPurchased) {
      await Purchase.create({
        user: order.user,
        productId: order.productId,
        order: order._id,
      });
    }

    return res.status(200).json({ success: true, order: order });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};

exports.webhook = async (req, res) => {
  try {
    const body = req.body.toString(); // raw string

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    const receivedSignature = req.headers["x-razorpay-signature"];

    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({ status: "invalid signature" });
    }

    const event = JSON.parse(body);

    // ONLY handle successful payments
    if (event.event === "payment.captured") {
      const rOrderId = event.payload.payment.entity.order_id;

      // find our order by Razorpay ID
      const order = await Order.findOne({ razorpayOrderId: rOrderId });

      if (order && order.status !== "paid") {
        order.status = "paid";
        await order.save();

        const alreadyPurchased = await Purchase.findOne({
          user: order.user,
          productId: order.productId,
        });

        if (!alreadyPurchased) {
          // create Purchase record
          await Purchase.create({
            user: order.user,
            productId: order.productId,
            order: order._id,
          });
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error" });
  }
};
