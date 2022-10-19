let Connection = require('../Connection')
module.exports = class LobbyBase{
    constructor(id){
        this.id = id;
        this.connections = [];
    }

    onUpdate(){

    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;
        console.log('Player'+player.displayerPlayerInformation()+'has entered the lobby ('+ lobby.id+')');      
        //lobby.connections.push(connection);
        lobby.connections[player.id] = connection;
        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;

        console.log('Player'+player.displayerPlayerInformation()+'has left the lobby ('+ lobby.id+')');
        
        connection.lobby = undefined;
        //let index = lobby.connections.indexOf(connection);

        // console.log("-----chuaxoa---------------");
        // for(var key in lobby.connections){
        //     console.log(lobby.connections[key].player);
        // }

        //if(index > -1){
            //lobby.connections.splice(index,1);
        if(connection?.player.id){
            delete lobby.connections[connection.player.id]
        }
        //}
        
        let playerinLobby = 0;
        // console.log("---------daxoa----------");
        for(var key in lobby.connections){
            playerinLobby++;
        }
        if(playerinLobby==0 && lobby.id != 0){
            connection.socket.broadcast.to(0).emit('xoa Room', JSON.stringify(lobby));
            delete connection.server.lobbys[lobby.id];
            console.log("xoa thanh cong")
        }
        // if(lobby.id!=0){
        //     console.log(lobby.id+"iiiii"+playerinLobby);
        // }
        // if(lobby.connections.length){
        //     console.log("okokokok")
        // }

    }
}