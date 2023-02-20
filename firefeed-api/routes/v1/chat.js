const express           = require("express");
const router            = express.Router();

const chatController    = require('../../controllers/v1/chat');

router.post("/chat", chatController.sendMessage);

module.exports          = router; 