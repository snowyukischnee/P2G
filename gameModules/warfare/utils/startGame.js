'use strict'
const _ = require('lodash');
const roomCommit = require('./roomCommit');
module.exports = class game {
    constructor(nsp, room) {
        this.nsp = nsp;
        this.room = room;
    }

    start() {
        this.nsp.to(this.room.id).emit('players', _.map(this.room.players, 'id'));
        this.room.data.playing = true;
        this.room.data.started = new Date().getTime();
        this.clock();
        this.startPhase(0, 30);
    }

    clock() {
        let clock = setInterval(() => {
            this.nsp.to(this.room.id).emit('time', new Date().getTime() - this.room.data.started); // update current time
            if (this.room.data.playing == false) {
                clearInterval(clock);
            }
        }, 1000);
    }

    initPhase(index) {
        this.room.prevPlrs = this.room.players;
        for (let index = 0; index < this.room.players.length; index++) {
            for (let i = 0; i < 3; i++) this.room.players[index].action[i] = null;
        }
        this.nsp.to(this.room.id).emit('current_phase', index); // update current phase to user
        this.room.data.phase.spyStates = 0; // reset players spy states
        this.room.data.phase.actionStates = 0; // reset players action states
        this.room.data.phase.giveStates = 0; // reset players give states
        this.room.data.phase.started = new Date().getTime(); // start new phase
    }

    checkAction() {
        let val = 0;
        for (let player of this.room.players) val += 1 << player.alias;
        return this.room.data.phase.actionStates == val;
    }

    startPhase(index, phaseTime) {
        this.initPhase(index);
        let counter = setInterval(() => {
            this.nsp.to(this.room.id).emit('counter', new Date().getTime() - this.room.data.phase.started); // update counter in this phase
            if (new Date().getTime() - this.room.data.phase.started > phaseTime * 1000 || this.checkAction()) {
                this.nsp.to(this.room.id).emit('debug_message', 'end phase ' + index);
                this.room = roomCommit(this.room);
                clearInterval(counter);
                this.startPhase(index + 1, phaseTime);
            }
        }, 1000)
    }
}