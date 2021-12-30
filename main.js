import './style.css'

console.log("%c Template made by AT-Lorlando", 'font-size:20px; text-transform: uppercase; color: white; text-shadow: 1px 1px red, 2px 2px orange, 3px 3px yellow, 4px 4px green, 5px 5px blue, 6px 6px purple')
console.log("https://github.com/AT-Lorlando")
console.log("https://altab.tech")

import { io } from "socket.io-client";

// Check is device is mobile
function isMobile() {
    if (navigator.userAgent.match(/Android/i)
        // || navigator.userAgent.match(/webOS/i)
        ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
}

let mobile = isMobile();


let messages = mobile ? document.getElementById('mobile_messages') : document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input_message');
let form_pseudo = document.getElementById('form_pseudo');
let input_pseudo = document.getElementById('input_pseudo');
let modal = document.getElementById('modal');
let users = mobile ? document.getElementById('mobile_users') : document.getElementById('users');




const COLORS = [
    'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'indigo', 'teal', 'gray', 'brown', 'black', 'white'
]
const USERS = [];
let socket;
let me;

class message {
    constructor(cmd, value, user, t = undefined) {
        this.cmd = cmd;
        this.value = value;
        this.user = user;
        this.id = Math.random().toString(36).substring(7);
        this.time = t ? t : new Date().toLocaleTimeString()
    }
}

class user {
    constructor(name, color) {
        this.name = name;
        USERS.push(this);
        this.color = color ? color : COLORS[USERS.indexOf(this) - 1];
    }
}

let System = new user("System", 'red');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        let msg = new message('newMessage', input.value, { name: me });
        send(msg)
        input.value = '';
        // new_message(msg);
    }
});

form_pseudo.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input_pseudo.value) {
        console.log('New pseudo:' + input_pseudo.value)
        me = input_pseudo.value;
        // Hide the modal
        init();
        draw_users();
        modal.style.display = "none";
    }
});

function init() {
    socket = io("https://sekira.altab.tech", {
        transports: ['websocket'],
        rejectUnauthorized: false,
        secure: true,
        withCredentials: true,
        extraHeaders: {
            "my-custom-header": "abcd"
        }
    });
    console.log(socket);

    if (false) {
        console.log("Socket error");
        // System message
        new_message({
            cmd: "system",
            value: "Connection error, retrying in 10.",
            user: System
        });

        setTimeout(init, 10000);
        return
    }


    if (!me) {
        modal.style.display = "block";
    }

    socket.on("connect", on_connect);

    socket.on("disconnect", on_disconnect);

    socket.on('chat message', on_msg);
    socket.on('private message', on_msg);
}

function send(msg) {
    socket.emit('chat message', msg);
}

function new_message(msg) {
    console.log(msg)
    var item = document.createElement('li');
    item.classList.add('message');
    if (msg.user.name == 'System') {
        item.innerHTML = `<li class="w-full text-red-500"">
        <span>${msg.user.name}</span>
        <span>${msg.time}:</span>
        ${msg.value}
        </li>`;
    } else {
        item.innerHTML = `<li class="w-full text-${msg.user.color}-500">
        <span>${msg.time}</span>
        <span>${msg.user.name}:</span>
        <span class="text-white">${msg.value}</span>
        </li>`;
    }

    messages.appendChild(item);
}

function draw_users() {
    users.innerHTML = '';
    USERS.forEach(u => {
        if (u.name != "System") {
            let item = document.createElement('li');
            item.innerHTML = `<span class="text-${u.color}-500">${u.name}</span>`;
            users.appendChild(item);
        }
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

    let msg = new message("newUser", { name: me }, System);
    send(msg);
}

function on_disconnect() {
    console.log("Disconnected from the server");
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx

    USERS.forEach(u => {
        if (u.name != "System") {
            USERS.pop(u);
        }
    })

    // System message
    new_message({
        cmd: "system",
        value: "Disconnected from the server",
        user: System
    });
}

function on_msg(msg) {
    console.log('Message received:')
    console.log(msg);

    if (msg.user.name == "System") {
        on_sys_msg(msg);
    } else if (msg.cmd == 'newMessage') {
        new_message(msg);
    }

    window.scrollTo(0, document.body.scrollHeight);
}

function on_sys_msg(msg) {
    if (msg.cmd == 'newUser') {
        new user(msg.value.name, msg.value.color);
        draw_users();
    } else if (msg.cmd == 'userDeco') {
        let u = USERS.find(u => u.name == msg.value.name);
        USERS.pop(u);
        draw_users();
    } else if (msg.cmd == 'messageHistory') {
        msg.value.forEach(m => {
            let s_msg = new message(m.cmd, m.value, m.user, m.time);
            new_message(s_msg);
        })
    }
}