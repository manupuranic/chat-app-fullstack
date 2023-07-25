const express = require("express");
const userAuthentication = require("../middleware/auth");
const chatController = require("../controllers/chat");

const router = express.Router();

router.post("/", userAuthentication.authenticateToken, chatController.postChat);

router.get("/", userAuthentication.authenticateToken, chatController.getChat);

module.exports = router;
