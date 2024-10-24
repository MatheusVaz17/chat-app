const socket = io();

var roomConnected = null;

const query = window.location.href;

const url = new URL(query);
const params = new URLSearchParams(url.search);
const username = params.get('username');
const fullUrl = url.search;
const avatarStart = fullUrl.indexOf('avatar=') + 'avatar='.length;
const avatar = decodeURIComponent(fullUrl.slice(avatarStart));
const user = window.localStorage.getItem('@userChatApp');


socket.emit("join server", username, avatar);

if (!user) {
    window.location.href = "http://localhost:3000/register";
}else if(user && !window.location.search.includes('username') &&!window.location.search.includes('avatar')){
    const obj = JSON.parse(user);
    window.location.href = "http://localhost:3000"+'?username='+obj.name+'&avatar='+obj.avatar;
}

function joinRoom(roomName) {
    if (roomConnected) {
        socket.emit("leave room", roomConnected);
    }

    socket.emit("join room", roomName, socket.id);
    roomConnected = roomName;
}

// function keyupUser(e){
//     if(e.target.value.length === 0){
//         socket.emit("keyupOff", username);
//     }else{
//         socket.emit("keyup", username, roomConnected);
//     }
// }
function sendMessage(event) {
    event.preventDefault();
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
    
    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('item-wrapper');
    itemDiv.appendChild(itemWrapper);

    const userName = document.createElement('p');
    userName.textContent = value.sender == username ? '' : value.sender;
    userName.classList.add('user-name');
    itemWrapper.appendChild(userName);

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    itemWrapper.appendChild(messageWrapper);
    
    const itemAvatar = document.createElement('img');
    itemAvatar.src = value.avatar;
    itemAvatar.classList.add('avatar');
    
    const item = document.createElement('p');
    item.style.backgroundColor = value.color;
    messageWrapper.appendChild(itemAvatar);
    
    if (value.sender == username) {
        itemDiv.classList.add('message-right');
    }
    item.textContent += value.content;
    messageWrapper.appendChild(item);

    chat.appendChild(itemDiv);
    chat.scroll(0, chat.scrollHeight);
}

// function editTypingUser(usersKeyup, roomConnected){
//     const el = document.querySelector(`.typing`);
//     if(el.classList.contains(roomConnected)){
//         let content = [];
//         usersKeyup.filter((u) => u !== username).forEach((u) => content.push(u));
//         switch(content.length){
//             case 0:
//                 el.textContent = '';
//                 break;
//             case 1:
//                 el.textContent = `${content[0]} esta digitando...`;
//                 break;
//             default:
//                 el.textContent = 'Mais de um usuário está digitando...';
//         }
//     }else{
//         el.textContent = '';
//     }
    
// };
function toggleEmoji(){
    const emojiList = document.querySelector('.emojis-list ul');
    const emojisListContainer = document.querySelector('.emojis-list');
    if(emojisListContainer.style.display === 'block'){
        emojisListContainer.style.display = 'none';
    }else if(emojisListContainer.style.display === 'none' && emojiList.childNodes){
        emojisListContainer.style.display = 'block';
    }else{
        fetch('http://localhost:3000/emojis.json').then((data) => {
            return data.json();
        }).then((data) => {
            showEmoji(data);
        });
    
        function showEmoji(data){
            data.forEach((emoji) => {
                let item = document.createElement('li');
                item.setAttribute('emoji-name', emoji.slug);
                item.textContent = emoji.character;
                emojiList.appendChild(item);
                item.addEventListener('click', () => {
                    const input = document.getElementById('message');
                    const emojiName = item.textContent;
                    input.value += emojiName;
                    input.focus();
                })
            })
            emojisListContainer.style.display = 'block';
        }
    }
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
    const audio = new Audio('http://localhost:3000/click.mp3');
    loadMessagesChat(msg, socketId);
    audio.play();
});
socket.on("load messages", (msg, socketId, roomTitle, users) => {
    if (checkSocket(socketId)) {
        const audio = new Audio('http://localhost:3000/click.mp3');
        const chat = document.querySelector('.messages-container');
        // const typingEl = document.querySelector('.typing');

        var children = Array.prototype.slice.call(chat.childNodes);
        children.forEach((child) => {
            chat.removeChild(child);
        });

        const chatHeader = document.querySelector('.chat-header');
        chatHeader.classList.add(roomConnected);
        var children = Array.prototype.slice.call(chatHeader.childNodes);
        children.forEach((child) => {
            chatHeader.removeChild(child);
        });

        // typingEl.setAttribute('class', 'typing');
        // typingEl.classList.add(roomConnected);
        // typingEl.textContent = '';

        const elementHeader = document.createElement('h2');
        elementHeader.textContent =  roomTitle;
        chatHeader.appendChild(elementHeader);
        msg.forEach((value) => {
            loadMessagesChat(value, socketId);
        });
        audio.play();
    }
});

// socket.on("keypress user", (usersKeyup, roomConnected) => {
//     editTypingUser(usersKeyup, roomConnected);
// });

// socket.on("keypress off", (usersKeyup, roomConnected)=>{
//     editTypingUser(usersKeyup, roomConnected);
// });


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