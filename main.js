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
var modal = document.getElementById('modal');

const COLORS = [
    'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'indigo', 'teal', 'gray', 'brown', 'black', 'white'
]
const USERS = [];
let socket;
let me;

class message {
    constructor(cmd, value, user) {
        this.cmd = cmd;
        this.value = value;
        this.user = user;
        this.id = Math.random().toString(36).substring(7);
    }
}

class user {
    constructor(name, color) {
        this.name = name;
        USERS.push(this);
        this.color = color ? color : COLORS[USERS.indexOf(this)-1] ;
    }
}

let System = new user("System", 'red');

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
    if (input_pseudo.value) {
        console.log('New pseudo:' + input_pseudo.value)
        me = new user(input_pseudo.value);
        // Hide the modal
        init();
        draw_users();
        modal.style.display = "none";
    }
});

function init() {
    socket = io("176.128.9.92:8008");
    
    if(!me) {
        modal.style.display = "block";
    }

    if(!socket.connected) {
        modal.style.display = "block";
    }
       
    socket.on("connect", on_connect);     
    
    socket.on("disconnect", on_disconnect);

    socket.on('chat message', on_msg);
}

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
        user: System
    });
    draw_users();
}

function draw_users() {
    let users = document.getElementById('users');
    console.log('User:',USERS)
    users.innerHTML = '';
    USERS.forEach(u => {
        let item = document.createElement('li');
        item.classList.add('user');
        item.innerHTML = `<span class="text-${u.color}-500">${u.name}</span>`;
        users.appendChild(item);
    });
}

function on_connect() {
    console.log("Connected to the server");
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    console.log(socket.connected); // true
        
    // System message
    new_message({
        cmd: "system",
        value: "Connected to the server",
        user: System
    });

    let msg = new message("newUser", me, System);
    send(msg);
}

function on_disconnect() {
    console.log("Disconnected from the server");
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx

    // System message
    new_message({
        cmd: "system",
        value: "Disconnected from the server",
        user: System
    });
}

function on_msg(msg) {
    console.log('Message received:' + msg)

    if (msg.user == System) {
        on_sys_msg(msg);
    }
    else if (msg.cmd == 'newMessage') {
        new_message(msg);
    }

    window.scrollTo(0, document.body.scrollHeight);
}

function on_sys_msg(msg) {
    console.log('System message received:' + msg)

    if (msg.cmd == 'newUser') {
        new_user(msg.user);
    }
}