import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import useChatContext from "../../../context/ChatContext";
import UserBadgeItem from "../sharing/UserBadgeItem";
import axios from "axios";
import UserListItem from "../sharing/UserListItem";

function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessage }) {
  const { user, selectedChat, setSelectedChat } = useChatContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [serachResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  async function handleRemoveUser(removeUser) {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admin can remove",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        "Content-type": "application/json",
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        `/api/v1/chats/remove-from-group`,
        { chatId: selectedChat._id, userId: removeUser._id },
        config
      );
      removeUser._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessage();
      setLoading(false);
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

  async function handleSelfRemove(removeUser) {
    try {
      setLoading(true);

      const config = {
        "Content-type": "application/json",
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        `/api/v1/chats/remove-from-group`,
        { chatId: selectedChat._id, userId: removeUser._id },
        config
      );
      removeUser._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessage();
      setLoading(false);
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

  async function handleRenameGroup() {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/v1/chats/rename-group`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setFetchAgain(!fetchAgain);
      setSelectedChat(data);
      fetchMessage();
      setRenameLoading(false);
      toast({
        title: "Group Renamed Successfull",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
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

  async function handleSearchUser(query) {
    setSearch(query);

    if (!query) {
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(
        `/api/v1/users/get-all-users?search=${search}`,
        config
      );
      setSearchResult(data.users);
      setLoading(false);
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

  async function handleAddUser(addUser) {
    if (selectedChat.users.find((u) => u._id === addUser._id)) {
      toast({
        title: "user already in group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admin can add",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        "Content-type": "application/json",
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        `/api/v1/chats/add-to-group`,
        { chatId: selectedChat._id, userId: addUser._id },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessage();
      setLoading(false);
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

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<FaEye />}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="urbanist roboto"
            display="flex"
            justifyContent="center"
          >
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              {selectedChat?.users?.map((user) => (
                <div
                  key={user._id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <UserBadgeItem
                    user={user}
                    handleFunc={() => handleRemoveUser(user)}
                  />
                  {selectedChat?.groupAdmin._id === user._id ? (
                    <span
                      style={{
                        background: "red",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        color: "white",
                      }}
                    >
                      Admin
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Group Name"
                mb={3}
                value={groupChatName}
                isLoading={renameLoading}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="orange"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRenameGroup}
              >
                Rename
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users To Group"
                mb="2"
                onChange={(e) => handleSearchUser(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              serachResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleUserFunc={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={2}
              onClick={() => handleSelfRemove(user)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateGroupChatModal;
