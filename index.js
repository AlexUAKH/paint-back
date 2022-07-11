const express = require("express");
const app = express();
const wsServer = require("express-ws")(app);
const aWss = wsServer.getWss();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());

app.post('/picture/:id', (req, res) => {
  try {
    const data = req.body.img.replace("data:image/png;base64,", '');
    const fileName = req.params.id + '.jpg';
    const filePath = path.resolve(__dirname, 'static');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    fs.writeFileSync(path.resolve(filePath, fileName), data, "base64");
    return res.status(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json("Cant save picture");
  }
})
app.get('/picture/:id', (req, res) => {
  try {
    const fileName = req.params.id + '.jpg';
    const filePath = path.resolve(__dirname, "static", fileName);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "base64");
      const picture = `data:image/png;base64,${data}`;
      return res.status(200).json(picture);
    } else {
      return res.status(200).json(null);
    }

  } catch (e) {
    console.log(e);
    return res.status(500).json("Cant find picture");
  }
})

app.ws("/ws", (ws) => {
  ws.on('message', msg => {
    msg = JSON.parse(msg);
    switch (msg.type) {
      case 'connection':
        connectionHandler(ws, msg);
        break;
      case 'draw':
      case 'clear':
      case 'undo':
      case 'redo':
        broadcastConnection(ws, msg);
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
      client.send(JSON.stringify(msg));
    }
  })
}