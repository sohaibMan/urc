import React, { useState, useEffect } from "react";
import { Box, Heading, Spinner, Select, Text } from "@chakra-ui/react";
import { listUsers } from "./usersApi";
import { RootState, UserPublic } from "../model/common";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UserList = () => {
  const { id_receiver } = useParams();
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useSelector((state: RootState) => state.session.session);
  const navigate = useNavigate();
  const { id } = useParams();
  const receiver_id = (id == null || id == undefined ? -1 : id) as number;
  const [selectedUser, setSelectedUser] = useState<string | number>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await listUsers();
        setUsers(usersData);
        const isReceiverInUsers = usersData.some(
          (user) => user.user_id === receiver_id
        );

        if (!isReceiverInUsers) {
          navigate("/messages");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value);
  };

  const handleUserClick = () => {
    if (selectedUser !== "") {
      // Handle the selected user, e.g., navigate to a specific user's messages
      navigate(`/messages/user/${selectedUser}`);
    }
  };

  return (
    <Box width={['80%', '70%']}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="30vh"
        >
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box>
          <Heading
            fontSize="2xl"
            mb="4"
            padding="4"
            color="#13262F"
            borderBottom="1px solid teal"
          >
            UTILISATEURS: 
          </Heading>
          <Select
            value={selectedUser}
            onChange={handleUserChange}
            mb="4"
            color="black"
          >
            <option value="" disabled>
              Sélectionnez un utilisateur
            </option>
            {users.map((user) =>
              user.user_id !== session.id ? (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ) : null
            )}
          </Select>
          <Box
            onClick={handleUserClick}
            backgroundColor={receiver_id ? "gray.300" : "gray.100"}
            p="3"
            mb="2"
            borderRadius="5px"
            cursor="pointer"
            _hover={{ backgroundColor: "gray.100" }}
          >
            <Text fontSize="lg" fontWeight="bold" color="black">
              {selectedUser !== "" &&
                users.find((user) => user.user_id === +selectedUser)?.username}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserList;
