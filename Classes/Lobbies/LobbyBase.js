let Connection = require('../Connection')
let ServerItem = require('../Utility/ServerItem')
let Vector2 = require('../Vector2')
let AIBase = require('../AI/AIBase')

module.exports = class LobbyBase{
    constructor(id){
        this.id = id;
        this.connections = [];
        this.serverItems = [];
    }

    // let index = connections?.indexOf(connection);
    //     if (index > -1) {
    //         connections.splice(index, 1);
    //     }

    onUpdate(){
        let lobby = this;
        let serverItems = lobby.serverItems;
        if (lobby.id == 0 || serverItems.length >=10 || lobby.lobbyState.currentState == lobby.lobbyState.LOBBY) return
        let serverItem = new ServerItem();
        let xcount = Math.floor(Math.random() * 50);
        let ycount = Math.floor(Math.random() * 50);

        lobby.onServerSpawn(serverItem, new Vector2(xcount, ycount));
        var items = {
            id: serverItem.id,
            name: serverItem.username,
            position: serverItem.position.JSONData()
        };
        lobby.connections.forEach(connection =>{
            let socket = connection.socket;
            socket.emit('serverSpawn',JSON.stringify(items));
        })
        // let aiList = serverItems.filter(item =>{
        //     return item instanceof AIBase;
        // })
        // aiList.forEach( ai => {
        //     ai.onUpdate(data => {
        //         lobby.connections.forEach(connection =>{
        //             let socket = connection.socket;
        //             socket.emit('updatePosition',data);
        //         })
        //     })
        // })
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;
        connection.socket.leave(player?.lobby);
        player.lobby = lobby.id;
        connection.lobby = lobby;
        connection.socket.join(lobby.id);
        // kiem tra xem co connection do trong lobby ko
        let index = lobby.connections.indexOf(connection);
        if (index <-1) return;
        lobby.connections.push(connection);
        //console.log('Player'+player.displayerPlayerInformation()+'has entered the lobby ('+ lobby.id+')');      
        //lobby.connections[player.id] = connection;
        //chuyen doiu
        if (lobby.id == 0){
            connection.player.roommaster = 0;
        }else{
            if(connection.lobby.blueTeam.length > connection.lobby.redTeam.length){
                connection.lobby.redTeam.push(connection);
                connection.player.team = 1;
            }else{
                connection.lobby.blueTeam.push(connection);
                connection.player.team = 0;
            }
        }

        //player.lobby = lobby.id;
        //connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player;
        connection.lobby = undefined;
        // if(connection?.player.id){
        //     delete lobby.connections[connection.player.id]
        // }
        //chuyen doi
        let index = lobby.connections?.indexOf(connection);
        if (index > -1) {
            lobby.connections.splice(index, 1);
        }
       
        // xoa lobby khi khong co nguoi nao o trong
        // let playerinLobby = 0;
        // for(var key in lobby.connections){
        //     playerinLobby++;
        // }
        let playerinLobby = lobby.connections.length;
        //chuyen doi
        if(playerinLobby==0 && lobby.id != 0){
            var lobbyInformation = {
                id: lobby.id,
                currentState: lobby.lobbyState.currentState,
                roommaster: lobby.roommaster.player.id
            };
            connection.socket.emit('xoa Room', JSON.stringify(lobbyInformation));
            connection.socket.broadcast.emit('xoa Room', JSON.stringify(lobbyInformation));
            delete connection.server.lobbys[lobby.id];
            console.log("xoa thanh cong")
        }else{
            if(connection.player.roommaster == 1 && lobby.id != 0){
                let connectionfirst = lobby.connections[0];
                player = connectionfirst.player;
                player.roommaster = 1;
                connection.socket.broadcast.to(lobby.id).emit('change status', JSON.stringify(player));
                connection.socket.to(connectionfirst.socket.id).emit('change roommaster', JSON.stringify(player));
            }
        }
    }

    onServerSpawn(item = ServerItem, location = Vector2) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let connections = lobby.connections;

        //Set Position
        item.position = location;
        //Set item into the array
        serverItems.push(item);

        // for(var key in connections){
        //     var enemyItems = {
        //         id: item.id,
        //         name: item.username,
        //         position: item.position.JSONData()
        //     };
        //     connections[key].socket.emit('serverSpawn', JSON.stringify(enemyItems));
        // }
        //chuyen doi
        // connections.forEach(element => {
        //     var enemyItems = {
        //         id: item.id,
        //         name: item.username,
        //         position: item.position.JSONData()
        //     };
        //     element.socket.emit('serverSpawn', JSON.stringify(enemyItems));
        // });


        // console.log("===========okokok")
        // connections.forEach(connection => {
        //     console.log(connection.player)
        //     console.log(connection)
        // })

        //Tell everyone in the room
        // connections.forEach(connection => {
        //     console.log("conteajhfe")
        //     var enemyItems = {
        //         id: item.id,
        //         name: item.username,
        //         position: item.position.JSONData()
        //     };
        //     connection.socket.emit('serverSpawn', JSON.stringify(enemyItems));
        // });
    }

    onServerUnspawn(item = ServerItem) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let connections = lobby.connections;

        //Remove item from array
        lobby.deleteServerItem(item);
        //Tell everyone in the room
        connections.forEach(connection => {
            connection.socket.emit('serverUnspawn', {
                id: item.id
            });
        });
        //chuyen doi

    }

    deleteServerItem(item = ServerItem) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let index = serverItems.indexOf(item);

        //Remove our item out the array
        if (index > -1) {
            serverItems.splice(index, 1);
        }
    }


    // onLoadRoom(connection = Connection){
    //     console.log("dang hoat doing")
    //     let server = this;
    //     for(var key in server.lobbys){
    //         if(key != 0){
    //             connection.socket.emit('list Room',JSON.stringify(server.lobbys[key]));
    //         }
    //     }
    // }
    // addRoom(connection = Connection, gamelobby){
    //     connection.socket.broadcast.to(0).emit('list Room', JSON.stringify(gamelobby));
    // }
}