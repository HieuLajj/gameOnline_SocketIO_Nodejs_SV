let LobbyBase = require("./LobbyBase");
let GameLobbySettings = require("./GameLobbySetting");
let Connection = require("../Connection");
let LobbyState = require("../Utility/LobbyState")

module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;
        this.lobbyState = new LobbyState();
        this.roommaster;

    }

    onUpdate(){
        let lobby = this;      
    }

    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;
        if(currentPlayerCount + 1 > maxPlayerCount){
            return false;
        }
        return true;
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        super.onEnterLobby(connection);
        lobby.addPlayer(connection);
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        super.onLeaveLobby(connection);
        lobby.removePlayer(connection);
    }

    addPlayer(connection = Connection){

    }
    removePlayer(connection = Connection){

    }
    
}