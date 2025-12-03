const Ebook = require("../models/Ebook");
const Purchase = require("../models/Purchase");
const generateSignedUrl = require("../utils/generateSignedUrl");

exports.list = async (req, res) => {
  try {
    const ebooks = await Ebook.find().select("-cloudinaryPublicId");
    return res.json(ebooks);
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch ebooks", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id).select(
      "-cloudinaryPublicId"
    );
    if (!ebook) return res.status(404).json({ message: "Not found" });

    return res.json(ebook);
  } catch (error) {
    console.error("Error fetching ebook:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch ebook", error: error.message });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const purchased = await Purchase.findOne({ user: userId, ebook: id });
    if (!purchased) return res.status(403).json({ message: "Not purchased" });

    const ebook = await Ebook.findById(id);
    if (!ebook) return res.status(404).json({ message: "Ebook not found" });

    const url = generateSignedUrl(ebook.cloudinaryPublicId);

    return res.json({ url });
  } catch (error) {
    console.error("Error generating download:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate download", error: error.message });
  }
};
