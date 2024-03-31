import React, { useEffect, useState } from "react";
import useChatContext from "../../context/ChatContext";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { FaPlus } from "react-icons/fa6";
import ChatLoading from "./sharing/ChatLoading";
import { getSenderFullDetail, getSenderUser } from "../../config/chatLogic";
import GroupChatModel from "./miscellaneous/GroupChatModel";

function MyChat({ fetchAgain }) {
  const { user, selectedChat, setSelectedChat, chats, setChats } =
    useChatContext();
  const toast = useToast();
  const [loggedUser, setLoggedUser] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchChatsOfUser() {
    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/v1/chats/get-chats`, config);
      setLoading(false);
      setChats(data);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoggedUser(user);
    fetchChatsOfUser();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p="3"
      bg="whitesmoke"
      w={{ base: "100%", md: "40%" }}
      borderRadius="lg"
      borderWidth="4px"
    >
      <Box
        pb="3"
        px="4"
        fontSize={{ base: "25px", md: "30px" }}
        fontFamily="urbanist roboto"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModel>
          <Button
            display="flex"
            fontSize={{ base: "16px", md: "19px", lg: "25px" }}
            rightIcon={<FaPlus />}
          >
            New Group Chat
          </Button>
        </GroupChatModel>
      </Box>
      <Box
        p="4"
        display="flex"
        bg="FA5F55"
        flexDirection="column"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {!loading ? (
          <Stack overflowY="scroll">
            {chats?.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#A52A2A" : "#FF3131"}
                color="white"
                px="3"
                py="2"
                borderRadius="lg"
                display="flex"
                gap="2"
                alignItems="center"
                key={chat?._id}
              >
                {!chat?.isGroupChat ? (
                  <Tooltip>
                    <Avatar
                      mt="8px"
                      mr="1"
                      size="sm"
                      cursor="pointer"
                      src={getSenderFullDetail(user, chat?.users).pic}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <Avatar
                      mt="8px"
                      mr="1"
                      size="sm"
                      cursor="pointer"
                      src={chat?.pic}
                    />
                  </Tooltip>
                )}
                <Text>
                  {!chat?.isGroupChat
                    ? getSenderUser(loggedUser, chat?.users)
                    : chat?.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}

export default MyChat;
