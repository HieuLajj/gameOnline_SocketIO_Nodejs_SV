module.exports = class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }
    
    createEvents(){
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        
        socket.on('play', function(data){
            let playerSpawnPoints = [];
            const obj = JSON.parse(data);

            let countPlayer = 0;
            for(var key in server.connections){
                countPlayer++;
            }
            //if(countPlayer == 1){
                playerSpawnPoints = [];
                obj.playerSpawnPoints.forEach(function(_playerSpawnPoint){        
                    playerSpawnPoints.push(_playerSpawnPoint.position);
                })
            //}
            var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
            player.setPlayer(obj.name, randomSpawnPoint, 100, 0, [0.0,0.0,0.0]);
            socket.emit('play',JSON.stringify(player));
            socket.broadcast.emit('other player connected', JSON.stringify(player));
        })

        socket.on('player connect', function(){    
            for(var key in server.connections){
                if(player != server.connections[key].player){
                    socket.emit('other player connected', JSON.stringify(server.connections[key].player));
                }
            }
        });

        socket.on('weapon rotation', function(data){
            const obj = JSON.parse(data);
            player.rotationWeapon = obj.rotation;
            socket.broadcast.emit('weapon rotation', JSON.stringify(player));
	    });

        socket.on('selected gun', function(data){
            const obj = JSON.parse(data);
            player.selectedGun = obj.selectedGun;
            socket.broadcast.emit('selected gun', JSON.stringify(player));
        })

        socket.on('player shoot', function() {
		    var data = {
			    name: player.name
		    };
		    socket.broadcast.emit('player shoot', JSON.stringify(data));
	    });


        socket.on('player move', function(data) {
            const obj = JSON.parse(data);
            player.position = obj.position;
            socket.broadcast.emit('player move', JSON.stringify(player));
	    });

        socket.on('health', function(data) {
            const obj = JSON.parse(data); 
            if(obj.from === player.name) {

                for(var key in server.connections){
                    if(server.connections[key].player.name === obj.name){
                        console.log(server.connections[key].player.name+"()()()");
                        server.connections[key].player.health -= obj.healthChange;
                        var response = {
                            name: server.connections[key].player.name,
                            health: server.connections[key].player.health,
                        };
                        socket.emit('health', JSON.stringify(response));
                        socket.broadcast.emit('health', JSON.stringify(response));
                    };
                }
                    // for(var player in players){       
                    //     if(players[player].name === obj.name){
                    //         console.log(players[player].name+"()()()");
                    //         players[player].health -= obj.healthChange;
                    //         var response = {
                    //             name: players[player].name,
                    //             health: players[player].health,
                    //         };
                    //         socket.emit('health', JSON.stringify(response));
                    //         socket.broadcast.emit('health', JSON.stringify(response));
                    //     };
                    // }
            }
	    });


        socket.on("disconnect", function(){
            server.onDisconnected(connection);
        });
        
        socket.on("joinGame", function(){
            server.onAttemptToJoinGame(connection);
        });

        socket.on("fireBullet", function(){

        });
    
    }
}