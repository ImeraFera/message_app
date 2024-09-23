// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı : ', socket.id);


    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} joined room: ${roomName}`);
    });

    socket.on('send_message', (data) => {
        const { room, message, sender } = data;
        console.log(data)
        console.log(`Message received: ${message} from ${sender}`);
        io.in(room).emit('receive_message', {
            senderId: sender,
            content: message
        });

    });


    socket.on('disconnect', () => {
        console.log('Bir kullanıcı ayrıldı');
    });
});

server.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor');
});
