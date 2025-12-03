const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ebook: { type: mongoose.Schema.Types.ObjectId, ref: "Ebook" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
