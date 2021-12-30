import './style.css'
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
// Html elements
let messages = mobile ? document.getElementById('mobile_messages') : document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input_message');
let form_pseudo = document.getElementById('form_pseudo');
let input_pseudo = document.getElementById('input_pseudo');
let modal = document.getElementById('modal');
let users = mobile ? document.getElementById('mobile_users') : document.getElementById('users');

// Some variables
let socket;
const USERS = [];
const me = { name: "Unknown" };
const System = { name: "System", color: "red" };

class message {
    constructor(cmd, value, user, t = undefined) {
        this.cmd = cmd;
        this.value = value;
        this.user = user;
        this.id = Math.random().toString(36).substring(7);
        this.time = t ? t : new Date().toLocaleTimeString()
    }

    send() {
        socket.emit('chat message', this);
    }
}


form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        new message('newMessage', input.value, me).send();
        input.value = '';
        // new_message(msg);
    }
});

form_pseudo.addEventListener('submit', function(e) {
    e.preventDefault();
    let name = input_pseudo.value;
    if (name &&
        name.length < 20 &&
        name.length > 2 &&
        name.match(/^[a-zA-Z0-9]+$/) &&
        name != "System") {
        console.log('New pseudo:' + input_pseudo.value)
        me.name = input_pseudo.value;
        // Hide the modal
        init();
        draw_users();
        modal.style.display = "none";
    } else {
        modal_info("Invalid pseudo");
    }
});


// Init the socket
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

    // Calling handlers
    socket.on("connect", on_connect);

    socket.on("disconnect", on_disconnect);

    socket.on('chat message', on_msg);
    socket.on('private message', on_msg);
}


/* Socket handler functions*/

// When the user is connected
function on_connect() {
    console.log("Connected to the server");
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    console.log(socket.connected); // true

    // System message
    sys_info("Connected to the server")


    new message("newUser", me, System).send();
    // send(msg);
}

// When the user is disconnected
function on_disconnect() {
    console.log("Disconnected from the server");
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx

    USERS.forEach(u => {
        if (u.name != "System") {
            USERS.pop(u);
        }
    })

    // System message
    sys_info("Disconnected from the server")
}

// When the socket receives a message
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

// And if it is a system message
function on_sys_msg(msg) {

    if (msg.cmd == 'newUser') {
        // new user(msg.value.name, msg.value.color);
        USERS.push({ name: msg.value.name, color: msg.value.color });
        sys_info(`${msg.value.name} joined the chat`);
        draw_users();

    } else if (msg.cmd == 'userDeco') {
        let u = USERS.find(u => u.name == msg.value.name);
        if (u) {
            sys_info(`${u.name} has left the chat`)
            USERS.pop(u);
            draw_users();
        }
    }
}

/* Html editor functions */

// Add the message on html page
function new_message(msg) {
    var item = document.createElement('li');
    item.classList.add('message');
    if (msg.user.name == 'System') {
        item.innerHTML = `<li class="w-full text-red-500"">
        <span>${msg.time}:</span>
        <span>${msg.user.name}</span>
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

// Draw the users list on html page
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

/* Some useful functions */

function sys_info(info) {
    new message("system", info, System);
    new_message(new message("system", info, System));
}

function modal_info(info) {
    // modal_info_text.innerHTML = info;
    // modal_info_modal.style.display = "block";
}