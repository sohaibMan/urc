import React from 'react';
import { Flex, Box, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux"
import { CLEAR_SESSION } from './redux';
import { RootState } from './model/common';

interface NavBarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = () => {
  const session = useSelector((state: RootState) => state.session.session);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    dispatch(CLEAR_SESSION());
    console.log("Déconnexion !");
    navigate("/login");
  }

  return (
    <Flex p={4} bg="#13262F" color="#E9E6FF" align="center" justify="space-between">
      <Box>
        <Text fontSize="xl">UBO Relay Chat</Text>
      </Box>
      <Box>
        {session.token ? (
          <Link onClick={onLogout} color="white" mr={4}>
            Déconnexion
          </Link>
        ) : (
          <Link as={RouterLink} to="/login" color="white">
            Connexion
          </Link>
        )}
      </Box>
    </Flex>
  );
};

export default NavBar;
