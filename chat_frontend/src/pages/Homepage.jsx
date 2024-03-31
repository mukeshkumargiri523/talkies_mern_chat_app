import React, { useEffect } from "react";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Signup from "../components/auth/Signup";
import Login from "../components/auth/Login";
import { useNavigate } from "react-router-dom";
function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("chatUserInfo");

    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        marginTop="25px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="4-px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          fontSize="4xl"
          fontFamily="Urbanist"
          fontWeight="bold"
          color="purple"
        >
          Chat-And-Connect
        </Text>
      </Box>
      <Box
        marginTop="5px"
        bg="white"
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="2px"
      >
        <Tabs>
          <TabList mb="2rem">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
