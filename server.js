import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

//Routes
import filesRoutes from './routes/files.js';
import userRoutes from './routes/user.js';

//Scripts
import * as db from './scripts/db.js';

const app = express();
const server = createServer(app);
const port = 3000;
const io = new Server(server);

app.use(express.json());

app.use(filesRoutes);
app.use(userRoutes);

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
let usersKeyup = [];
io.on("connection", (socket) => {

    socket.on("join server", (username,avatar) => {
        const user = {
            id: socket.id,
            name: username,
            avatar: avatar,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
        users.push(user);
        console.log(users);
        io.emit("new user", users);
    });

    socket.on("join room", (roomName, socketId) => {
        socket.join(roomName);
        if (messages[roomName]) {
            const messagesDb = db.findMessages(roomName);
            messagesDb.then((messages) => io.to(roomName).emit("load messages", messages, socketId, rooms[roomName], users));
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
            sender: users.find(obj => obj.id === socket.id).name,
            avatar: users.find(obj => obj.id === socket.id).avatar,
            color: users.find(obj => obj.id === socket.id).color,
        };

        insertMessage(payload);
        io.to(to).emit("new message", payload);

        if (messages[chatName]) {
            messages[chatName].push({
                sender: socket.id,
                content: content,
                color: users.find(obj => obj.id === socket.id).color,
            });
        }
    });
    
    socket.on("keyup", (userName, roomConnected) => {
        if (!usersKeyup.includes(userName)) {
            usersKeyup.push(userName);
            console.log(usersKeyup);
        }
        if (usersKeyup.length > 1) {
            io.emit("keypress user", "mais de 1 usuário está digitando...", roomConnected);
        }else if (usersKeyup.length === 1) {
            io.emit("keypress user", `${userName} está digitando...`, roomConnected);
        }else{
            io.emit("keypress user", "", roomConnected);
        }
        
    });

    socket.on("keyupOff", (userName) => {
        usersKeyup = usersKeyup.filter(u => u !== userName);
    });
});

server.listen(port, () => {
    console.log("server running at port: " + port);
});