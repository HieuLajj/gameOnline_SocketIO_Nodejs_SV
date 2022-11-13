var shortID = require("shortid");

module.exports = class Player{
    constructor(){
        this.id = shortID.generate();
        this.lobby = 0;
        this.roommaster = 0;
        this.team = 0;
        this.rebornTime = 0;
        this.isDeath = 1;
        this.levelhealth = 1;
    }

    displayerPlayerInformation(){
        let player = this;
        return '('+ player.name+':'+player.id+')';
    }

    setPlayer(name, position, health, selectedGun, rotationWeapon){
        this.name = name;
        this.position = position;
        this.health = health;
        this.selectedGun = selectedGun;
        this.rotationWeapon = rotationWeapon;
    }

    resetPlayer(){
        this.roommaster = 0;
        this.team = 0;
        this.rebornTime = 0;
        this.isDeath = 1;
        this.name = 0;
        this.position = 0;
        this.health = 0;
        this.selectedGun = 0;
        this.rotationWeapon = 0;
        this.levelhealth = 1;
    }
}