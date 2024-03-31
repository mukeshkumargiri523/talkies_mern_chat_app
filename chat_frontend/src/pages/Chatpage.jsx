import React, { useState } from "react";
import useChatContext from "../context/ChatContext";
import { Box } from "@chakra-ui/react";
import MyChat from "../components/auth/MyChat";
import ChatBox from "../components/auth/ChatBox";
import SideDrawer from "../components/auth/miscellaneous/SideDrawer";

function Chatpage() {
  const { user } = useChatContext();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="90vh"
        p="10px"
      >
        {user && <MyChat fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
}

export default Chatpage;
