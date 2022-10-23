let Connection = require('../Connection')
module.exports = class LobbyBase{
    constructor(id){
        this.id = id;
        //this.roommaster;
        this.connections = [];
    }

    onUpdate(){

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
            // console.log("------------------------");
            // console.log(lobby.id);//connection.lobby.id
            // console.log(lobby.lobbyState.currentState);
            // console.log(lobby.roommaster.player.id);
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
                    console.log(JSON.stringify(lobby.connections[key].player))
                    player = lobby.connections[key].player;
                    player.roommaster = 1;
                    connection.socket.broadcast.to(lobby.id).emit('change status', JSON.stringify(player));
                    connection.socket.to(lobby.connections[key].socket.id).emit('change roommaster', JSON.stringify(player));
                    break;
                }
                // connection.socket.broadcast.to(lobby.id).emit('change status', JSON.stringify(player));
                //connection.socket.to(pl)
                // if(player == connection.player){
                //     connection.socket.emit('change roommaster', JSON.stringify(player));
                // }else {
                //     connection.socket.emit('change status', JSON.stringify(player));
                // }
            }
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