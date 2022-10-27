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
}, 100, 0);

io.on('connection', function(socket) {
    console.log(socket.id+"ten id")
    let connection = serverGame.onConnected(socket);
    connection.createEvents();
    
    //connection.socket.emit('register', {'id': connection.player.id});
});

























// //global variables for the server
// var playerSpawnPoints = [];

// //____
// var players = [];
// var sockets = [];

// app.get("/", function(req, res){
//     res.send('hey you got back get"/"');
// })

// io.on('connection', function(socket){
//     console.log("new connection: "+ socket.id);
//     var currentPlayer = {};
//     currentPlayer.name = 'unknown';

//     //____
//     var currentPlayerr = new Player();
//     var thisPlayerID = currentPlayerr.id;

//     players[thisPlayerID] = currentPlayerr;
//     sockets[thisPlayerID] = socket;


//     socket.on('player connect', function(){    
//             for(var player in players){
//                 if(thisPlayerID!=player){
//                     socket.emit('other player connected', JSON.stringify(players[player]));
//                 }
//             }
//     });

//     socket.on('play', function(data){
//         const obj = JSON.parse(data);
//         if(players == 0){
//             playerSpawnPoints = [];
//             obj.playerSpawnPoints.forEach(function(_playerSpawnPoint){
                
//                 console.log(_playerSpawnPoint.position+"haahahhahahaha");
//                 var playerSpawnPoint = {
//                     position: _playerSpawnPoint.position           
//                 }
//                 playerSpawnPoints.push(playerSpawnPoint);
//              })
//         }
//         var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
//         currentPlayerr.setPlayer(obj.name, randomSpawnPoint.position, 100, 0, [0.0,0.0,0.0]);
//         socket.emit('play',JSON.stringify(currentPlayerr));
//         socket.broadcast.emit('other player connected', JSON.stringify(currentPlayerr));
             
//     })

//     socket.on('player move', function(data) {
//         const obj = JSON.parse(data);
//         currentPlayerr.position = obj.position;
//         socket.broadcast.emit('player move', JSON.stringify(currentPlayerr));
// 	});

//     socket.on('weapon rotation', function(data){
//         const obj = JSON.parse(data);
//         currentPlayerr.rotationWeapon = obj.rotation;
//         socket.broadcast.emit('weapon rotation', JSON.stringify(currentPlayerr));
// 	});
    
//     socket.on('selected gun', function(data){
//         const obj = JSON.parse(data);
//          currentPlayerr.selectedGun = obj.selectedGun;
//          socket.broadcast.emit('selected gun', JSON.stringify(currentPlayerr));
//     })

// 	socket.on('player shoot', function() {
// 		var data = {
// 			name: currentPlayerr.name
// 		};
// 		socket.broadcast.emit('player shoot', JSON.stringify(data));
// 	});

//     socket.on('health', function(data) {
//         const obj = JSON.parse(data); 
//         if(obj.from === currentPlayerr.name) {
//                 for(var player in players){       
//                     if(players[player].name === obj.name){
//                         console.log(players[player].name+"()()()");
//                         players[player].health -= obj.healthChange;
//                         var response = {
//                             name: players[player].name,
//                             health: players[player].health,
//                         };
//                         socket.emit('health', JSON.stringify(response));
//                         socket.broadcast.emit('health', JSON.stringify(response));
//                     };
//                 }
// 		}
// 	});

//     socket.on('disconnect', function() {
// 		socket.broadcast.emit('other player disconnected', JSON.stringify(currentPlayerr));
//         delete players[thisPlayerID];
//         delete sockets[thisPlayerID];
// 	});
// })

// function guid(){
//     function s4(){
//         return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
//     }
//     return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
// }
console.log('--server is running ...');
