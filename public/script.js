const socket = io();
var roomConnected = null;

const query = window.location.href;

const url = new URL(query);
const params = new URLSearchParams(url.search);
const username = params.get('username');
const fullUrl = url.search;
const avatarStart = fullUrl.indexOf('avatar=') + 'avatar='.length;
const avatar = decodeURIComponent(fullUrl.slice(avatarStart));

socket.emit("join server", username, avatar);

function joinRoom(roomName) {
    if (roomConnected) {
        socket.emit("leave room", roomConnected);
    }

    socket.emit("join room", roomName, socket.id);
    roomConnected = roomName;
}

function sendMessage() {
    const input = document.getElementById('message');
    if (input.value.length > 0) {
        socket.emit("send message", input.value, roomConnected, roomConnected);
        input.value = '';
    }
}

function checkSocket(socketId) {
    return socketId == socket.id;
}

socket.on("new user", (users) => {
    const usersList = document.getElementById('users');
    console.log(usersList);
    if (usersList.childNodes) {
        var children = Array.prototype.slice.call(usersList.childNodes);
        children.forEach((child) => {
            usersList.removeChild(child);
        });
    }


    const countUsers = document.createElement('h2');
    countUsers.textContent = 'Usuários (' + users.length + ')';
    usersList.appendChild(countUsers);

    users.forEach((value) => {
        const item = document.createElement('a');
        item.textContent = value.name;
        usersList.appendChild(item);
    });
});

socket.on("new message", (msg) => {
    const chat = document.getElementById('chat-messages');

    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';

    const itemAvatar = document.createElement('img');
    itemAvatar.src = msg.avatar;
    itemAvatar.style.width = '4%';
    itemDiv.appendChild(itemAvatar);

    const item = document.createElement('p');
    item.style.backgroundColor = msg.color;
    if (checkSocket(msg.sender)) {
        item.style.justifySelf = 'right';
    }
    item.textContent = msg.sender == socket.id ? 'You ' : '';
    item.textContent += msg.sender + ': ' + msg.content;
    item.style.marginLeft = '1%';
    itemDiv.appendChild(item);

    chat.appendChild(itemDiv);

});

socket.on("load messages", (msg, socketId, roomTitle, users) => {
    if (checkSocket(socketId)) {

        const chat = document.getElementById('chat-messages');

        var children = Array.prototype.slice.call(chat.childNodes);
        children.forEach((child) => {
            chat.removeChild(child);
        });

        const chatHeader = document.querySelector('.chat-header');

        var children = Array.prototype.slice.call(chatHeader.childNodes);
        children.forEach((child) => {
            chatHeader.removeChild(child);
        });

        const elementHeader = document.createElement('h2');
        elementHeader.textContent = 'Chat Atual: ' + roomTitle;
        chatHeader.appendChild(elementHeader);
        msg.forEach((value) => {
            const chat = document.getElementById('chat-messages');

            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';

            const itemAvatar = document.createElement('img');
            itemAvatar.src = value.avatar;
            itemAvatar.style.width = '4%';
            itemDiv.appendChild(itemAvatar);

            const item = document.createElement('p');
            item.style.backgroundColor = value.color;
            if (checkSocket(value.sender)) {
                item.style.justifySelf = 'right';
            }
            item.textContent = value.sender == socket.id ? 'You ' : '';
            item.textContent += value.sender + ': ' + value.content;
            item.style.marginLeft = '1%';
            itemDiv.appendChild(item);

            chat.appendChild(itemDiv);
        });
    }
});