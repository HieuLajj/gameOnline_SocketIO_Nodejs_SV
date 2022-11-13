const { Server } = require('http');
const express = require("express");
const { domainToUnicode } = require('url');
let Player = require("./Classes/Player");
let ServerGame = require("./Classes/ServerGame");
const userRoute = require("./routes/user_route");
var multer = require('multer');
var upload = multer();

const cors = require("cors");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");

let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);

require('./models/db');
app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({extended: true}))
app.use(upload.array());
app.use(express.static('public'));
app.use(cors());
app.use(morgan("common"));
dotenv.config();
app.use(express.json());

app.use("/laihieu/user",userRoute);

server.listen(3000);

let serverGame = new ServerGame();

setInterval(()=>{
    serverGame.onUpdate();
    //console.log("laivanhieu");
}, 1000, 0);

io.on('connection', function(socket) {
    console.log(socket.id+"ten id")
    let connection = serverGame.onConnected(socket);
    connection.createEvents();
    
    //connection.socket.emit('register', {'id': connection.player.id});
});

console.log('--server is running ...');
