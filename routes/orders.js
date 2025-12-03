const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../utils/authMiddleware");

router.post("/create", auth, orderController.createOrder);

module.exports = router;
