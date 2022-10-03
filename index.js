const { Console } = require('console');
const { domainToUnicode } = require('url');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

//global variables for the server
var enemies = [];
var playerSpawnPoints = [];
var clients = [];

app.get("/", function(req, res){
    res.send('hey you got back get"/"');
})

io.on('connection', function(socket){
    console.log("new connection: "+ socket.id);
    var currentPlayer = {};
    currentPlayer.name = 'unknown';

    socket.on('player connect', function(){
        console.log("so nguoi da co"+ clients.length);
        for( var i =0; i< clients.length; i++){
            var playerConnected = {
                name: clients[i].name,
                position: clients[i].position,
                health: clients[i].health,
                rotationWeapon: clients[i].rotationWeapon
            }
            socket.emit('other player connected', JSON.stringify(playerConnected));
            console.log("cap nhap nguoi thu"+i);
        }
    });

    socket.on('play2', function(data){
        console.log("bat dau van choi"+data);
        socket.emit("inPlayer2","cuoicungcungdc");
    })
    socket.on('play', function(data){
        const obj = JSON.parse(data);
        console.log(currentPlayer.name + 'recv: play '+ JSON.stringify(data));
         if(clients.length === 0){
            // numberOfEnemies = obj.enemySpawnPoints.length;
            // enemies = [];
            // obj.enemySpawnPoints.forEach(function(enemySpawnPoint){
            //      var enemy = {
            //         name: guid(),
            //         position: enemySpawnPoint.position,
            //         health: 100
            //     }
            // enemies.push(enemy);
            // })
            playerSpawnPoints = [];
            obj.playerSpawnPoints.forEach(function(_playerSpawnPoint){
                 var playerSpawnPoint = {
                     position: _playerSpawnPoint.position
                 }
                 playerSpawnPoints.push(playerSpawnPoint);
             })
        }
        //  var enemiesResponse = {
        //     enemies: enemies
        //  }


        // console.log(currentPlayer.name + "emit: enemies"+ JSON.stringify(enemiesResponse));
        // socket.emit("enemies", enemiesResponse);
         var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
         console.log(randomSpawnPoint.position+"pl");
        currentPlayer = {
            name: obj.name,
            position: randomSpawnPoint.position,
            rotationWeapon:[0.0,0.0,0.0],
            selectedGun: 0,
            health: 100
        }
        //console.log("xin chao ban den binh nguyen vo tan"+ currentPlayer.name );
        //console.log(obj.playerSpawnPoints[0].position);
        clients.push(currentPlayer);
        // console.log(currentPlayer.name + 'emit: play' + JSON.stringify(currentPlayer));

        socket.emit('play',JSON.stringify(currentPlayer));
        socket.broadcast.emit('other player connected', JSON.stringify(currentPlayer));
        console.log(":))")
        //socket.emit('other player connected', JSON.stringify(currentPlayer));
    })

    socket.on('player move', function(data) {
        const obj = JSON.parse(data);
		currentPlayer.position = obj.position;
        //console.log(JSON.stringify(currentPlayer))
		socket.broadcast.emit('player move', JSON.stringify(currentPlayer));
	});

    socket.on('weapon rotation', function(data){
        const obj = JSON.parse(data);
		currentPlayer.rotationWeapon= obj.rotation;
		socket.broadcast.emit('weapon rotation', JSON.stringify(currentPlayer));
	});
    
    socket.on('selected gun', function(data){
        const obj = JSON.parse(data);
        currentPlayer.selectedGun = obj.selectedGun;
        socket.broadcast.emit('selected gun', JSON.stringify(currentPlayer));
    })

	socket.on('player shoot', function() {
		var data = {
			name: currentPlayer.name
		};
		socket.broadcast.emit('player shoot', JSON.stringify(data));
	});

    socket.on('health', function(data) {
		console.log(currentPlayer.name+' recv: health: '+JSON.stringify(data));
		// only change the health once, we can do this by checking the originating player
		if(data.from === currentPlayer.name) {
			var indexDamaged = 0;
			if(!data.isEnemy) {
				clients = clients.map(function(client, index) {
					if(client.name === data.name) {
						indexDamaged = index;
						client.health -= data.healthChange;
					}
					return client;
				});
			} else {
				enemies = enemies.map(function(enemy, index) {
					if(enemy.name === data.name) {
						indexDamaged = index;
						enemy.health -= data.healthChange;
					}
					return enemy;
				});
			}

			var response = {
				name: (!data.isEnemy) ? clients[indexDamaged].name : enemies[indexDamaged].name,
				health: (!data.isEnemy) ? clients[indexDamaged].health : enemies[indexDamaged].health
			};
			console.log(currentPlayer.name+' bcst: health: '+JSON.stringify(response));
			socket.emit('health', response);
			socket.broadcast.emit('health', response);
		}
	});

    socket.on('disconnect', function() {
        console.log("nguoi choi da ngat ket noi");
		console.log(currentPlayer.name+' recv: disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name+' bcst: other player disconnected '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});
})

function guid(){
    function s4(){
        return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
console.log('--server is running ...');
