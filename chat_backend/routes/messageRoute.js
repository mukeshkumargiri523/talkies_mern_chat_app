const express = require("express");
const {
  sendMessage,
  getAllMessages,
  editMessage,
  deleteMessage,
} = require("../controllers/messageControllers");
const { authVerify } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-message", authVerify, sendMessage);
router.put("/edit-message", authVerify, editMessage);
router.delete("/delete-message/:messageId", authVerify, deleteMessage);
router.get("/get-message/:chatId", authVerify, getAllMessages);

module.exports = router;
