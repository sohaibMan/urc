import React from 'react';
import { Flex, Box, Link, Text, Avatar, IconButton } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { CLEAR_SESSION } from './redux';
import { RootState } from './model/common';
import { FiLogOut } from 'react-icons/fi';

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
      <Box display="flex" alignItems="center">
        <Avatar size="sm" name="UBO Relay Chat" src="/path/to/logo.png" mr={2} />
        <Text fontSize="xl" fontWeight="bold">UBO Relay Chat</Text>
      </Box>
      <Box display="flex" alignItems="center">
        <Link as={RouterLink} to="/messages" color="white" mr={4}>
          Messages
        </Link>
        <Link as={RouterLink} to="/profile" color="white" mr={4}>
          Profile
        </Link>
        {session.token ? (
          <IconButton
            icon={<FiLogOut />}
            variant="outline"
            color="white"
            onClick={onLogout}
            aria-label="Logout"
          />
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