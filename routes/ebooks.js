const express = require("express");
const router = express.Router();
const ebookController = require("../controllers/ebookController");
const auth = require("../utils/authMiddleware");

router.get("/", ebookController.list);
router.get("/:id", ebookController.get);
router.get("/:id/download", auth, ebookController.download);
router.get("/:id/status", auth, ebookController.status);

module.exports = router;
