import { createServer } from "http";
import { Server as Server_socket_io } from "socket.io";
import { io as ioc } from "socket.io-client";
import { AddressInfo } from "net";
// import { InMemoryStore, instrument, RedisStore } from "../dist";
// import expect = require("expect.js");
import { createClient } from "redis";
import { updateIO } from "../src/io";
import { Credentials } from "../types/types";

const debug = console.log;



describe("Socket.IO Admin - server", () => {

    let port: number, server_socket_io: Server_socket_io, client_socket_io: any;
    // this.timeout(2000);
    const payload_user_orig: Credentials = {
        username: "username1",
        password: "password1",
    };

    beforeAll((done) => {
        const httpServer = createServer();
        server_socket_io = new Server_socket_io(httpServer);

        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            debug(`socket server alive: http://localhost:${port}`);
            updateIO(server_socket_io, {});
            done();
        });
    });

    afterEach(() => {
        client_socket_io.off("connect_error");
        client_socket_io.disconnect();
    });
    afterAll(() => {
        // client_socket_io.off("connect_error");
        server_socket_io.close();
    });

    describe("register", () => {
        test("should register a user", (done) => {

            client_socket_io = ioc(`http://localhost:${port}/register`, { autoConnect: false });
            client_socket_io.connect();

            client_socket_io.on("user_connected", (res) => {
                // expect(client_socket_io.auth).toEqual(payload_user);
                const payload_user: Credentials = {
                    username: "username1",
                    password: "password1",
                };
                client_socket_io.emit('register', payload_user, (err, data) => {
                    expect(err).toEqual(null);
                    expect(data.password.length > 0).toBe(true);
                    done();
                })
            });
        })

        test("should not register a user with the same username", (done) => {
            const payload_user = Object.assign(payload_user_orig);

            client_socket_io = ioc(`http://localhost:${port}/register`, { autoConnect: false });
            client_socket_io.connect();

            client_socket_io.on("user_connected", (res) => {
                // expect(client_socket_io.auth).toEqual(payload_user);

                client_socket_io.emit('register', payload_user, (err, data) => {
                    expect(err).toBe("username already exists");
                    //  expect(data).toEqual(false);
                    done()
                })
            });
        });

        test("should not register a user without username or password", (done) => {
            client_socket_io = ioc(`http://localhost:${port}/register`, { autoConnect: false });
            client_socket_io.connect();

            const payload_user = Object.assign(payload_user_orig, { password: "" });
            client_socket_io.on("user_connected", (res) => {
                // expect(client_socket_io.auth).toEqual(payload_user);

                client_socket_io.emit('register', payload_user, (err, data) => {
                    expect(err).toEqual("empty username and password");
                    expect(data).toEqual(null);
                    done();
                })
            });
        })
    });



    describe("login", () => {

        test("should not login using wrong password", (done) => {

            client_socket_io = ioc(`http://localhost:${port}/`, { autoConnect: false });
            client_socket_io.onAny((event: any, ...args: any) => {
                // debug({ event, args });
            });
            const payload_user = {
                username: "username1",
                password: "wrong password",
            };

            client_socket_io.auth = payload_user;
            client_socket_io.connect();
            client_socket_io.on("connect_error", (err: any) => {
                expect(err.message).toBe("incorrect password");
                client_socket_io.disconnect();
                done();
            });

        });

        test("should login using correct credentials", (done) => {
            client_socket_io = ioc(`http://localhost:${port}/`, { autoConnect: false });
            client_socket_io.onAny((event: any, ...args: any) => {
                debug({ event, args });
            });
            const payload_user = {
                username: "username1",
                password: "password1",
            };

            client_socket_io.auth = payload_user;
            client_socket_io.connect();
            client_socket_io.on("connect_error", (err: any) => {
                done(new Error("should not happen"));
            });

            client_socket_io.on("user_connected", (socket) => {
                expect(socket.userID.length > 0).toEqual(true);
                expect(socket.username).toEqual(payload_user.username);

                done();
            });

        });


        test("should login using correct session", (done) => {
            client_socket_io = ioc(`http://localhost:${port}/`, { autoConnect: false });
            client_socket_io.onAny((event: any, ...args: any) => {
                debug({ event, args });
            });
            const payload_user = {
                username: "username1",
                password: "password1",
            };

            client_socket_io.auth = payload_user;
            client_socket_io.connect();
            client_socket_io.on("connect_error", (err: any) => {
                done(new Error("should not happen" + err.message));
            });

            client_socket_io.on("user_connected", (socket) => {
                client_socket_io.auth = {
                    sessionId: socket.sessionId,
                };
                client_socket_io.on("connect", () => {
                    client_socket_io.disconnect();
                    done();
                });
                client_socket_io.disconnect().connect();
            });
            //   client_socket_io.on("user_connected", (socket) => {
            // });

        });



    });

    describe.skip("server scaling", () => {
        // it("the server subscribes using redis", (done) => {
        //     client_socket_io.on("connect_error", (err: any) => {

        //         done(new Error("should not happen"));
        //     });
        // });

        it("connect 3 servers using different ports", (done) => {
            const server1 = createServer();
            const server2 = createServer();
            const server3 = createServer();

            server1.listen(() => {
                const port1 = (server1.address() as AddressInfo).port;
                debug(`server1 alive: http://localhost:${port1}`);
            });
            server2.listen(() => {
                const port2 = (server2.address() as AddressInfo).port;
                debug(`server2 alive: http://localhost:${port2}`);
            });
            server3.listen(() => {
                const port3 = (server3.address() as AddressInfo).port;
                debug(`server3 alive: http://localhost:${port3}`);
            });

            // server_socket_io.on("connect_error", (err: any) => {
            //     done(new Error("should not happen"));
            // });

            // server_socket_io.on("user_connected", (socket) => {
            //     expect(socket.userID.length > 0).toEqual(true);
            //     expect(socket.username).toEqual(payload_user.username);

            //     done();
            // });

        });
        it.todo("connect 3 clients using different servers");

        it.todo("client 1 is aware of client 2");
        it.todo("client 2 gets messages from client 1");
        it.todo("client 1 can send messages selected users");


        it.todo("the server subscribes using redis");
    })


});


