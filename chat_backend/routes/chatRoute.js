const express = require("express");
const { authVerify } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

router.post("/access-chat", authVerify, accessChat);
router.get("/get-chats", authVerify, fetchChats);
router.post("/new-group-chat", authVerify, createGroupChat);
router.put("/rename-group", authVerify, renameGroup);
router.put("/remove-from-group", authVerify, removeFromGroup);
router.put("/add-to-group", authVerify, addToGroup);

module.exports = router;
