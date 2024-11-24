import React, {useState, useEffect} from "react";
import {Box, Heading, Spinner, Avatar, Text, VStack, HStack, Divider} from "@chakra-ui/react";
import {listUsers} from "./usersApi";
import {RootState, UserPublic} from "../model/common";
import {useSelector} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";

const UserList = () => {
    const [users, setUsers] = useState<UserPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const session = useSelector((state: RootState) => state.session.session);
    const navigate = useNavigate();
    const {id} = useParams();
    const receiver_id = id ? parseInt(id) : null;


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await listUsers();
                setUsers(usersData);

                if (receiver_id === null && usersData.length > 0 && window.location.href.includes("user")) {
                    navigate(`/messages/user/${usersData[0].user_id}`);
                } else {
                    const isReceiverInUsers = usersData.some(
                        (user) => user.user_id === receiver_id
                    );

                    if (!isReceiverInUsers) {
                        navigate("/messages");
                    }
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
    }, [receiver_id, navigate]);

    const handleUserClick = (user_id: number) => {
        navigate(`/messages/user/${user_id}`);
    };

    return (
        <Box width={['80%', '70%']} p={4} borderRadius="md" borderWidth={"thin"} bg="white">
            {loading ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="30vh"
                >
                    <Spinner size="xl"/>
                </Box>
            ) : (
                <VStack spacing={4} align="stretch">
                    <Heading
                        fontSize="2xl"
                        mb="4"
                        color="#13262F"
                        borderBottom="1px solid teal"
                    >
                        Utilisateurs
                    </Heading>
                    {users.map((user) =>
                        user.user_id !== session.id ? (
                            <Box
                                key={user.user_id}
                                p={3}
                                borderRadius="md"
                                _hover={{bg: "gray.100", cursor: "pointer"}}
                                onClick={() => handleUserClick(user.user_id)}
                            >
                                <HStack spacing={4}>
                                    <Avatar name={user.username}/>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold">{user.username}</Text>
                                        <Text fontSize="sm" color="gray.500">
                                            {user.username}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Divider mt={2}/>
                            </Box>
                        ) : null
                    )}
                </VStack>
            )}
        </Box>
    );
};

export default UserList;