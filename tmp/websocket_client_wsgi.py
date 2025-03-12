import asyncio
import websockets
from datetime import datetime

async def send_message():
    uri = "ws://localhost:8765"
    async with websockets.connect(uri) as websocket:
        while True:
            message = f"Hello from the client! [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]"
            await websocket.send(message)
            print(f"Sent message: {message}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(send_message())