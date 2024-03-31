import { Skeleton, Stack } from "@chakra-ui/react";
import React from "react";

function ChatLoading() {
  return (
    <>
      <Stack>
        <Skeleton height="70px" />
        <Skeleton height="70px" />
        <Skeleton height="70px" />
        <Skeleton height="70px" />
        <Skeleton height="70px" />
      </Stack>
    </>
  );
}

export default ChatLoading;
