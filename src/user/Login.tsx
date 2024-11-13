import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Link,
  Spinner,
  ChakraProvider,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { loginUser } from './loginApi';
import { RootState, Session } from '../model/common';
import { CustomError } from '../model/CustomError';
import { useDispatch, useSelector } from 'react-redux';
import { SET_SESSION } from '../redux';
import { extendTheme } from '@chakra-ui/react';

// Define your custom theme with a dark color scheme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#475161',
      500: '#13262F', // Change this to your desired color
    },
  },
});

export function Login() {
  const [error, setError] = useState({} as CustomError);
  const session = useSelector((state: RootState) => state.session.session || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    loginUser(
      {
        user_id: -1,
        username: data.get('login') as string,
        password: data.get('password') as string,
      },
      (result: Session) => {
        setLoading(false);
        dispatch(SET_SESSION(result));
        sessionStorage.setItem('session', JSON.stringify(result));
        console.log(session);
        form.reset();
        setError(new CustomError(''));
        navigate('/messages');
      },
      (loginError: CustomError) => {
        setLoading(false);
        console.log(loginError);
        setError(loginError);
        dispatch(SET_SESSION({} as Session));
      }
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <Box
        maxW="xl"
        minWidth="500px"
        margin="auto"
        p={8}
        borderWidth="1px"
        marginTop="20"
        borderRadius="md"
        boxShadow="md"
        color="brand.500" // Set the text color using the theme
      >
        <Heading mb={4} textAlign="center" size="lg">
          Connexion
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Login</FormLabel>
            <Input name="login" placeholder="Enter your login" />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" placeholder="Enter your password" />
          </FormControl>
          <Button type="submit" width="100%" colorScheme="brand" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Connexion'}
          </Button>
        </form>

        {session.token && (
          <Box mt={4}>
            <span>
              {session.username} : {session.token}
            </span>
          </Box>
        )}

        {error.message && (
          <Box mt={4} color="red.500">
            <span>{error.message}</span>
          </Box>
        )}

        <Box mt={4} textAlign="center">
          <span>Vous n&apos;avez pas encore de compte ?</span>{' '}
          <Link as={RouterLink} to="/signup" color="brand.500">
            Créer un compte
          </Link>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
