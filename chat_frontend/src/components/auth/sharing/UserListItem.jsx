import React from "react";
import { Avatar, Box, Text } from "@chakra-ui/react";

function UserListItem({ user, handleUserFunc }) {
  return (
    <>
      <Box
        onClick={handleUserFunc}
        cursor="pointer"
        bg="#FAA0A0"
        _hover={{ background: "darkgreen", color: "white" }}
        w="100%"
        display="flex"
        alignItems="center"
        color="black"
        px="3"
        py="2"
        mb="2"
      >
        <Avatar
          mr="2"
          size="sm"
          cursor="pointer"
          name={user?.name}
          src={user?.pic}
        />
        <Box>
          <Text>{user?.name}</Text>
          <Text fontSize="xs">
            <b>Email : </b>
            {user?.email}
          </Text>
        </Box>
      </Box>
    </>
  );
}

export default UserListItem;
