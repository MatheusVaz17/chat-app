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

function loadMessagesChat(value, socketId) {
    const chat = document.querySelector('.messages-container');
    if(!value.sender){
        value.sender = 'Anonimo';
    }
    if(!value.avatar){
        value.avatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    }
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('message');

    const itemAvatar = document.createElement('img');
    itemAvatar.src = value.avatar;
    itemAvatar.classList.add('avatar');
    
    const item = document.createElement('p');
    item.style.backgroundColor = value.color;
    itemDiv.appendChild(itemAvatar);
    
    if (checkSocket(socketId)) {
        itemDiv.classList.add('message-right');
    }
    item.textContent += value.sender + ': ' + value.content;
    item.style.marginLeft = '1%';
    itemDiv.appendChild(item);

    chat.appendChild(itemDiv);
    chat.scroll(0, chat.scrollHeight)
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

socket.on("new message", (msg, socketId) => {
    loadMessagesChat(msg, socketId);
});

socket.on("load messages", (msg, socketId, roomTitle, users) => {
    if (checkSocket(socketId)) {

        const chat = document.querySelector('.messages-container');

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
        elementHeader.textContent =  roomTitle;
        chatHeader.appendChild(elementHeader);
        msg.forEach((value) => {
            loadMessagesChat(value, socketId);
        });
    }
});



addEventListener('load', () => {
    const buttonSidenav = document.querySelector('.sidenav-slide'); 
    buttonSidenav.addEventListener('click', () => {
        const sidenav = document.querySelector('.sidenav');
        if(sidenav.classList.contains('close')){
            sidenav.classList.remove('close');
        }else{
            sidenav.classList.add('close');
        }
     });
});