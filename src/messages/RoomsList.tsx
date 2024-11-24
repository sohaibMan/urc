import React, {useState, useEffect} from "react";
import {Box, Heading, Spinner, Avatar, Text, VStack, HStack, Divider} from "@chakra-ui/react";
import {listRooms} from "./roomsApi";
import {RootState, Room} from "../model/common";
import {useSelector} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";

const RoomsList = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const session = useSelector((state: RootState) => state.session.session);
    const navigate = useNavigate();
    const {id} = useParams();
    const receiver_id = id ? parseInt(id) : null;

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsData = await listRooms();
                setRooms(roomsData);

                if (receiver_id === null && roomsData.length > 0 && window.location.href.includes("room")) {
                    navigate(`/messages/room/${roomsData[0].room_id}`);
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
        fetchRooms();
    }, [receiver_id, navigate]);

    const handleRoomClick = (room_id: number) => {
        navigate(`/messages/room/${room_id}`);
    };

    return (
        <Box width={['80%', '70%']} p={4} mt={2} borderRadius="md" borderWidth={"thin"} bg="white">
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
                        Salons
                    </Heading>
                    {rooms.map((room) =>
                        <Box
                            key={room.room_id}
                            p={3}
                            borderRadius="md"
                            _hover={{bg: "gray.100", cursor: "pointer"}}
                            onClick={() => handleRoomClick(room.room_id)}
                        >
                            <HStack spacing={4}>
                                <Avatar name={room.name}/>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold">{room.name}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {room.name}
                                    </Text>
                                </VStack>
                            </HStack>
                            <Divider mt={2}/>
                        </Box>
                    )}
                </VStack>
            )}
        </Box>
    );
};

export default RoomsList;