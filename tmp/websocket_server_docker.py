import asyncio
import websockets
import logging

logging.basicConfig(level=logging.INFO)

class WebSocketServer:
    def __init__(self, host="0.0.0.0", port=8765):
        self.host = host
        self.port = port
        self.clients = set()

    async def handler(self, websocket):
        self.clients.add(websocket)
        try:
            async for message in websocket:
                logging.info(f"Received message: {message}")
        except websockets.ConnectionClosed:
            logging.info("Client disconnected")
        finally:
            self.clients.remove(websocket)

    async def send_periodic_messages(self):
        while True:
            if self.clients:
                message = "Hello, this is a periodic message"
                logging.info(f"Sending message to {len(self.clients)} clients")
                await asyncio.gather(*(client.send(message) for client in self.clients))
            await asyncio.sleep(5)

    async def main(self):
        async with websockets.serve(self.handler, self.host, self.port):
            logging.info(f"WebSocket server started on ws://{self.host}:{self.port}")
            await self.send_periodic_messages()

if __name__ == "__main__":
    server = WebSocketServer()
    asyncio.run(server.main())