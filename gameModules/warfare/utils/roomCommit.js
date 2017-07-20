'use strict'
function update(room, guard, offensive, name, invName) {
    let diff = []; diff.length = room.players.length;
    for (let i = 0; i < diff.length; i++) diff[i] = 0;
    for (let i = 0; i < room.players.length; i++) {
        room.players[i].prevData.defenseTo = [];
        room.players[i].prevData.attackBy = [];
        room.players[i].prevData.defenseBy = [];
        room.players[i].prevData.attackTo = [];
    }
    for (let i = 0; i < room.players.length; i++) {
        for (let j = 0; j < room.players.length; j++) {
            if (i != j) {
                if (guard[i][j] == true && offensive[j][i] == true) {
                    diff[i] -= 1;
                    diff[j] -= 1;
                    room.players[i].prevData.defenseTo.push(invName[j]);
                    room.players[i].prevData.attackBy.push(invName[j]);
                    room.players[j].prevData.defenseBy.push(invName[i]);
                    room.players[j].prevData.attackTo.push(invName[i]);
                } else if (guard[i][j] == true && offensive[j][i] == false) {
                    diff[i] -= 1;
                    room.players[i].prevData.defenseTo.push(invName[j]);
                } else if (guard[i][j] == false && offensive[j][i] == true) {
                    diff[i] -= 3;
                    diff[j] -= 1;
                    room.players[i].prevData.attackBy.push(invName[j]);
                    room.players[j].prevData.attackTo.push(invName[i]);
                } else {
                    // not changed
                }
            }
        }
    }
    for (let index = 0; index < room.players.length; index++) {
       room.players[index].hp += diff[index];
       if (room.players[index].hp <= 0) room.players[index].hp = 0;
    }
    return room;
}

function initTable(h, w) {
    let table = [];
    table.length = h;
    for (let i = 0; i < h; i++) {
        table[i] = [];
        table[i].length = w;
        for (let j = 0; j < w; j++) {
            table[i][j] = false;
        }
    }
    return table;
}

module.exports = (room) => {
    //-----------------init----------------------------------
    let guard = initTable(room.players.length, room.players.length), offensive = initTable(room.players.length, room.players.length);
    let name = {};
    let invName = {};
    for (let index = 0; index < room.players.length; index++) {
        name[room.players[index].id] = index;
        invName[index] = room.players[index].id;
    }
    for (let index = 0; index < room.players.length; index++) { // fill attack defense tables
        for (let i = 0; i < 3; i++) {
            if (room.players[index].action[i] != null) {
                if (room.players[index].action[i].type == 0) guard[index][name[room.players[index].action[i].target]] = true;
                else if (room.players[index].action[i].type == 1) offensive[index][name[room.players[index].action[i].target]] = true;
            }
        }
    }
    room = update(room, guard, offensive, name, invName);
    return room;
}