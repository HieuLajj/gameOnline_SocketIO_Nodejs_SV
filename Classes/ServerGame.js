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
      
    }

    onConnected(socket){
        let server = this;

        let connection = new Connection();
        connection.socket = socket;
        connection.server = server;
        connection.player = new Player();
        let player = connection.player;
        let lobbys = server.lobbys;
        server.connections[player.id] = connection;
        
        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);
        this.onLoadRoom(connection);
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
    }

    // them phong
    onAttemptToJoinGame(connection = Connection, data) {
        //Look through lobbies for a gamelobby
        //check if joinable
        //if not make a new game
        let server = this;
        let lobbyFound = false;

        for(var key in server.lobbys){
            if(data == key){
                lobbyFound  = true;
            }
        }

        //All game lobbies full or we have never created one
        if(!lobbyFound) {
            console.log('Making a new game lobby '+data);
            let gamelobby = new GameLobby(data, new GameLobbySetting('FFA', 2));
            this.addRoom(connection, gamelobby);
            server.lobbys[data] = gamelobby;
            server.lobbys[data].roommaster = connection;
            connection.player.roommaster = 1;
            console.log(JSON.stringify(connection.player)+"dang la chu phong");
            server.onSwitchLobby(connection, gamelobby.id);
        }
        else{
            server.onSwitchLobby(connection, data);
        }
        
    }

    // doi lobby
    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        if(connection.player.lobby != "0"){
            connection.socket.broadcast.to(connection.player.lobby).emit('other player disconnected',JSON.stringify(connection.player));
        }
        let lobbys = server.lobbys;
        connection.socket.join(lobbyID); // Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID];//assign reference to the new lobby
        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }

    onLoadRoom(connection = Connection){
        //console.log("okokdangchay")
        let server = this;
        for(var key in server.lobbys){
            if(key != 0){
                var lobbyInformation = {
                    id: server.lobbys[key].id,
                    currentState: server.lobbys[key].lobbyState.currentState,
                    roommaster: server.lobbys[key].roommaster.player.id
                };
                //console.log("okokoko"+JSON.stringify(server.lobbys[key]))
                connection.socket.emit('list Room',JSON.stringify(lobbyInformation));
            }
        }
    }
    addRoom(connection = Connection, gamelobby){
        connection.socket.broadcast.to(0).emit('list Room', JSON.stringify(gamelobby));
    }
}