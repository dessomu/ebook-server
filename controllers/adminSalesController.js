const Purchase = require("../models/Purchase");

exports.getSales = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("order");

    const totalSales = purchases.length;

    const totalRevenue = purchases.reduce(
      (sum, p) => sum + (p.order?.amount || 0),
      0
    );

    const byProduct = await Purchase.aggregate([
      { $group: { _id: "$productId", sales: { $sum: 1 } } },
    ]);

    res.json({
      totalSales,
      totalRevenue,
      byProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sales" });
  }
};
