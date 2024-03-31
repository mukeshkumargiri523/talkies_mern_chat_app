import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaBell, FaChevronDown } from "react-icons/fa6";
import useChatContext from "../../../context/ChatContext";
import ProfileModel from "./ProfileModel";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import ChatLoading from "../sharing/ChatLoading";
import UserListItem from "../sharing/UserListItem";
import { getSenderUser } from "../../../config/chatLogic";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = useChatContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const toast = useToast();
  function logoutHandler() {
    localStorage.removeItem("chatUserInfo");
    navigate("/");
  }

  async function handleSearch() {
    if (!search) {
      toast({
        title: "Please Enter user name",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
    }
    try {
      setLoading(true);

      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(
        `/api/v1/users/get-all-users?search=${search}`,
        config
      );

      setLoading(false);
      setSearchResult(data?.users);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  }

  async function accessUserChat(userId) {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/v1/chats/access-chat`,
        { userId },
        config
      );
      if (!chats.find((c) => c?._id === data?._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      setLoadingChat(false);
    }
  }
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="violet"
        w="100%"
        p="5px 10px"
        borderWidth="7px"
        style={{ color: "white" }}
      >
        <Tooltip
          backgroundColor="red"
          label="Serach Users for Chat"
          hasArrow
          placement="bottom-end"
        >
          <Button backgroundColor="skyblue" variant="ghost" onClick={onOpen}>
            <FaSearch />
            <Text display={{ base: "none", md: "flex" }} px="5">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="urbanist roboto">
          Talkies
        </Text>
        <div>
          <Menu>
            <MenuButton p={"3px"} mr={2}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
                style={{ width: "20px", height: "16px" }}
              />
              <FaBell fontSize={"28px"} />
            </MenuButton>
            <MenuList pl="3" color="black">
              <span style={{ color: "red", fontWeight: "bold" }}>
                {!notification.length && "No New Messages"}
              </span>
              {notification &&
                notification.map((notify) => (
                  <MenuItem
                    key={notify?._id}
                    color="green"
                    fontWeight="bold"
                    onClick={() => {
                      setSelectedChat(notify.chat);
                      setNotification(notification.filter((n) => n !== notify));
                    }}
                  >
                    {notify?.chat.isGroupChat
                      ? `New Message in ${notify?.chat.chatName}`
                      : `New Message from ${getSenderUser(
                          user,
                          notify?.chat.users
                        )}`}
                  </MenuItem>
                ))}
            </MenuList>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FaChevronDown fontSize={"10px"} />}
              >
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user?.name}
                  src={user?.pic}
                />
              </MenuButton>
              <MenuList>
                <ProfileModel user={user}>
                  <MenuItem color="blue">My Profile</MenuItem>
                </ProfileModel>
                <MenuDivider color="blue" />
                <MenuItem color="blue" onClick={logoutHandler}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb="3">
              <Input
                placeholder="Search By Name"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!loading ? (
                <Button onClick={handleSearch}>
                  <FaSearch color="purple" fontSize="30px" />
                </Button>
              ) : (
                <Button>
                  <AiOutlineLoading3Quarters color="purple" fontSize="30px" />
                </Button>
              )}
            </Box>
            {!loading ? (
              searchResult?.map((user) => (
                <UserListItem
                  key={user?._id}
                  user={user}
                  handleUserFunc={() => accessUserChat(user?._id)}
                />
              ))
            ) : (
              <ChatLoading />
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
