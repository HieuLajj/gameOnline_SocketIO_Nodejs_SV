var shortID = require("shortid");

module.exports = class Player{
    constructor(){
        this.id = shortID.generate();
        this.lobby = 0;
    }
  
    // constructor(name, position, health, selectedGun, rotationWeapon){
    //     this.id = shortID.generate();
    //     this.name = name;
    //     this.position = position;
    //     this.health = health;
    //     this.selectedGun = selectedGun;
    //     this.rotationWeapon = rotationWeapon;
    // }

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
}