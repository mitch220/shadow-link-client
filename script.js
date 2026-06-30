// CHANGE THIS IF YOUR SERVER URL CHANGES
const SERVER_URL = "wss://shadow-link-server.onrender.com/ws";

let username = prompt("Enter username:");
let channel = "general";

let socket;

const status = document.getElementById("status");

// ---------------- CONNECT ----------------
function connect() {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
        status.innerText = "🟢 Connected";

        // handshake
        socket.send(username);
    };

    socket.onmessage = (event) => {
        const msg = event.data;

        // ignore handshake request
        if (msg === "USERNAME") return;

        const parts = msg.split("|");

        if (parts.length === 3) {
            const user = parts[0];
            const ch = parts[1];
            const text = parts[2];

            if (ch === channel) {
                addMessage(user, text);
            }
        }
    };

    socket.onclose = () => {
        status.innerText = "🔴 Disconnected";
    };

    socket.onerror = () => {
        status.innerText = "⚠️ Error";
    };
}

// ---------------- SEND MESSAGE ----------------
function sendMessage() {
    const input = document.getElementById("msgInput");
    const text = input.value.trim();

    if (!text || socket.readyState !== 1) return;

    socket.send(channel + "|" + text);
    input.value = "";
}

// ---------------- ADD MESSAGE ----------------
function addMessage(user, text) {
    const div = document.createElement("div");
    div.className = "msg";

    div.innerHTML = `<span class="user">${user}:</span> ${text}`;

    document.getElementById("messages").appendChild(div);

    document.getElementById("messages").scrollTop =
        document.getElementById("messages").scrollHeight;
}

// ---------------- SWITCH CHANNEL ----------------
function switchChannel(newChannel) {
    channel = newChannel;
    document.getElementById("messages").innerHTML = "";

    if (socket && socket.readyState === 1) {
        socket.send("CHANGE_CHANNEL|" + newChannel);
    }
}

// start connection
connect();
