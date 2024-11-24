import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, FormControl, Input, Spinner, Text} from '@chakra-ui/react';
import {useNavigate, useParams} from 'react-router-dom';
import {getMessages, sendMessage} from './messagesApi';
import {useSelector} from 'react-redux';
import {Message, RootState, Session} from '../model/common';
import {put} from "@vercel/blob";
import {useDropzone} from 'react-dropzone';

const Chat = ({isRoom}: { isRoom: boolean }) => {
    const session = useSelector((state: RootState) => state.session.session);
    const navigate = useNavigate();
    const [message_text, set_message_text] = useState('');
    const [message_list, set_message_list] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const {id} = useParams();
    const receiver_id = id ? +id : 0;
    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollMessageContainerToBottom();
    }, [message_list]);

    const scrollMessageContainerToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    const verifyParams = (session: Session): boolean => {
        if (session.token && session.id && id) {
            return true;
        } else {
            navigate('/login');
            return false;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (message_text.trim().length === 0 || !verifyParams(session)) {
            return;
        }
        const msg = message_text;
        set_message_text('');
        set_message_list([
            ...message_list,
            {
                id: Math.floor(Math.random() * 99999),
                sender_id: session.id!,
                receiver_id: receiver_id!,
                img_url: '',
                message_text: msg,
                timestamp: new Date().toLocaleTimeString(),
            },
        ]);
        await sendMessage({
            sender_id: session.id!,
            receiver_id: receiver_id!,
            img_url: '',
            message_text: msg,
        }, isRoom);
    };

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const {url} = await put(`uploads/${file.name}`, file, {
                access: 'public',
                token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN
            });
            console.log("File uploaded successfully:", url);
            set_message_list([
                ...message_list,
                {
                    id: Math.floor(Math.random() * 99999),
                    sender_id: session.id!,
                    receiver_id: receiver_id!,
                    img_url: url,
                    message_text: '',
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
            await sendMessage({
                sender_id: session.id!,
                receiver_id: receiver_id!,
                img_url: url,
                message_text: ''
            }, isRoom);
        }
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    const fetchMessages = async () => {
        try {
            if (!receiver_id) return;
            setLoadingMessages(true);
            const messagesData = await getMessages({sender_id: session.id!, receiver_id: receiver_id}, isRoom);
            set_message_list(messagesData);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [id]);

    return (
        <Box width="70%">
            <Box
                borderRadius="24px"
                borderWidth="1px"
                margin="5px"
                padding="15px"
                ref={messageContainerRef}
                marginTop="auto"
                width="100%"
                height="60vh"
                overflowY="auto"
            >
                {loadingMessages ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Spinner size="xl"/>
                    </Box>
                ) : (
                    message_list.map((message) => (
                        <Box key={message.id} textAlign={message.sender_id === session.id ? 'right' : 'left'} mb={2}>
                            <Box
                                p={3}
                                borderRadius="md"
                                border="1px solid #ccc"
                                display="inline-block"
                                minWidth="50px"
                                maxWidth="50%"
                                backgroundColor={message.sender_id === session.id ? '#fcefb4' : 'white'}
                            >
                                {message.message_text && (
                                    <Text fontSize="16" fontWeight="bold" color="black">
                                        {message.message_text}
                                    </Text>
                                )}
                                {message.img_url && (
                                    <Box>
                                        <img src={message.img_url} alt="uploaded" style={{maxWidth: '100%'}}/>
                                    </Box>
                                )}
                                <Box fontSize="11" color="gray.400">
                                    {message.timestamp}
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
            <Box id="input_box" width="100%">
                <form onSubmit={handleSubmit}>
                    <FormControl mb={4}>
                        <Input
                            disabled={loadingMessages}
                            name="message_text"
                            placeholder="Saisissez votre message..."
                            value={message_text}
                            onChange={(e) => set_message_text(e.target.value)}
                            borderColor="gray.300"
                            _hover={{borderColor: 'gray.500'}}
                            _focus={{borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500'}}
                            autoComplete={'off'}
                        />
                    </FormControl>
                    {!loadingMessages && <Box
                        {...getRootProps()}
                        border="2px dashed gray"
                        borderRadius="md"
                        p={4}
                        my={2}
                        textAlign="center"
                        _hover={{borderColor: 'gray.500'}}
                        _focus={{borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500'}}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <Text>Déposez les fichiers ici...</Text>
                        ) : (
                            <Text>Téléchargez vos photos ici</Text>
                        )}
                    </Box>}
                    <Button
                        disabled={loadingMessages}
                        type="submit"
                        width="100%"
                        bg="#13262F"
                        color="white"
                    >
                        Envoyer
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default Chat;