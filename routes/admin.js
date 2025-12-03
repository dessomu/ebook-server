const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../utils/authMiddleware");
const admin = require("../utils/adminMiddleware");
const cloudinary = require("../config/cloudinary");
const Ebook = require("../models/Ebook");

const upload = multer({ dest: "temp/" });

router.post(
  "/upload",
  auth,
  admin, // ← ADD THIS
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, price, description } = req.body;

      if (!req.files?.pdf) {
        return res.status(400).json({ message: "PDF is required" });
      }

      const pdf = await cloudinary.uploader.upload(req.files.pdf[0].path, {
        resource_type: "raw",
        folder: "ebooks",
        type: "private",
      });

      let coverUrl = "";
      if (req.files.cover) {
        const cover = await cloudinary.uploader.upload(
          req.files.cover[0].path,
          {
            folder: "covers",
          }
        );
        coverUrl = cover.secure_url;
      }

      const ebook = await Ebook.create({
        title,
        description,
        price,
        cloudinaryPublicId: pdf.public_id,
        coverUrl,
      });

      res.json({ success: true, ebook });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

router.get("/ebooks", auth, admin, async (req, res) => {
  try {
    const ebooks = await Ebook.find().sort({ createdAt: -1 });
    res.json({ ebooks });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch admin ebooks" });
  }
});

router.delete("/ebook/:id", auth, admin, async (req, res) => {
  try {
    await Ebook.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
