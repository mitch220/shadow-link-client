const SERVER_URL = "wss://shadow-link-server.onrender.com/ws";

const username =
    localStorage.getItem("shadow_username");

if (!username) {

    window.location.href = "login.html";

}

let socket = null;

let currentChannel = "general";

const status =
    document.getElementById("status");

const messages =
    document.getElementById("messages");

function connect() {

    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {

        console.log("Connected");

        if (status)
            status.innerHTML = "🟢 Connected";

    };

    socket.onmessage = (event) => {

        const data = event.data;

        if (data === "USERNAME") {

            socket.send(username);

            return;

        }

        const parts = data.split("|");

        if (parts.length !== 3)
            return;

        const user = parts[0];
        const channel = parts[1];
        const text = parts[2];

        if (channel !== currentChannel)
            return;

        addMessage(user, text);

    };

    socket.onclose = () => {

        console.log("Disconnected");

        if (status)
            status.innerHTML = "🔴 Disconnected";

    };

    socket.onerror = (e) => {

        console.log(e);

        if (status)
            status.innerHTML = "⚠️ Connection Error";

    };

}

function addMessage(user, text) {

    const div =
        document.createElement("div");

    div.className = "msg";

    div.innerHTML =
        `<span class="user">${escapeHTML(user)}</span>: ${escapeHTML(text)}`;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

}

function sendMessage() {

    const input =
        document.getElementById("msgInput");

    if (!input)
        return;

    const text =
        input.value.trim();

    if (text === "")
        return;

    if (!socket)
        return;

    if (socket.readyState !== WebSocket.OPEN)
        return;

    socket.send(
        currentChannel +
        "|" +
        text
    );

    input.value = "";

}

function switchChannel(channel) {

    currentChannel = channel;

    if (messages)
        messages.innerHTML = "";

    if (
        socket &&
        socket.readyState === WebSocket.OPEN
    ) {

        socket.send(
            "CHANGE_CHANNEL|" +
            channel
        );

    }

}

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.innerText = text;

    return div.innerHTML;

}

const input =
    document.getElementById("msgInput");

if (input) {

    input.addEventListener("keydown", function(e){

        if(e.key === "Enter")
            sendMessage();

    });

}

connect();
