// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Store connected users
const users = {};

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for a new user joining the chat
    socket.on('newUser', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('userJoined', { username, message: `${username} has joined the chat.` });
    });

    // Listen for messages
    socket.on('sendMessage', (data) => {
        const message = data.message;
        io.emit('receiveMessage', { username: users[socket.id], message });
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('userLeft', { username: users[socket.id], message: `${users[socket.id]} has left the chat.` });
            delete users[socket.id];
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});