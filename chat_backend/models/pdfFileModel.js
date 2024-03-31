const mongoose = require("mongoose");

const PdfFileSchema = new mongoose.Schema(
  {
    pdf: { type: String },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      unique: true,
    },
  },
  { timestamps: true }
);
exports.PdfFile = mongoose.model("PdfFile", PdfFileSchema);
