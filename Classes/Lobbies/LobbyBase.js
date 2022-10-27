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

    onUpdate(){
        let lobby = this;
        let serverItems = lobby.serverItems;
        let aiList = serverItems.filter(item =>{
            return item instanceof AIBase;
        })
        aiList.forEach( ai => {
            ai.onUpdate(data => {
                lobby.connections.forEach(connection =>{
                    let socket = connection.socket;
                    socket.emit('updatePosition',data);
                })
            })
        })
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;
        console.log('Player'+player.displayerPlayerInformation()+'has entered the lobby ('+ lobby.id+')');      
        lobby.connections[player.id] = connection;
        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player;
        connection.lobby = undefined;
        if(connection?.player.id){
            delete lobby.connections[connection.player.id]
        }
       
        // xoa lobby khi khong co nguoi nao o trong
        let playerinLobby = 0;
        for(var key in lobby.connections){
            playerinLobby++;
        }
        if(playerinLobby==0 && lobby.id != 0){
            var lobbyInformation = {
                id: lobby.id,
                currentState: lobby.lobbyState.currentState,
                roommaster: lobby.roommaster.player.id
            };
            connection.socket.broadcast.to(0).emit('xoa Room', JSON.stringify(lobbyInformation));
            delete connection.server.lobbys[lobby.id];
            console.log("xoa thanh cong")
        }else{
            if(connection.player.roommaster == 1 && lobby.id != 0){
                for(var key in lobby.connections){
                    player = lobby.connections[key].player;
                    player.roommaster = 1;
                    connection.socket.broadcast.to(lobby.id).emit('change status', JSON.stringify(player));
                    connection.socket.to(lobby.connections[key].socket.id).emit('change roommaster', JSON.stringify(player));
                    break;
                }
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

        for(var key in connections){
            var enemyItems = {
                id: item.id,
                name: item.username,
                position: item.position.JSONData()
            };
            connections[key].socket.emit('serverSpawn', JSON.stringify(enemyItems));
        }
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