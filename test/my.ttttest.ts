
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

enum MessageType {
  spin,
  wild,
  blast
}



describe("my awesome project", () => {
  let io, serverSocket, clientSocket;



  beforeAll(async (done) => {


    const httpServer = createServer();
    io = new Server(httpServer);

    // try {
    //   //register_io_middleware_for_authentication(io);
    //   throw new Error('zzzzzz');
    // } catch (e) {
    //   // done(e);
    //   console.log(e);
    //   // process.exit(1);
    // }




    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
        done();
      });

      clientSocket.on("connect", done);
    });
  });//before all

  afterAll(() => {
    io.close();
    clientSocket.close();
  });



  test("should register user (with ack)", (done) => {
    const userStore = {};

    const payload_user = {
      username: "username123",
      password: "password",
    };

    // const adminSocket = io.of('/')
    // adminSocket.on("connect_error", (err: any) => {
    //   expect(err.message).toBe("invalid credentials1");
    //   adminSocket.disconnect();
    //   done();
    // });

    // serverSocket.on("register", (payload, cb) => {
    //   cb(payload);
    // });


    clientSocket.emit("register", payload_user, (arg) => {
      expect(arg).toEqual({ success: true, message: "a new user was added" });
      done();
    });

    clientSocket.emit("register", payload_user, (arg) => {
      expect({ success: true, message: "user already exists" }).toEqual(1);
      done();
    });
  });

  test("should work (with ack)", (done) => {
    const payload = { MessageType: MessageType.spin, content: "hi there" };
    serverSocket.on("message", (payload, cb) => {
      cb(payload);
    });
    clientSocket.emit("message", payload, (arg) => {
      expect(arg).toEqual(payload);
      done();
    });
  });
  // socket.onAny((event, ...args) => {
  //   console.log(event, args);
  // });

  // socket.on("connect_error", (err) => {
  //   // if (err.message === "invalid username") {
  //   //   this.usernameAlreadySelected = false;
  //   // }
  //   console.log(err.message);
  // });
  // test("should work", (done) => {
  //   clientSocket.on("message", (payload) => {
  //     expect(payload).toBe("world");
  //     done();
  //   });
  //   serverSocket.emit("message", MessageType.spin);
  // });


  //   serverSocket.emit("login", {
  //     username: data.username,
  //     password: data.password,
  // });

});//describe1




// clientSocket.emit("message",);

//   // client.emit("hello", "world");
// });


// });