const { expect } = require("chai");
const server_socket_io = require("socket.io-client");
const { createServer } = require("../src/server");
const socketUrl = "http://localhost:3000";

describe("server", function () {
    this.timeout(3000);

    let server;
    let sockets;
    beforeEach(() => {
        sockets = [];
        server = createServer();
    });
    afterEach(() => {
        sockets.forEach(e => e.disconnect())
        server.close();
    });

    const makeSocket = (id = 0) => {
        const socket = server_socket_io.connect(socketUrl, {
            "reconnection delay": 0,
            "reopen delay": 0,
            "force new connection": true,
            transports: ["websocket"],
        });
        socket.on("connect", () => {
            console.log(`[client ${id}] connected`);
        });
        socket.on("disconnect", () => {
            console.log(`[client ${id}] disconnected`);
        });
        sockets.push(socket);
        return socket;
    };

    it("should echo a message to a client", done => {
        const socket = makeSocket();
        socket.emit("message", "hello world");
        socket.on("message", msg => {
            console.log(`[client] received '${msg}'`);
            expect(msg).to.equal("hello world");
            done();
        });
    });

    it("should echo messages to multiple clients", () => {
        const sockets = [...Array(5)].map((_, i) => makeSocket(i));

        return Promise.all(sockets.map((socket, id) =>
            new Promise((resolve, reject) => {
                const msgs = [..."abcd"].map(e => e + id);
                msgs.slice().forEach(e => socket.emit("message", e));

                socket.on("message", msg => {
                    console.log(`[client ${id}] received '${msg}'`);
                    expect(msg).to.equal(msgs.shift());

                    if (msgs.length === 0) {
                        resolve();
                    }
                });
            })
        ));
    });
});