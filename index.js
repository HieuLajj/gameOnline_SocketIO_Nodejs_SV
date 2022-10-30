const { Console } = require('console');
const { Server } = require('http');
const { domainToUnicode } = require('url');
let Player = require("./Classes/Player");
let ServerGame = require("./Classes/ServerGame");


let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
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
