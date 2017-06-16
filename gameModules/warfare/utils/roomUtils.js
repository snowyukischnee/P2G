'use strict'
const _ = require('lodash');
const room = require('../classes/room');
const player = require('../classes/player');
const startGame = require('./startGame');
module.exports = class roomUtils {
    constructor(nsp, gameName, maxPlayer) {
        this.nsp = nsp;
        this.gameName = gameName;
        this.maxPlayer = maxPlayer;
        this.rooms = [];
    }

    joinRoom(socket, playerName) {
        let availableRooms = this.findAvailableRooms();
        if (availableRooms.length == 0) { // if do not have any available room, create a new one
            let nroom = new room(this.gameName);
            this.rooms.push(nroom); // add a new room in the room list
            availableRooms.push(nroom);
        }
        availableRooms[0].players.push(new player(socket.id, playerName, availableRooms[0].id, 30, availableRooms[0].players.length)); // get the first available room
        socket.join(availableRooms[0].id); // join the room
        if (availableRooms[0].players.length == this.maxPlayer) {
            let game = new startGame(this.nsp, availableRooms[0]);
            game.start();
        }
    }

    leaveRoom(socket) {
        let roomToLeave = this.findRoom(socket);
        if (roomToLeave) {
            while (roomToLeave.lock == true) {};
            roomToLeave.players = _.filter(roomToLeave.players, (player) => player.id != socket.id);
            socket.leave(roomToLeave.id); // leave room
            if (roomToLeave.players.length == 0) this.rooms = _.filter(this.rooms, (room) => room.id != roomToLeave.id); // delete room if no player in room
        } // erase socket id in room players list
    }

    findPlayer(id) {
        let room = this.findRoomId(id);
        if (room) {
            let player = _.find(room.players, (player) => player.id == id);
            return player;
        }
    }

    findAvailableRooms() {
        return _.filter(this.rooms, (room) => room.players.length < this.maxPlayer && room.data.playing == false); // find room which have number of players < maxplayer and not playing
    }

    findRoomId(id) {
        return _.find(this.rooms, (room) => _.find(room.players, (player) => player.id == id)); // if socket is in player list, find room that it in
    }

    findRoom(socket) {
        return this.findRoomId(socket.id); // if socket is in player list, find room that it in
    }
}