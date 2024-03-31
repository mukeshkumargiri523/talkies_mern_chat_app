import React, { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../../config/chatLogic";
import useChatContext from "../../../context/ChatContext";
import { Avatar, Box, Image, Tooltip } from "@chakra-ui/react";
import EditMsgModel from "./EditMsgModel";
import { format } from "date-fns";
import axios from "axios";
import ViewPdf from "./ViewPdf";

function ScrollableChat({ messages, setCallFetchMessage }) {
  const { user } = useChatContext();
  const [pdfFile, setPdfFile] = useState("");
  const [pdfData, setPdfData] = useState([]);
  async function getPdfFile(msg) {
    setPdfFile("");
    let messageId = msg._id;
    const config = {
      headers: { Authorization: `Bearer ${user?.token}` },
    };

    let res = await axios.get(`/get-pdf-file/${messageId}`, config);

    if (res.data.success === true) {
      console.log(res.data.pdfData.pdf);
      setPdfData([...pdfData, res.data.pdfData]);
      setPdfFile(
        `https://talkies-mern-chat-app.onrender.com/files/${res?.data?.pdfData?.pdf}`
      );
      return;
    } else {
      return;
    }
  }
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((msg, i) => (
          <div style={{ display: "flex" }} key={i}>
            {(isSameSender(messages, msg, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip>
                <Avatar
                  mt="8px"
                  mr="1"
                  size="sm"
                  cursor="pointer"
                  name={msg?.sender?.name}
                  src={msg?.sender?.pic}
                />
              </Tooltip>
            )}
            <div
              style={{
                backgroundColor: `${
                  msg.sender._id === user._id ? "blue" : "#DE3163"
                }`,
                maxWidth: "90%",
                padding: "7px 10px",
                borderRadius: "20px",
                color: "white",
                marginLeft: isSameSenderMargin(messages, msg, i, user._id),
                marginTop: isSameUser(messages, msg, i, user._id) ? 2 : 10,
              }}
            >
              <EditMsgModel
                msg={msg}
                user={user}
                setCallFetchMessage={setCallFetchMessage}
              >
                {msg.content}
              </EditMsgModel>
              {msg.picture && (
                <Box bg="maroon" boxSize="xs" overflow="hidden">
                  {/* <Avatar mt="3px" size="lg" src={msg?.picture} /> */}
                  <Image src={msg?.picture} alt="pic" />
                </Box>
              )}
              <span
                style={{ fontSize: "10px" }}
                onClick={() => getPdfFile(msg)}
              >
                show pdf
              </span>
              {pdfData.map((pdff) => {
                return pdff.messageId === msg._id ? (
                  <ViewPdf pdfFile={pdfFile} key={pdff._id} />
                ) : (
                  <></>
                );
              })}
              <span
                style={{
                  background: "#5D3FD3",
                  fontSize: "11px",
                  borderRadius: "6px",
                  padding: "1px 3px",
                }}
              >
                {format(msg.updatedAt, "yyyy-MM-dd hh:mm:ss")}
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
}

export default ScrollableChat;
