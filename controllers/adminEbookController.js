const cloudinary = require("../config/cloudinary");
const Ebook = require("../models/Ebook");

exports.uploadEbook = async (req, res) => {
  try {
    const { title, price, description, productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!req.files?.pdf) {
      return res.status(400).json({ message: "PDF is required" });
    }

    const pdf = await cloudinary.uploader.upload(req.files.pdf[0].path, {
      resource_type: "raw",
      folder: "ebooks",
      type: "private",
    });

    let coverUrl = "";
    let coverPublicId = "";
    if (req.files.cover) {
      const cover = await cloudinary.uploader.upload(req.files.cover[0].path, {
        folder: "covers",
      });
      coverUrl = cover.secure_url;
      coverPublicId = cover.public_id;
    }

    const ebook = await Ebook.create({
      title,
      description,
      price,
      cloudinaryPublicId: pdf.public_id,
      coverUrl,
      coverPublicId: coverPublicId,
      productId,
    });

    return res.json({ success: true, ebook });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

exports.checkExistingProductId = async (req, res) => {
  const existing = await Ebook.findOne({ productId: req.params.productId });

  res.json({
    exists: existing ? true : false,
    ebook: existing || null,
  });
};

exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find().sort({ createdAt: -1 });
    return res.json({ ebooks });
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch admin ebooks" });
  }
};

exports.deleteEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: "Ebook not found" });

    // Delete PDF from Cloudinary
    await cloudinary.uploader.destroy(ebook.cloudinaryPublicId, {
      resource_type: "raw",
    });

    // Delete cover if exists
    if (ebook.coverUrl) {
      const coverPublicId = ebook.coverUrl
        .split("/")
        .slice(-1)[0]
        .split(".")[0];
      await cloudinary.uploader.destroy(`covers/${coverPublicId}`);
    }

    await Ebook.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Ebook fully deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed" });
  }
};

exports.getEbookToEdit = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: "Ebook not found" });

    res.json({ ebook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load ebook" });
  }
};

exports.editEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: "Ebook not found" });

    const { title, description, price } = req.body;

    // Update primary fields
    ebook.title = title || ebook.title;
    ebook.description = description || ebook.description;
    ebook.price = price || ebook.price;

    // REPLACE PDF if admin uploads
    if (req.files?.pdf) {
      // delete old
      await cloudinary.uploader.destroy(ebook.cloudinaryPublicId, {
        resource_type: "raw",
      });

      // upload new
      const uploadedPdf = await cloudinary.uploader.upload(
        req.files.pdf[0].path,
        {
          resource_type: "raw",
          folder: "ebooks",
          type: "private",
        }
      );

      ebook.cloudinaryPublicId = uploadedPdf.public_id;
    }

    // REPLACE COVER if admin uploads
    if (req.files?.cover) {
      if (ebook.coverPublicId) {
        await cloudinary.uploader.destroy(ebook.coverPublicId, {
          resource_type: "image",
        });
      }

      const uploadedCover = await cloudinary.uploader.upload(
        req.files.cover[0].path,
        {
          folder: "covers",
        }
      );

      ebook.coverUrl = uploadedCover.secure_url;
      ebook.coverPublicId = uploadedCover.public_id;
    }

    await ebook.save();

    res.json({ success: true, ebook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update ebook" });
  }
};
