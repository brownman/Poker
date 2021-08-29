const { createServer } = require("http");
const { Server } = require("socket.io");
// const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();
import { updateIO } from './io';

const ios = new Server(httpServer, {
    cors: {
        origin: ["https://localhost:8080"],
        credentials: true
    }
});

updateIO(ios, {
    auth: false
});

httpServer.listen(3000);

