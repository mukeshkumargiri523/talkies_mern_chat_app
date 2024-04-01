import React, { useEffect, useState } from "react";
import useChatContext from "../../context/ChatContext";
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { HiUpload } from "react-icons/hi";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { getSenderUser, getSenderFullDetail } from "../../config/chatLogic";
import ProfileModel from "./miscellaneous/ProfileModel";
import axios from "axios";
import "./style.css";
import ScrollableChat from "./miscellaneous/ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import { FaFileImage } from "react-icons/fa";
import { IoArrowRedo } from "react-icons/io5";
import { FaFilePdf } from "react-icons/fa";
import animationData from "../../animations/lotte_typing_animation.json";
const ENDPOINT = "https://talkies-mern-chat-app.onrender.com";
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useChatContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [callFetchMessage, setCallFetchMessage] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [picture, setPicture] = useState("");
  const [pickLoading, setPickLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [file, setFile] = useState("");

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  async function fetchMessage() {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/v1/messages/get-message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: "failed to load message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        setCallFetchMessage(false);
        setMessageLoading(true);
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        if (picture) {
          const { data } = await axios.post(
            `/api/v1/messages/send-message`,
            {
              content: newMessage,
              chatId: selectedChat._id,
              picture: picture,
            },
            config
          );
          setNewMessage("");
          socket.emit("new message", data);
          setPicture("");
          setMessages([...messages, data]);
          setMessageLoading(false);
          setCallFetchMessage(true);
        } else {
          const { data } = await axios.post(
            `/api/v1/messages/send-message`,
            {
              content: newMessage,
              chatId: selectedChat._id,
            },
            config
          );
          setNewMessage("");
          socket.emit("new message", data);
          setMessages([...messages, data]);
          setMessageLoading(false);
          setCallFetchMessage(true);
        }
      } catch (err) {
        toast({
          title: "Error Occured",
          description: err?.response?.data?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setMessageLoading(false);
      }
    }
  }

  async function sendClickMessage() {
    socket.emit("stop typing", selectedChat._id);
    try {
      setCallFetchMessage(false);
      setMessageLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      if (picture) {
        const { data } = await axios.post(
          `/api/v1/messages/send-message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
            picture: picture,
          },
          config
        );
        setNewMessage("");
        socket.emit("new message", data);
        setPicture("");
        setMessages([...messages, data]);
        setMessageLoading(false);
        setCallFetchMessage(true);
      } else {
        const { data } = await axios.post(
          `/api/v1/messages/send-message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        setNewMessage("");
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setMessageLoading(false);
        setCallFetchMessage(true);
      }
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setMessageLoading(false);
    }
  }
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessage();

    selectedChatCompare = selectedChat;
  }, [selectedChat, callFetchMessage]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  async function typingHandler(e) {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timeLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timeLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
  }

  const postPicture = async (pic) => {
    setPickLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setPickLoading(false);
      return;
    }

    const data = new FormData();
    data.append("file", pic);
    data.append("upload_preset", "mern_chat_app");
    data.append("cloud_name", "dmhgxlch9");
    fetch("https://api.cloudinary.com/v1_1/dmhgxlch9/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setPicture(data.url.toString());
        toast({
          title: "Write some message to post image. Image uploaded succesfully",
          status: "warning",
          duration: 7000,
          isClosable: true,
          position: "top",
        });
        setPickLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setPickLoading(false);
      });
  };

  async function uploadPdf() {
    try {
      console.log("hii 2");
      setPdfLoading(true);
      console.log("file", file);

      if (file) {
        if (newMessage) {
          const formData = new FormData();
          let content = newMessage;
          formData.append("file", file);
          formData.append("content", content);
          formData.append("chatId", selectedChat?._id);
          console.log(user.token);

          const res = await axios.post("/upload-pdf", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.token}`,
            },
          });

          setNewMessage("");
          if (res.data.success) {
            console.log("data is", res.data);
            toast({
              title: "pdf uploaded successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
            setFetchAgain((prev) => !prev);

            setPdfLoading(false);
          } else {
            console.log("err", res);
            toast({
              title: "pdf uploaded failed",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
            setPdfLoading(false);
          }
        } else {
          setNewMessage("");
          toast({
            title: "Write some message to post pdf and Try again",
            status: "warning",
            duration: 7000,
            isClosable: true,
            position: "top",
          });
          setPdfLoading(false);
        }
      } else {
        toast({
          title: "pdf file is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      setPdfLoading(false);
    } catch (err) {
      setPdfLoading(false);
      console.log(err);
    }
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap="30px"
            fontSize={{ base: "28px", md: "30px" }}
            pb="3"
            px="2"
            w="100%"
            fontFamily="urbanist roboto"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<FaArrowLeft />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat?.isGroupChat ? (
              <Tooltip>
                <Avatar
                  mt="8px"
                  mr="1"
                  size="md"
                  cursor="pointer"
                  src={getSenderFullDetail(user, selectedChat?.users).pic}
                />
              </Tooltip>
            ) : (
              <Tooltip>
                <Avatar
                  mt="8px"
                  mr="1"
                  size="md"
                  cursor="pointer"
                  src={selectedChat?.pic}
                />
              </Tooltip>
            )}
            {!selectedChat?.isGroupChat ? (
              <>
                {getSenderUser(user, selectedChat.users)}
                <ProfileModel
                  user={getSenderFullDetail(user, selectedChat.users)}
                ></ProfileModel>
              </>
            ) : (
              <>
                {selectedChat?.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessage={fetchMessage}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p="3"
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w="20" h="20" alignSelf="center" />
            ) : (
              <div className="messages">
                <ScrollableChat
                  messages={messages}
                  setCallFetchMessage={setCallFetchMessage}
                />
              </div>
            )}
            <FormControl marginTop="15px" onKeyDown={sendMessage}>
              {isTyping ? (
                <span
                  style={{
                    color: "purple",
                    fontWeight: "500",
                    background: "lightgreen",
                    padding: "3px 10px",

                    borderRadius: "17px",
                  }}
                >
                  {/* <Lottie
                    options={defaultOptions}
                    w="30px"
                    h="20px"
                    style={{ marginBottom: 5, marginLeft: 0 }}
                  /> */}
                  Typing..
                </span>
              ) : (
                <></>
              )}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Input
                  marginTop="3"
                  variant="filled"
                  bg="#D3D3D3"
                  placeholder="Enter message to chat"
                  onChange={typingHandler}
                  value={newMessage}
                  isDisabled={messageLoading}
                />
                <IconButton
                  marginTop="3"
                  marginLeft="1"
                  marginRight="1"
                  bg="gold"
                  icon={<IoArrowRedo fontSize="30px" />}
                  onClick={sendClickMessage}
                />
                <div style={{ marginTop: "12px" }}>
                  <label htmlFor="uploadImg">
                    {/* <IconButton
                      marginTop="3"
                      marginLeft="1"
                      htmlFor="uploadImg"
                      bg={setPickLoading ? "green" : "red"}
                      icon={}
                    /> */}
                    <div
                      style={{
                        background: `${pickLoading ? "orchid" : "red"}`,
                        padding: "8px",
                        marginRight: "2px",
                        borderRadius: "5px",
                      }}
                    >
                      <FaFileImage fontSize="25px" />
                    </div>
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={(e) => {
                        postPicture(e.target.files[0]);
                      }}
                      id="uploadImg"
                      hidden
                    />
                  </label>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label htmlFor="uploadPdf">
                    <div
                      style={{
                        background: `${pdfLoading ? "maroon" : "orange"}`,
                        padding: "5px",
                        borderRadius: "5px",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                      }}
                    >
                      <FaFilePdf fontSize="20px" />
                      <HiUpload fontSize="20px" />
                    </div>
                    <input
                      type="file"
                      name="pdf"
                      accept="application/pdf"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                      }}
                      id="uploadPdf"
                      hidden
                    />
                  </label>
                  <div
                    style={{
                      background: `${pdfLoading ? "purple" : "indigo"}`,
                      padding: "10px 0",
                      borderRadius: "5px",
                      fontSize: "15px",
                      width: "80px",
                      color: "white",
                    }}
                    onClick={uploadPdf}
                  >
                    Upload Pdf
                  </div>
                </div>
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb="3" fontFamily="urbanist roboto">
            Click any user to chat
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
