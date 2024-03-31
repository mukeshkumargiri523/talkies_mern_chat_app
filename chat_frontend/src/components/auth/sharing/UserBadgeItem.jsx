import { Box } from "@chakra-ui/react";
import React from "react";
import { IoCloseSharp } from "react-icons/io5";

function UserBadgeItem({ user, handleFunc }) {
  return (
    <>
      <Box
        px="2"
        py="1"
        borderRadius="lg"
        m={1}
        mb={2}
        variant="solid"
        fontSize="14"
        bg="teal"
        cursor="pointer"
        display="flex"
        alignItems="center"
        color="white"
      >
        {user?.name} <IoCloseSharp onClick={handleFunc} fontSize="20px" />
      </Box>
    </>
  );
}

export default UserBadgeItem;
