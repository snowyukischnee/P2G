'use strict'
module.exports = class player {
    constructor(id, name, room, hp, alias) {
        this.id = id;
        this.name = name;
        this.room = room; // room id
        this.hp = hp; // health point
        this.alias = alias; // number order of player in room
        this.action = {
            action0: null,
            action1: null,
            action2: null
        }
    }
}
