// import { Server } from "socket.io";
// import { authMiddleware } from "../lib/authMiddleware";
import { InMemoryUserStore } from "../db/userStore"
// import dotenv from "dotenv";
// dotenv.config();
import { InMemorySessionStore } from "../db/sessionStore";

import { Credentials } from "../types/types";
import { authMiddleware } from "../lib/authMiddleware";
// var Debug = require('winston');
// console.log(1, Debug.enabled('server'));

// const Debug = (origin) => {

//     return (...args) => {
//         console.log(origin + ':' + args);
//     }
//     return console.log(origin)
// }

const debug = console.log;
// console.log(1, Debug.enabled('server'));

// then to use
// by default stderr is used
// let io;
const PORT = 8080;
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");


// export function init_io_with_port(port) {
//     io = new Server(port);
// }
function registration(io, userStore) {

    const ns_registration = io.of("/register");

    ns_registration.on("connection", (socket) => {
        // debug(ns_registration);

        // socket.on("register", (payload, cb) => {
        //     if (payload) {
        //         return cb(new Error(payload))
        //     }

        // });
        // notify existing users
        socket.emit("user_connected", {
            "msg": "try to register"
        });

        socket.on("register", (credentials: Credentials, cb) => {
            let { username, password } = credentials;
            ///debug("ping");
            if (!username || !password) {
                return cb(("empty username and password"), null);
            }

            userStore.saveUser(credentials, (err, data) => {
                if (err) {
                    return cb(err, null);
                };
                cb(null, data);
            });

        })//on


    })
}
export function updateIO(io, config) {
    const userStore: InMemoryUserStore = new InMemoryUserStore();
    debug('userStore', userStore)
    const sessionStore: InMemorySessionStore = new InMemorySessionStore();
    registration(io, userStore);
    //  authMiddleware(io.of('/'));
    //  let skip = { use: (arg1) => { } };
    const ns_root = io.of("/")
    authMiddleware(ns_root, userStore, sessionStore)

    ns_root.on("connection", socket => {
        debug("[server] user connected");

        // notify existing users
        socket.emit("user_connected", {
            userID: socket.userID,
            username: socket.username,
        });

        socket.on("message", msg => {
            console.log(`[server] received '${msg}'`);
            socket.emit("message", msg);
        });
        socket.on("disconnect", () => {
            debug("[server] user disconnected");
        });
    });


}

// init_io_with_port(PORT)