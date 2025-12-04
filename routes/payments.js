const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/verify", paymentController.verify);

router.post("/webhook", paymentController.webhook);

module.exports = router;
