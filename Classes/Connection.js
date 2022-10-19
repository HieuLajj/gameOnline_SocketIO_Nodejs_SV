let PositionSpawn = require ("./PositionSpawn");
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
            player.setPlayer(obj.name, PositionSpawn.lobbyPosition , 100, 0, [0.0,0.0,0.0]);
            socket.emit('play',JSON.stringify(player));
            socket.broadcast.to(connection.lobby.id).emit('other player connected', JSON.stringify(player));
        })

        socket.on('player connect', function(){ 
            // console.log(connection.lobby.id+"fhahweiuawhe")
            // console.log(server.lobbys)   
            for(var key in server.lobbys[connection.lobby.id].connections){
                //console.log("key"+key);
                if(player != server.lobbys[connection.lobby.id].connections[key].player){
                    socket.emit('other player connected', JSON.stringify(server.connections[key]?.player));
                }
            }
            // for(var key in server.lobbys){
            //     console.log("key"+server.lobbys[key]);
            //     // if(player != server.lobbys[connection.lobby.id].connections[key].player){
            //     //     socket.emit('other player connected', JSON.stringify(server.connections[key].player));
            //     // }
            // }
        });

        socket.on('weapon rotation', function(data){
            const obj = JSON.parse(data);
            player.rotationWeapon = obj.rotation;
            socket.broadcast.to(connection.lobby.id).emit('weapon rotation', JSON.stringify(player));
	    });

        socket.on('selected gun', function(data){
            const obj = JSON.parse(data);
            player.selectedGun = obj.selectedGun;
            socket.broadcast.to(connection.lobby.id).emit('selected gun', JSON.stringify(player));
        })

        socket.on('player shoot', function() {
		    var data = {
			    name: player.name
		    };
		    socket.broadcast.to(connection.lobby.id).emit('player shoot', JSON.stringify(data));
	    });


        socket.on('player move', function(data) {
            const obj = JSON.parse(data);
            player.position = obj.position;
            socket.broadcast.to(connection.lobby.id).emit('player move', JSON.stringify(player));
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
                        socket.broadcast.to(connection.lobby.id).emit('health', JSON.stringify(response));
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
        
        socket.on("joinGame", function(data){
            server.onAttemptToJoinGame(connection,data);
        });

        socket.on("fireBullet", function(){

        });
    
    }
}