import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const port = 3000;
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/script.js', (req, res) => {
    res.sendFile(join(__dirname, 'public/script.js'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(join(__dirname, 'public/style.css'));
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'));
});

let users = [];

const rooms = {
    general: 'Geral',
    random: 'Aleatório',
    php: 'PHP',
    javascript: 'Javascript'
};

const messages = {
    general: [],
    random: [],
    php: [],
    javascript: [],
};

const colors = ['#d1e2f3', '#ddffc3', '#fbb6b6', '#f1e8a5', '#c1c1bf'];

io.on("connection", (socket) => {

    socket.on("join server", () => {
        const user = {
            id: socket.id,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
        users.push(user);
        io.emit("new user", users);
    });

    socket.on("join room", (roomName, socketId) => {
        socket.join(roomName);
        if (messages[roomName]) {
            io.to(roomName).emit("load messages", messages[roomName], socketId, rooms[roomName], users);
        }
    });

    socket.on("leave room", (roomName) => {
        socket.leave(roomName);
    });

    socket.on("disconnect", () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit("new user", users);
    });

    socket.on("send message", (content, to, chatName) => {
        const payload = {
            content: content,
            chatName: chatName,
            sender: socket.id,
            color: users.find(obj => obj.id === socket.id).color,
        };
        io.to(to).emit("new message", payload);

        if (messages[chatName]) {
            messages[chatName].push({
                sender: socket.id,
                content: content,
                color: users.find(obj => obj.id === socket.id).color,
            });
        }
    });
});

server.listen(port, () => {
    console.log("server running at port: " + port);
});