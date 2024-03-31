const express = require("express");
const chats = require("./data/data.js");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const userRouter = require("./routes/userRoute.js");
const chatRouter = require("./routes/chatRoute.js");
const messageRouter = require("./routes/messageRoute.js");
const { PdfFile } = require("./models/pdfFileModel.js");
const multer = require("multer");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const { authVerify } = require("./middleware/authMiddleware.js");
const { User } = require("./models/userModel.js");
const { Chat } = require("./models/chatModel.js");
const { Message } = require("./models/messageModel.js");
dotenv.config();

const app = express();
connectDB();

//middleware
app.use(cors());
app.use(express.json());
app.use("/files", express.static("files"));

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

//pdf upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload-pdf", authVerify, upload.single("file"), async (req, res) => {
  try {
    const fileName = req.file.filename;
    console.log("filename", fileName);
    const { content, chatId } = req.body;
    console.log("content ", content, " chatid ", chatId);

    if (!fileName) {
      res.status(400).send("fileName is required");
    }
    if (!content || !chatId) {
      res.status(400).send("message content and chatId is required");
    }

    let newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

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

    const pdfData = new PdfFile({
      pdf: fileName,
      messageId: message._id,
    });

    let newPdfData = await pdfData.save();
    if (newPdfData) {
      res.status(200).send({
        success: true,
        pdfData: newPdfData,
        message: "Uploading Pdf Successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while uploading Pdf",
    });
  }
});
app.get("/get-pdf-file/:messageId", authVerify, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    if (!messageId) {
      return res.status(400).send("pdf message id is required to get");
    }
    const pdfData = await PdfFile.findOne({
      messageId,
    });

    if (pdfData) {
      return res.status(200).send({
        success: true,
        pdfData,
        message: "Found Pdf Successfully",
      });
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      err,
      message: "Error while finding Pdf",
    });
  }
});

// -------- deployment -------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "chat_frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname1, "chat_frontend", "build", "index.html")
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running successfully");
  });
}
// -------- deployment -------

//error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log("Server started at port ", PORT));
//document upload
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joining room ", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
