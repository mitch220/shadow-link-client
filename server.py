from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI()

# Serve static files (CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Store connected users
clients = {}
channels = {}

# Homepage (login screen)
@app.get("/")
async def home():
    return FileResponse("static/login.html")

# Chat page
@app.get("/chat")
async def chat():
    return FileResponse("static/index.html")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    await websocket.send_text("USERNAME")
    username = await websocket.receive_text()

    clients[websocket] = username
    channels[websocket] = "general"

    print(f"{username} connected")

    try:
        while True:

            data = await websocket.receive_text()

            if data.startswith("CHANGE_CHANNEL|"):
                channel = data.split("|", 1)[1]
                channels[websocket] = channel
                continue

            if "|" not in data:
                continue

            channel, message = data.split("|", 1)

            formatted = f"{username}|{channel}|{message}"

            disconnected = []

            for client, ch in channels.items():
                if ch == channel:
                    try:
                        await client.send_text(formatted)
                    except:
                        disconnected.append(client)

            # Remove dead connections
            for client in disconnected:
                clients.pop(client, None)
                channels.pop(client, None)

    except WebSocketDisconnect:

        print(f"{username} disconnected")

        clients.pop(websocket, None)
        channels.pop(websocket, None)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
