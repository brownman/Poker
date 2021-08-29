import { ioc } from "socket.ioc-client";
import dotenv from "dotenv";
dotenv.config();


const socket = ioc("ws://localhost:8080/", {});
// const debug = debugModule("client.ts");
const debug = require('debug')('client');

// by default stderr is used


function register() {
    const payload = { username: "username1" }
    socket.emit('register', payload, (data) => {
        console.log(data);
    })
}


socket.on("connect", () => {
    debug(`connect ${socket.id}`);
    register();
    //if no active session - try to 

    // socket.lo("connect", {)});
});

socket.on("disconnect", () => {
    debug(`disconnect`);
});

setInterval(() => {
    const start = Date.now();
    socket.emit("ping", () => {
        debug(socket.id);
        debug(`pong (latency: ${Date.now() - start} ms)`);
    });
}, 1000);
