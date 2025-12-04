const express = require("express");
const router = express.Router();
const auth = require("../utils/authMiddleware");
const { getUserLibrary } = require("../controllers/userLibraryController");

router.get("/me/library", auth, getUserLibrary);

module.exports = router;
