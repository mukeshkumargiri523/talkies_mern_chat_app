import {
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function EditMsgModel({ children, msg, user, setCallFetchMessage }) {
  const [newMsg, setNewMsg] = useState(children);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const toast = useToast();

  async function editMsg() {
    setLoading(true);
    if (msg?.sender._id !== user._id) {
      toast({
        title: "You can change only yours message",
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
      const { data } = await axios.put(
        `/api/v1/messages/edit-message`,
        {
          content: newMsg,
          messageId: msg._id,
        },
        config
      );
      console.log(data);
      setCallFetchMessage((prev) => !prev);
      setLoading(false);
      onClose();
      toast({
        title: "Message Edited Successfully",
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
  async function deleteMsg() {
    setDelLoading(true);
    if (msg?.sender._id !== user._id) {
      toast({
        title: "You can delete only yours message",
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
      let messageId = msg._id;
      const { data } = await axios.delete(
        `/api/v1/messages/delete-message/${messageId}`,

        config
      );
      setCallFetchMessage((prev) => !prev);
      setDelLoading(false);
      onClose();
      if (data) {
        toast({
          title: "Message Deleted Successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
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
      setDelLoading(false);
    }
  }

  return (
    <div>
      {children ? <span onClick={onOpen}>{children}</span> : <></>}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" alignItems="center" justifyContent="center">
            <Input
              placeholder="Enter Your Email"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
            <IconButton
              background={loading ? "darkgreen" : "yellowgreen"}
              icon={<FaEdit color="white" />}
              ml={1}
              onClick={editMsg}
            />
            <IconButton
              background={delLoading ? "red" : "maroon"}
              icon={<MdDelete color="white" />}
              ml={1}
              onClick={deleteMsg}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default EditMsgModel;
