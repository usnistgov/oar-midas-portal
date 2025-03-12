import asyncio
import websockets
from datetime import datetime

def log_with_timestamp(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {message}")

async def receive_messages():
    uri = "ws://localhost:8765"
    async with websockets.connect(uri) as websocket:
        log_with_timestamp(f"Connected to WebSocket server at {uri}")
        try:
            async for message in websocket:
                log_with_timestamp(f"Received message: {message}")
        except websockets.ConnectionClosed:
            log_with_timestamp(f"Connection to WebSocket server at {uri} was closed")

if __name__ == "__main__":
    asyncio.run(receive_messages())