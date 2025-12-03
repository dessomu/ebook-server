const mongoose = require("mongoose");

const ebookSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    price: { type: Number },
    cloudinaryPublicId: { type: String }, // PDF stored here
    coverUrl: { type: String },
  },
  { timestamps: true }
);

const Ebook = mongoose.model("Ebook", ebookSchema);
module.exports = Ebook;
