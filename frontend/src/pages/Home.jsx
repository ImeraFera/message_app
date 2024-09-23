
import { Box, Button, CardActionArea, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, IconButton, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CurrentUserItem from '../components/CurrentUserItem'
import FriendListItem from '../components/FriendListItem'
import FriendItem from '../components/FriendItem'
import SendIcon from '@mui/icons-material/Send';
import { useFormik } from 'formik'
import AddIcon from '@mui/icons-material/Add';
import MessageItem from '../components/MessageItem'
import { useDispatch, useSelector } from 'react-redux'
import { getUserFriends } from '../redux/slices/userSlice'
import { io } from 'socket.io-client';
import { roomNameGenerator } from '../utils/roomNameGenerator';

const CustomTextField = ({ label, ...props }) => (
    <TextField
        label={label}
        color='secondary'
        size='small'
        variant='filled'
        autoComplete='off'
        placeholder='Message ...'
        sx={{
            '& .MuiInputBase-input': {
                color: 'white',
            },
            '& .MuiInputLabel-root': {
                color: 'white',
            },
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
            },
        }}
        {...props}
    />
);

const socket = io("http://localhost:3000");

function Home() {

    const dispatch = useDispatch();

    const [selectedUser, setselectedUser] = useState(null)
    const [message, setmessage] = useState('');
    const [roomName, setroomName] = useState(null);
    const [messageList, setmessageList] = useState([]);

    const dialogFormik = useFormik({
        initialValues: {
            email: '',

        },
        onSubmit: (values) => {
            console.log(values)
        }
    })


    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('receive_message', (msg) => {
            console.log('Message received from server:', msg);
            setmessageList(prevMessageList => [...prevMessageList, msg]);
        });

        return () => {
            socket.off('receive_message');
            socket.off('connect');
            socket.off('disconnect');
        };

    }, []);



    const handleJoinRoom = (otherUser) => {
        if (!userData || !otherUser) {
            console.error("User data or selected user is missing");
            return;
        }

        setselectedUser(otherUser);
        const generatedRoomName = roomNameGenerator(userData, otherUser);
        setroomName(generatedRoomName);

        socket.emit('join_room', generatedRoomName);
        console.log('Joining room:', generatedRoomName);

    }

    const handleSendMessage = () => {
        if (message && roomName) {
            socket.emit('send_message', {
                room: roomName,
                message: message,
                sender: userData.id
            });
            setmessage('');
        } else {
            console.error("Message or roomName is missing");
        }
    }



    const loading = useSelector(({ user }) => user.loading);
    const userData = useSelector(({ user }) => user.currentUser)
    const userList = useSelector(({ user }) => user.friends);

    useEffect(() => {
        dispatch(getUserFriends());
    }, [dispatch])

    if (loading) {
        return (
            <Box
                width={'100%'}
                height={'100%'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <CircularProgress></CircularProgress>
            </Box>
        )
    }

    return (

        <Grid2
            height={'90vh'}
            container
            sx={{
                backdropFilter: 'blur(1px)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
            mt={4}
        >
            <Grid2 size={3}>
                <CurrentUserItem
                    username={userData.username}
                    avatar={userData.avatar}
                ></CurrentUserItem>
                <Divider sx={{ bgcolor: 'white' }}></Divider>
                <Box
                    p={2}
                >
                    <Dialog
                        open={open}
                        onClose={handleClose}
                    >
                        <DialogTitle>Add Friend</DialogTitle>
                        <DialogContent>
                            <form action=""
                                onSubmit={dialogFormik.handleSubmit}
                            >
                                <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="name"
                                    name="email"
                                    label="Email Address"
                                    value={dialogFormik.values.email}
                                    onChange={dialogFormik.handleChange}
                                    type="email"
                                    fullWidth
                                    variant="standard"
                                />
                            </form>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={dialogFormik.handleSubmit} type="submit">Send Invite</Button>
                        </DialogActions>
                    </Dialog>

                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
                        <TextField
                            variant='outlined'
                            size='small'
                            color='secondary'
                            label='Search'
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'secondary.main',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                },
                                '&:focused .MuiInputLabel-root': {
                                    color: 'secondary.main',
                                },
                            }}
                        >

                        </TextField>

                        <IconButton onClick={handleClickOpen}>
                            <AddIcon sx={{ color: 'white' }}></AddIcon>
                        </IconButton>
                    </Box>

                </Box>

                <Box mt={1}>
                    <Stack flexDirection={'column'} spacing={1}>
                        {(userList?.map((user, index) => {
                            return (
                                <CardActionArea
                                    key={index}
                                    onClick={() => handleJoinRoom(user)}>
                                    <FriendListItem
                                        avatar={user.avatar}
                                        username={user.username}></FriendListItem>
                                </CardActionArea>
                            )
                        }))}

                    </Stack>
                </Box>
            </Grid2>
            <Divider orientation='vertical' flexItem sx={{ bgcolor: 'white' }}></Divider>
            <Grid2 size={'grow'} display={'flex'} flexDirection={'column'}>
                {(selectedUser ? (
                    <>
                        <FriendItem username={selectedUser.username} avatar={selectedUser.avatar}></FriendItem>
                        <Divider flexItem sx={{ bgcolor: 'white' }}></Divider>
                        <Box
                            display={'flex'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            height={'100%'}
                            width={'100%'}
                        >
                            <Stack
                                height={'75vh'}
                                width={'100%'}
                                sx={{
                                    overflowY: 'auto',
                                }}
                            >
                                {messageList?.map((message, index) => {


                                    return message.senderId === userData.id ? (
                                        <MessageItem key={index}
                                            content={message.content}
                                            isMyMessage={true} />
                                    ) : (
                                        <MessageItem key={index}
                                            content={message.content}

                                            isMyMessage={false} />
                                    )
                                })}
                            </Stack>
                        </Box>
                        <Box display={'flex'} height={'100%'} alignItems={'flex-end'}>
                            <Box
                                display={'flex'}
                                width={'100%'}
                                bgcolor={'#874687'}
                            >
                                <CustomTextField
                                    type='text'
                                    name='message'
                                    id='message'
                                    value={message}
                                    onChange={(e) => setmessage(e.target.value)}
                                    fullWidth
                                />
                                <IconButton
                                    onClick={handleSendMessage}
                                >
                                    <SendIcon sx={{ color: 'white' }}></SendIcon>
                                </IconButton>
                            </Box>

                        </Box>
                    </>

                ) : (
                    <>
                        <Box
                            height={'100%'}
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'center'}
                        >
                            <Typography
                                variant='h4'
                                color='lightgray'
                            >
                                You can select a user to send message.
                            </Typography>
                        </Box>
                    </>
                ))}

            </Grid2>
            {/* <Divider orientation='vertical' flexItem sx={{ bgcolor: 'white' }}></Divider>

            <Grid2 size={3}>

            </Grid2> */}
        </Grid2>

    )

}

export default Home