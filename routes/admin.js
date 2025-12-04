const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../utils/authMiddleware");
const admin = require("../utils/adminMiddleware");
const {
  uploadEbook,
  getEbooks,
  deleteEbook,
  getEbookToEdit,
  editEbook,
  checkExistingProductId,
} = require("../controllers/adminEbookController");
const { getSales } = require("../controllers/adminSalesController");

const upload = multer({ dest: "temp/" });

router.post(
  "/upload",
  auth,
  admin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadEbook
);

router.get("/check-product-id/:productId", auth, admin, checkExistingProductId);

router.get("/ebooks", auth, admin, getEbooks);

router.get("/ebook/:id", auth, admin, getEbookToEdit);

router.delete("/ebook/:id", auth, admin, deleteEbook);

router.get("/sales/overview", auth, admin, getSales);

router.put(
  "/ebook/:id",
  auth,
  admin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  editEbook
);

module.exports = router;
