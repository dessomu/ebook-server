const Purchase = require("../models/Purchase");
const Ebook = require("../models/Ebook");

exports.getUserLibrary = async (req, res) => {
  try {
    const userId = req.user._id;

    const purchases = await Purchase.find({ user: userId }).sort({
      createdAt: -1,
    });

    const productIds = purchases.map((p) => p.productId);

    const ebooks = await Ebook.find({ productId: { $in: productIds } });

    // Map productId -> ebook document (or null)
    const ebookMap = new Map(ebooks.map((e) => [e.productId, e]));

    // Merge purchase with ebook info
    const mapped = purchases.map((p) => ({
      _id: p._id,
      productId: p.productId,
      ebook: ebookMap.get(p.productId) || null,
      deleted: ebookMap.get(p.productId) ? false : true,
      purchasedAt: p.createdAt,
    }));

    return res.json({ purchases: mapped });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch library" });
  }
};
