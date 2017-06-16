'use strict'
const roomPlacement = require('../utils/roomUtils');
const action = require('../classes/action');
const bitOperator = require('../utils/bitOperator');

function exists(obj) {
    return typeof obj !== 'undefined';
}

function valid(data, roomPlacement, sid) {
    // check duplicate
    for (let i = 0; i < 3; i++) {
        if (data[i].type != 0 && data[i].type != 1) return false;
        if (sid == data[i].target) return false;
        if (roomPlacement.findRoomId(sid) != roomPlacement.findRoomId(data[i].target)) return false;
    }
    return true;
}


module.exports = (io) => {
    const gameName = 'warfare';
    const maxPlayer = 4;
    let namespace = io.of(gameName);
    const roomPlcm = new roomPlacement(namespace, gameName, maxPlayer);
    namespace.on('connection', (socket) => {
        //--------------handle on event socket connection----------------------
        socket.on('find_game', (data) => {
            roomPlcm.joinRoom(socket, data.name);
        });
        socket.on('leave_room', () => {
            roomPlcm.leaveRoom(socket);
        });
        socket.on('disconnect', () => {
            roomPlcm.leaveRoom(socket);
        });
        //----------------
        socket.on('check_sid', (sid) => {
            if (socket.id == sid) socket.emit('check_sid_result_rollback');
            else if (roomPlcm.findRoomId(sid) == roomPlcm.findRoomId(socket.id)) socket.emit('check_sid_result_commit');
            else socket.emit('check_sid_result_rollback');
        });
        socket.on('action_on', (data) => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            if (exists(room) && exists(player) && !bitOperator.getBit(room.data.phase.actionStates, player.alias)) {
                room.data.phase.actionStates = bitOperator.onBit(room.data.phase.actionStates, player.alias);
                if (data && data.length >= 3 && valid(data, roomPlcm, socket.id)) {
                    player.action[0] = new action(data[0].type, data[0].target);
                    player.action[1] = new action(data[1].type, data[1].target);
                    player.action[2] = new action(data[2].type, data[2].target);
                }
            } else {
                socket.emit('err', 'turn off action first state before turn on again');
            }
        });
        socket.on('action_off', () => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            console.log(player.alias)
            if (exists(room) && exists(player) && bitOperator.getBit(room.data.phase.actionStates, player.alias)) {
                room.data.phase.actionStates = bitOperator.offBit(room.data.phase.actionStates, player.alias);
                player.action[0] = null;
                player.action[1] = null;
                player.action[2] = null;
            } else {
                socket.emit('err', 'turn on action first state before turn off');
            }
        });
        socket.on('spy', (data) => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            if (exists(room) && exists(player) && !bitOperator.getBit(room.data.phase.spyStates, player.alias)) {
                room.data.phase.spyStates = bitOperator.onBit(room.data.phase.spyStates, player.alias);
                // commit spy
                socket.emit('spy_result');
            } else {
                socket.emit('err', 'spy action alreadly used');
            }
        });
        socket.on('give', (data) => {
            let room = roomPlcm.findRoomId(socket.id);
            if (!exists(room) || exists(room) && room.data.playing == false) {
                socket.emit('err', 'room not exists or game is not started');
                return;
            }
            let player = roomPlcm.findPlayer(socket.id);
            if (exists(room) && exists(player) && !bitOperator.getBit(room.data.phase.giveStates, player.alias)) {
                room.data.phase.spyStates = bitOperator.onBit(room.data.phase.giveStates, player.alias);
                // commit give
                socket.emit('give_result');
            } else {
                socket.emit('err', 'give action already used');
            }
        })
        socket.on('debug_obs', () => {
            socket.emit('debug_obs_result', roomPlcm.findRoom(socket));
        });
    })
    return io;
}