import asyncio
import websockets
from datetime import datetime

connected_clients = set()

async def handler(websocket):
    # Register the new client
    connected_clients.add(websocket)
    print(f"New client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            pass  # Keep the connection open
    except Exception as e:
        print(f"Exception in handler: {e}")
    finally:
        # Unregister the client
        connected_clients.remove(websocket)
        print(f"Client disconnected: {websocket.remote_address}")

async def send_message():
    while True:
        await asyncio.get_event_loop().run_in_executor(None, input, "Press Enter to send a message: ")
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = f"Hello from the server! [{timestamp}]"
        print(f"Sending message: {message}")
        if connected_clients:  # Check if there are any connected clients
            try:
                await asyncio.wait([asyncio.create_task(client.send(message)) for client in connected_clients])
            except Exception as e:
                print(f"Exception in send_message: {e}")

async def main():
    try:
        server = await websockets.serve(handler, "localhost", 8765)
        print("WebSocket server started on ws://localhost:8765")
        await send_message()
    except Exception as e:
        print(f"Exception in main: {e}")

if __name__ == "__main__":
    asyncio.run(main())