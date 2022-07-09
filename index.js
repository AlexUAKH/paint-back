const express = require("express");
const app = express();
const wsServer = require("express-ws")(app);
const aWss = wsServer.getWss();

const PORT = process.env.PORT || 4500;

app.ws("/ws", (ws, req) => {
  console.log(req)
  ws.on('message', msg => {
    switch (msg.type) {
      case 'connection':
        connectionHandler(ws, msg);
        break;
    }
  })
});

app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));

const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach(client => {
    if (client.id === msg.id) {
      client.send(`User ${msg.username} connected`);
    }
  })
}