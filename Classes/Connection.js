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

        socket.on("resetRoom", function(){
            server.onLoadRoom(connection);
        })

        socket.on('start game',function(data){
            //kiem tra so nguoi giua hai doi
            // if(connection.lobby.redTeam.length != connection.lobby.blueTeam.length) { 
            //     console.log("so thanh vien cua 2 doi khong can bang");
            //     return; 
            // }
            connection.lobby.redTeam.forEach(element => {
                if(element.player.roommaster == 0){
                    console.log("co thanh vien doi do chua san sang");
                    return;
                };
            });
            connection.lobby.blueTeam.forEach(element => {
                if(element.player.roommaster == 0){
                    console.log("co thanh vien doi xanh chua san sang");
                    return;
                };
            });
            // (let a in  connection.lobby.redTeam.connection.team){
            //     if(a==0){
            //         console.log("co thanh vien khong san sang");
            //     }
            // }

            socket.emit('start game',data);
            socket.broadcast.to(connection.lobby.id).emit('start game',data);
            connection.lobby.map = data;
            connection.lobby.lobbyState.currentState = connection.lobby.lobbyState.GAME;
            //xoa tat ca cac item con trong phong
            connection.lobby.serverItems = [];
            
            //cap nhap trang thai phong cho nguoi dung
            let statusLobby = {
                id: connection.lobby.id,
                currentState: connection.lobby.lobbyState.currentState,
            };
            socket.emit('statuslobby',JSON.stringify(statusLobby));
            socket.broadcast.emit('statuslobby',JSON.stringify(statusLobby));

            connection.lobby.connections.forEach(element => {
                element.player.rebornTime = 0;
            });
        })

        socket.on('changeTeam',function(){
            connection.lobby.removeTeam(connection);
            let promiseTeam = player.team ? 0 : 1;
            player.team = promiseTeam;
            if(promiseTeam){
                connection.lobby.redTeam.push(connection);
            }else{
                connection.lobby.blueTeam.push(connection);
            }
            socket.emit('changeTeam',JSON.stringify(player));
            socket.broadcast.to(connection.lobby.id).emit('changeTeam',JSON.stringify(player));
        })

        socket.on('mapPositionPlayer', function(data){
            const obj = JSON.parse(data);
            connection.lobby.positionBlue = [];
            connection.lobby.positionRed = [];
            obj.blueSpawnPoints.forEach(element => {
               connection.lobby.positionBlue.push(element);
            });
            obj.redSpawnPoints.forEach(element =>{
                connection.lobby.positionRed.push(element);
            })
            connection.lobby.redTeam.forEach((element,index) =>{
                let playerSpawnPoint = {
                    position: element.lobby.positionRed[index].position,
                    name: element.player.name
                };
                socket.emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
                socket.broadcast.to(connection.lobby.id).emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
            })
            connection.lobby.blueTeam.forEach((element,index) =>{
                let playerSpawnPoint = {
                    position: element.lobby.positionBlue[index].position,
                    name: element.player.name
                };
                socket.emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
                socket.broadcast.to(connection.lobby.id).emit('positionPlayerInMap', JSON.stringify(playerSpawnPoint));
            })
	    });

        socket.on('back lobby',function(data){
            var response = {
                map: connection.lobby.map,
                teamlose: data 
            };
            //let map = connection.lobby.map;
            socket.emit('back lobby',JSON.stringify(response));
            socket.broadcast.to(connection.lobby.id).emit('back lobby',JSON.stringify(response));

            //xoa tat ca cac item con trong phong
            connection.lobby.serverItems = [];

            connection.lobby.connections.forEach(element => {
                var response = {
                    name: element.player.name,
                    health: 100,
                    position: PositionSpawn.lobbyPosition,
                };
                element.socket.emit('reborn', JSON.stringify(response));
                element.socket.broadcast.to(element.lobby.id).emit('reborn', JSON.stringify(response));
            });
            connection.lobby.lobbyState.currentState = connection.lobby.lobbyState.LOBBY;
             //cap nhap trang thai phong cho nguoi dung
            let statusLobby = {
                id: connection.lobby.id,
                currentState: connection.lobby.lobbyState.currentState,
            };
            socket.emit('statuslobby',JSON.stringify(statusLobby));
            socket.broadcast.emit('statuslobby',JSON.stringify(statusLobby));

        })

        socket.on('player connect', function(){ 
            //chuyen doi
            server.lobbys[connection.lobby.id].connections.forEach(element => {
                if(player != element.player){
                    socket.emit('other player connected', JSON.stringify(element?.player));
                }
            });
        });

        socket.on('weapon rotation', function(data){
            const obj = JSON.parse(data);
            player.rotationWeapon = obj.rotation;
            socket.broadcast.to(connection.lobby.id).emit('weapon rotation', JSON.stringify(player));
	    });

        socket.on('selected gun', function(data){
            let levelgun = player.selectedGun;
            let levelhealths = player.levelhealth;
            //Math.floor(Math.random() * 2)
            switch(0){
                case 0:
                    levelgun+=1;
                    if(levelgun>4){levelgun=4}
                    player.selectedGun = levelgun;
                    console.log("tang dan");
                    break 
                case 1:
                    levelhealths+=1;
                    if(levelhealths>5){levelhealths=5;}
                    player.levelhealth = levelhealths;
                    console.log("tang mau")
                    break;
                default:
                    break;
            }
        
            socket.emit('selected gun',JSON.stringify(player));
            socket.broadcast.to(connection.lobby.id).emit('selected gun', JSON.stringify(player));


            // const obj = JSON.parse(data);
            // player.selectedGun = obj.selectedGun;
            // socket.broadcast.to(connection.lobby.id).emit('selected gun', JSON.stringify(player));
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
                server.connections.forEach(element => {
                    
                    if(element.player.name === obj.name){
                        let maubitru = obj.healthChange * (1/element.player.levelhealth);
                        element.player.health -= maubitru;
                        var response = {
                            name: element.player.name,
                            health: element.player.health,
                        };
                        socket.emit('health', JSON.stringify(response));
                        socket.broadcast.to(element.lobby.id).emit('health', JSON.stringify(response));

                        if(element.player.health<=0 && element.player.isDeath == 1){
                            element.player.rebornTime += 5000
                            element.player.isDeath = 0;
                            setTimeout (()=>{
                                if(!connection?.lobby) return;
                                if(connection.lobby.lobbyState.currentState == connection.lobby.lobbyState.LOBBY) return;
                                element.player.isDeath = 1;
                                let index, positionPlayer;
                                if(element.player.team==0){
                                    index = element.lobby.blueTeam.indexOf(element);
                                    positionPlayer = element.lobby.positionBlue[index]?.position;
                                }else{
                                    index = element.lobby.redTeam.indexOf(element);
                                    positionPlayer = element.lobby.positionRed[index]?.position;
                                }
                        
                                element.player.health = 100;
                                var response = {
                                    name: element.player.name,
                                    health: element.player.health,
                                    position: positionPlayer,
                                };
                                socket.emit('reborn', JSON.stringify(response));
                                socket.broadcast.to(element.lobby.id).emit('reborn', JSON.stringify(response));
                            },3000);
                            //element.player.rebornTime 
                        }
                    }
                });
            }
	    });

        socket.on('healthplus', function(data) {
            const obj = JSON.parse(data); 
            // console.log(obj);
            server.connections.forEach(element => {
                    
                if(element.player.name === obj.name){
                    let hp = element.player.health + obj.healthChange;
                    if(hp > 100){
                        hp = 100
                    }
                    element.player.health = hp;
                    var response = {
                        name: element.player.name,
                        health: element.player.health,
                    };
                    socket.emit('health', JSON.stringify(response));
                    socket.broadcast.to(element.lobby.id).emit('health', JSON.stringify(response));
                }
            })
            // var response = {
            //     name: obj.name,
            //     health: element.player.health,
            // };
            // socket.emit('health', JSON.stringify(response));
            // socket.broadcast.to(element.lobby.id).emit('health', JSON.stringify(response));
        })


        // chuphong, chua san sang, san sang
        socket.on('change status', function(data) {
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
        
        socket.on("item server", function(data){
            let indexItem;
            connection.lobby.serverItems.forEach((element,index) => {
                if(element.id == data){
                    indexItem = index;
                }
            });
            if(indexItem > -1){
                connection.lobby.serverItems.splice(indexItem,1);
                socket.emit('item server', JSON.stringify(data));
                socket.broadcast.to(connection.lobby.id).emit('item server', JSON.stringify(data));
            }
        })
    }
}