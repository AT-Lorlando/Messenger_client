import './style.css'

console.log("%c Template made by AT-Lorlando", 'font-size:20px; text-transform: uppercase; color: white; text-shadow: 1px 1px red, 2px 2px orange, 3px 3px yellow, 4px 4px green, 5px 5px blue, 6px 6px purple')
console.log("https://github.com/AT-Lorlando")
console.log("https://altab.tech")

import { io } from "socket.io-client";

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input_message');
var form_pseudo = document.getElementById('form_pseudo');
var input_pseudo = document.getElementById('input_pseudo');

const socket = io("176.128.9.92:8008");
const COLORS = [
    'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'indigo', 'teal', 'gray', 'brown', 'black', 'white'
]
const USERS = [];
class message {
    constructor(cmd, value, user) {
        this.cmd = cmd;
        this.value = value;
        this.user = user;
        this.id = Math.random().toString(36).substring(7);
    }
}

class user {
    constructor(name) {
        this.name = name;
        USERS.push(this);
        this.color = COLORS[USERS.indexOf(this)];
    }
}

let me = new user('Anonyme');

socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx

    // System message
    new_message({
        cmd: "system",
        value: "Connected to the server",
        user: { name: "System", color: "red" }
    });

    let msg = new message("newUser", "", me);
    send(msg);
});

socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        let msg = new message('newMessage', input.value, me);
        send(msg)
        input.value = '';
        // new_message(msg);
    }
});

form_pseudo.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('New pseudo:' + input_pseudo.value)
    me.name = input_pseudo.value;
});

function send(msg) {
    socket.emit('chat message', msg);
}

function new_message(msg) {
    var item = document.createElement('li');
    item.classList.add('message');
    if (msg.user == me) {
        item.innerHTML = `<li class="w-full text-blue-500"">
        <span>${msg.user.name}</span>
        <span>${new Date().toLocaleTimeString()}:</span>
        ${msg.value}
        </li>`;
    } else {
        item.innerHTML = `<li class="w-full text-${msg.user.color}-500">
        <span>${msg.user.name}</span>
        <span>${new Date().toLocaleTimeString()}:</span>
        ${msg.value}
        </li>`;
    }

    messages.appendChild(item);
}

function new_user(u) {
    new user(u);
    new_message({
        cmd: "system",
        value: `${u.name} joined to the server`,
        user: { name: "System", color: "red" }
    });
}

socket.on('chat message', function(msg) {
    console.log('Message received:' + msg)

    if (msg.cmd == 'newMessage') {
        new_message(msg);
    } else if (msg.cmd == 'system') {
        new_message(msg);
    } else if (msg.cmd == 'newUser') {
        new_user(msg.user);
    }

    window.scrollTo(0, document.body.scrollHeight);
});