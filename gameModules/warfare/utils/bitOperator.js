'use strict'
module.exports = class bitOperator {
    constructor(){}
    static getBit(val, index) {
        return (val & (1 << index) != 0);
    }

    static onBit(val, index) {
        return val | (1 << index);
    }

    static offBit(val, index) {
        return val & ~(1 << index);
    }

    static setBit(val, index, bit) {
        if (bit == 0) {
            return this.offBit(val, index);
        } else {
            return this.onBit(val, index);
        }
    }
}
