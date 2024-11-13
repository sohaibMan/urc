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
import { registerUser } from './signupApi';
import { User } from '../model/common';
import { useDispatch } from 'react-redux';
import { SET_SESSION } from '../redux';
import { extendTheme } from '@chakra-ui/react';

// Define your custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f9fafb',
      500: '#13262F', // Change this to your desired color
    },
  },
});

const Signup: React.FC = () => {
  const [registrationData, setRegistrationData] = useState<User>({
    user_id: -1,
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<{ message?: string }>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // Appeler la fonction registerUser ici
    registerUser(
      registrationData,
      (session) => {
        // Gérer le résultat (par exemple, rediriger l'utilisateur vers une page de connexion)
        console.log('User registered successfully:', session);
        setLoading(false);
        dispatch(SET_SESSION(session));
        navigate('/messages');
      },
      (registrationError) => {
        setLoading(false);
        // Gérer les erreurs (par exemple, afficher un message d'erreur)
        setError({ message: registrationError.message });
      }
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegistrationData((prevData) => ({ ...prevData, [name]: value }));
    console.log(name + ' ' + value);
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
          Inscription
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              placeholder="Enter your username"
              value={registrationData.username}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={registrationData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={registrationData.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button type="submit" width="100%" colorScheme="brand" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Inscription'}
          </Button>
        </form>

        {error.message && (
          <Box mt={4} color="red.500">
            <span>{error.message}</span>
          </Box>
        )}

        <Box mt={4} textAlign="center">
          <span>Vous avez déjà un compte ?</span>{' '}
          <Link as={RouterLink} to="/login" color="brand.500">
            Connectez-vous
          </Link>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default Signup;
