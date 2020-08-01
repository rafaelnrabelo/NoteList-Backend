const express = require("express");
const cors = require("cors");
const https = require("https");

const routes = require("./routes");

const app = express();

const fs = require("fs");
const key = fs.readFileSync("./key.pem");
const cert = fs.readFileSync("./cert.pem");

app.use(cors());
app.use(express.json());
app.use(routes);

const server = https.createServer({ key: key, cert: cert }, app);

app.listen(3333);
server.listen(3330);
