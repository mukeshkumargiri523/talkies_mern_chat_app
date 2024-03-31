import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import useChatContext from "../../../context/ChatContext";
import axios from "axios";
import UserListItem from "../sharing/UserListItem";
import UserBadgeItem from "../sharing/UserBadgeItem";

function GroupChatModel({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [pics, setPics] = useState("");

  const toast = useToast();
  const { user, chats, setChats } = useChatContext();

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
      setSearchResults(data.users);
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

  async function handleGroup(addUser) {
    if (selectedUsers.includes(addUser)) {
      toast({
        title: "User already Added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, addUser]);
  }

  async function handleRemoveUser(userId) {
    setSelectedUsers(selectedUsers?.filter((sel) => sel?._id !== userId));
  }

  async function handleSubmit() {
    setLoading(true);
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/v1/chats/new-group-chat`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers?.map((user) => user._id)),
          pics,
        },
        config
      );
      setChats([data, ...chats]);
      setLoading(false);
      onClose();
      toast({
        title: "Group Created Successfull",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Error Occured",
        description: err?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  }

  async function postGroupPic(pic) {
    setPicLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (
      pic.type === "image/jpeg" ||
      pic.type === "image/png" ||
      pic.type === "image/avif" ||
      pic.type === "image/jpg"
    ) {
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
          setPics(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image type jpeg/jpg/png",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  }

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="32px"
            fontFamily="urbanist roboto"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Group Name"
                mb="2"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users To Group"
                mb="2"
                onChange={(e) => handleSearchUser(e.target.value)}
              />
            </FormControl>
            {/* selected Users */}
            {selectedUsers?.map((user) => (
              <UserBadgeItem
                key={user?._id}
                user={user}
                handleFunc={() => handleRemoveUser(user._id)}
              ></UserBadgeItem>
            ))}
            {loading ? (
              <>
                <Spinner />
              </>
            ) : (
              searchResults
                ?.slice(0, 4)
                ?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleUserFunc={() => handleGroup(user)}
                  ></UserListItem>
                ))
            )}
            {/*adding group pic */}
            <FormControl id="pic">
              <FormLabel>Upload Group Pic</FormLabel>
              <Input
                type="file"
                p={2}
                accept="images/*"
                onChange={(e) => postGroupPic(e.target.files[0])}
              ></Input>
            </FormControl>
            <Text color="blue">
              {picLoading ? "Group Pic Uploading.." : <></>}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default GroupChatModel;
