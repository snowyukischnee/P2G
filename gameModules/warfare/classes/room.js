'use strict'
const uuid = require('uuid');
module.exports = class room {
    constructor(gameName) {
        this.gameName = gameName; // game name
        this.id = uuid.v4(); // room id
        this.players = []; // players list
        this.data = {
            playing: false, // is playing
            started: null, // started timestamp
            phase: { // phase data
                spyStates: null, // state of spy action of players
                actionStates: null, // state of atk/def action of players
                giveStates: null, // state of give action of players
                started: null, // phase started timestamp
            }
        }
    }
}
