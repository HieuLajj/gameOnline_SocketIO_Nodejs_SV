let LobbyBase = require("./LobbyBase");
let GameLobbySettings = require("./GameLobbySetting");
let Connection = require("../Connection");
let LobbyState = require("../Utility/LobbyState")
let Vector2 = require('../Vector2')
let ServerItem = require('../Utility/ServerItem')
let AIBase = require('../AI/AIBase')

module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;
        this.lobbyState = new LobbyState();
        this.roommaster;
        this.map;
        this.redTeam = [];
        this.blueTeam = [];
        this.positionRed = [];
        this.positionBlue = [];
    }

    onUpdate(){
        let lobby = this;   
        super.onUpdate();   
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

        //this.sendLobby(connection);
        //lobby.onSpawnAllPlayersIntoGame();
        //lobby.onSpawnAIIntoGame();


        //lobby.addPlayer(connection);
    }

    onLeaveLobby(connection = Connection){
        console.log("dang chay ne")
        let lobby = this;
        lobby.removeTeam(connection);
        super.onLeaveLobby(connection);
        lobby.removePlayer(connection);
        //lobby.onUnspawnAllAIInGame(connection);
    }

    onSpawnAllPlayersIntoGame() {
        let lobby = this;
        let connections = lobby.connections;

        // connections.forEach(connection => {
        //     lobby.addPlayer(connection);
        // });
    }

    onSpawnAIIntoGame() {
        //console.log("hahaha")
        let lobby = this;
        lobby.onServerSpawn(new AIBase(), new Vector2(-6, 2));
    }

    onUnspawnAllAIInGame(connection = Connection) {
        let lobby = this;
        let serverItems = lobby.serverItems;

        //Remove all server items from the client, but still leave them in the server others
        serverItems.forEach(serverItem => {
            connection.socket.emit('serverUnspawn', {
                id: serverItem.id
            });
        });
    }

    sendLobby(connection = Connection){
        let lobby = this;
        var lobbyInformation = {
            id: lobby.id,
            currentState: lobby.lobbyState.currentState,
            roommaster: lobby.roommaster.player.id
        };
        connection.socket.emit('lobby',JSON.stringify(lobbyInformation));
    }

    addPlayer(connection = Connection){

    }
    removePlayer(connection = Connection){

    }
    removeTeam(connection = Connection){
        //console.log("dang chay ne 3"+connection.lobby.id );
        if(connection.player.team==0){
            let index = connection.lobby.blueTeam?.indexOf(connection);
            //console.log("dang chay ne 3 ok"+index );
            if (index > -1) {
                connection.lobby.blueTeam.splice(index, 1);
                console.log("xoa doi blue thanh cong");
            }
        }else{
            let index = connection.lobby.redTeam?.indexOf(connection);
            //console.log("dang chay ne 3 ok"+index );
            if (index > -1) {
                connection.lobby.redTeam.splice(index, 1);
                console.log("xoa doi red thanh cong");
            }
        }
    }
    
}