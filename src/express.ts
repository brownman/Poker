src / server.js:
const express = require("express");

const createServer = (port = 3000) => {
  const app = express();
  const http = require("http").Server(app);
  const io = require("socket.io")(http);



  http.listen(port, () =>
    console.log(`[server] listening on port ${port}`)
  );
  return {
    close: () => http.close(() =>
      console.log("[server] closed")
    )
  };
};
module.exports = { createServer };



