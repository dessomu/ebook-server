const mongoose = require("mongoose");

const ebookSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    price: { type: Number },
    cloudinaryPublicId: { type: String }, // PDF stored here
    coverUrl: { type: String },
    coverPublicId: { type: String }, // Cover stored here
    productId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Ebook = mongoose.model("Ebook", ebookSchema);
module.exports = Ebook;
