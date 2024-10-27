import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const app = express();
const port = 3000;

app.use(express.static("public"));

// Start HTTP server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message) => {
    // Broadcast message to all clients except the sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
