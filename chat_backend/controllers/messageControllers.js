const asyncHandler = require("express-async-handler");
const { Message } = require("../models/messageModel");
const { User } = require("../models/userModel");
const { Chat } = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, picture } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Content and chatId is required");
  }
  let newMessage = "";
  if (picture) {
    newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
      picture: picture,
    };
  } else {
    newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
  }
  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(200).json(message);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

const editMessage = asyncHandler(async (req, res) => {
  const { content, messageId } = req.body;

  if (!content || !messageId) {
    res.status(400);
    throw new Error("Content and messageId is required");
  }

  try {
    let message = await Message.findByIdAndUpdate(
      { _id: messageId },
      { content },
      { new: true }
    );
    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");

    res.status(200).json(message);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!messageId) {
    res.status(400);
    throw new Error(" messageId is required");
  }

  try {
    let message = await Message.findByIdAndDelete({ _id: messageId });

    res.status(200).json(message);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

const getAllMessages = asyncHandler(async (req, res) => {
  try {
    let messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

module.exports = { sendMessage, getAllMessages, editMessage, deleteMessage };
