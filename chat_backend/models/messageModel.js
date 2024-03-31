const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    picture: { type: String },
  },
  {
    timestamps: true,
  }
);

exports.Message = mongoose.model("Message", messageSchema);
