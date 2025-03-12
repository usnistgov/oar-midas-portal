import asyncio
import websockets
from datetime import datetime

def log_with_timestamp(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {message}")

async def check_websocket():
    uri = "ws://localhost:8787"
    while True:
        try:
            async with websockets.connect(uri) as websocket:
                log_with_timestamp(f"Connected to WebSocket server at {uri}")
                try:
                    async for message in websocket:
                        log_with_timestamp(f"Received message: {message}")
                except websockets.ConnectionClosed:
                    log_with_timestamp(f"Connection to WebSocket server at {uri} was closed")
        except Exception as e:
            log_with_timestamp(f"Failed to connect to WebSocket server at {uri}: {e}")
        
        # Wait for 2 seconds before trying again
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(check_websocket())