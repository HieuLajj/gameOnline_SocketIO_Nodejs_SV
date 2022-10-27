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
            const obj = JSON.parse(data);
            player.setPlayer(obj.name, PositionSpawn.lobbyPosition , 100, 0, [0.0,0.0,0.0]);
            socket.emit('play',JSON.stringify(player));
            socket.broadcast.to(connection.lobby.id).emit('other player connected', JSON.stringify(player));
        })

        socket.on('start game',function(data){
            socket.emit('start game',data);
            socket.broadcast.to(connection.lobby.id).emit('start game',data);
            //console.log(JSON.stringify(connection.lobby)+"truoc khi vao game");
            connection.lobby.map = data;
            connection.lobby.lobbyState.currentState = connection.lobby.lobbyState.GAME;

            
            // connection.lobby.redTeam.forEach(element => {
            //     console.log(element.player.id);
            // });
            
            //console.log(JSON.stringify(connection.lobby)+"sau khi vao game");
        })

        socket.on('mapPositionPlayer', function(data){
            let index;
            const obj = JSON.parse(data);
            connection.lobby.positionBlue = [];
            connection.lobby.positionRed = [];
            obj.blueSpawnPoints.forEach(element => {
               connection.lobby.positionBlue.push(element);
            });
            obj.redSpawnPoints.forEach(element =>{
                connection.lobby.positionRed.push(element);
            })
            // console.log(connection.lobby.positionBlue);
            // console.log("-----------------");
            // console.log(connection.lobby.positionRed);

            connection.lobby.redTeam.forEach((element,index) =>{
                let playerSpawnPoint = {
                    position: element.lobby.positionRed[index].position,
                    name: element.player.name
                };
                console.log("xanh"+playerSpawnPoint.name)
                socket.emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
                socket.broadcast.to(connection.lobby.id).emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
            })
            connection.lobby.blueTeam.forEach((element,index) =>{
                let playerSpawnPoint = {
                    position: element.lobby.positionBlue[index].position,
                    name: element.player.name
                };
                console.log("do"+playerSpawnPoint.name)
                socket.emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
                socket.broadcast.to(connection.lobby.id).emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
            })
            // if(player.team ==0){
            //     index = connection.lobby.blueTeam?.indexOf(connection);
            // }else{
            //     index = connection.lobby.redTeam?.indexOf(connection);
            // }
            // let playerSpawnPoint = {
            //     position: connection.lobby.positionBlue[index].position,
            //     name: player.name
            // };
            // socket.emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));


            //console.log(connection.lobby.positionBlue);
            // player.rotationWeapon = obj.rotation;
            // socket.broadcast.to(connection.lobby.id).emit('weapon rotation', JSON.stringify(player));
	    });

        socket.on('back lobby',function(){
            let map = connection.lobby.map;
            //console.log(map+"hahahahahahah")
            socket.emit('back lobby',map);
            socket.broadcast.to(connection.lobby.id).emit('back lobby',map);
            //console.log(JSON.stringify(connection.lobby)+"truoc khi thoat game");
            connection.lobby.lobbyState.currentState = connection.lobby.lobbyState.LOBBY;
            //console.log(JSON.stringify(connection.lobby)+"sau khi thoat game");
        })

        socket.on('player connect', function(){ 
            for(var key in server.lobbys[connection.lobby.id].connections){
                if(player != server.lobbys[connection.lobby.id].connections[key].player){
                    socket.emit('other player connected', JSON.stringify(server.connections[key]?.player));
                }
            }
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


        //move
        socket.on('player move', function(data) {
            const obj = JSON.parse(data);
            player.position = obj.position;
            socket.broadcast.to(connection.lobby.id).emit('player move', JSON.stringify(player));
	    });

        //hp
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
            }
	    });


        // chuphong, chua san sang, san sang
        socket.on('change status', function(data) {
            //const obj = JSON.parse(data);
            //console.log(data);
            player.roommaster = data;
            socket.broadcast.to(connection.lobby.id).emit('change status', JSON.stringify(player));
            socket.emit('change status', JSON.stringify(player));
	    });


        socket.on("disconnect", function(){
            server.onDisconnected(connection);
        });
        
        socket.on("joinGame", function(data){
            server.onAttemptToJoinGame(connection,data);
        });   
    }
}