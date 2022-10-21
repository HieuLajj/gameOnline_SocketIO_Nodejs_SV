module.exports = class LobbyState{
    constructor(){
        this.GAME = 'Game';
        this.LOBBY = 'Lobby'; //player waitting
        this.ENDGAME = 'EndGame';

        this.currentState = this.LOBBY;
    }
}