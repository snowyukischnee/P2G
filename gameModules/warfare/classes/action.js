'use strict'
module.exports = class action {
    constructor(type, target) {
        this.type = type; // type of action 1: attack 0: defense
        this.target = target;
    }
}