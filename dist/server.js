"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.static("public"));
app.get("*.js", (req, res, next) => {
    res.set("Content-Type", "application/javascript");
    next();
});
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        // Broadcast message to all clients except the sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});
