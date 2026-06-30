let socket = null;

let username = localStorage.getItem("shadow_username") || "Guest";

let currentChannel = "general";

const status = document.getElementById("status");
const messages = document.getElementById("messages");
const input = document.getElementById("msgInput");

// Connect to the same host the page was loaded from
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const wsURL = protocol + window.location.host + "/ws";

console.log("Connecting to:", wsURL);

socket = new WebSocket(wsURL);

socket.onopen = function () {

    console.log("Connected!");

    status.innerHTML = "🟢 Connected";

};

socket.onmessage = function (event) {

    // First message from server requests username
    if (event.data === "USERNAME") {

        socket.send(username);

        return;

    }

    const parts = event.data.split("|");

    if (parts.length < 3) return;

    const user = parts[0];
    const channel = parts[1];
    const text = parts.slice(2).join("|");

    if (channel !== currentChannel) return;

    const div = document.createElement("div");

    div.innerHTML = `<strong>${user}</strong>: ${text}`;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

};

socket.onclose = function () {

    console.log("Disconnected");

    status.innerHTML = "🔴 Disconnected";

};

socket.onerror = function (err) {

    console.log(err);

    status.innerHTML = "🔴 Connection Error";

};

function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;

    if (socket.readyState !== WebSocket.OPEN) {

        alert("Not connected to server.");

        return;

    }

    socket.send(currentChannel + "|" + text);

    input.value = "";

}

function switchChannel(channel) {

    currentChannel = channel;

    messages.innerHTML = "";

    if (socket.readyState === WebSocket.OPEN) {

        socket.send("CHANGE_CHANNEL|" + channel);

    }

}

input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        sendMessage();

    }

});
