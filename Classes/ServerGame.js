let Connection = require('./Connection');
let Player = require('./Player');

let LobbyBase = require('./Lobbies/LobbyBase')
let GameLobby = require('./Lobbies/GameLobby')
let GameLobbySetting = require('./Lobbies/GameLobbySetting');

module.exports = class ServerGame {
    constructor(){
        this.connections = [];
        this.lobbys = [];
        this.lobbys[0] = new LobbyBase(0);
    }

    onUpdate(){
        
        // for(var key in this.connections){
        //    console.log(this.connections[key].player.name+"--player--");
        // }
        // if(this.connections == 0){
        //     console.log("dang null");
        // }else{
        //     console.log("het null"+this.connections+"ok");
        // }
        
    }

    onConnected(socket){
        let server = this;

        let connection = new Connection();
        connection.socket = socket;
        connection.server = server;
        connection.player = new Player();
        connection.player.setPlayer("hieu", [2.0,2.0,2.0], 100, 0, [0.0,0.0,0.0]);

        let player = connection.player;
        let lobbys = server.lobbys;

        //console.log(JSON.stringify(connection.player)+"fakjlfhakjhefakjolehfokjalehfnaokjlefhaiwjh");
        server.connections[player.id] = connection;
        
        //console.log(JSON.stringify(server.connections[player.id].player.name)+"-------------hhh")
        console.log(server.connections[player.id].player.name+"-------------hhh")

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);
        
        return connection;
    }

    onDisconnected(connection = Connection){

        let server = this;
        let id = connection.player.id;
        delete server.connections[id];
        console.log('Player ' + connection.player.displayerPlayerInformation() + ' has disconnected');
        //Tell Other players currently in the lobby that we have disconnected from the game
        connection.socket.broadcast.to(connection.player.lobby).emit('other player disconnected',JSON.stringify(connection.player));

        //Preform lobby clean up
        server.lobbys[connection.player.lobby].onLeaveLobby(connection);

        // socket.broadcast.emit('other player disconnected', JSON.stringify(currentPlayerr));
        // delete players[thisPlayerID];
        // delete sockets[thisPlayerID];
    }

    onAttemptToJoinGame(connection = Connection) {
        //Look through lobbies for a gamelobby
        //check if joinable
        //if not make a new game
        let server = this;
        let lobbyFound = false;

        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        });
        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound) {
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All game lobbies full or we have never created one
        if(!lobbyFound) {
            console.log('Making a new game lobby');
            let gamelobby = new GameLobby(gameLobbies.length + 1, new GameLobbySetting('FFA', 2));
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);
        }
        
    }
    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID); // Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID];//assign reference to the new lobby

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }
}