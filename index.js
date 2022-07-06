const express = require("express");
const app = express();
const wsServer = require("express-ws")(app);

const PORT = process.env.PORT || 4500;

app.ws("/", (res, req) => {
  console.log("connected ws");
});

app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));
