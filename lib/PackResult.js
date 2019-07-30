const UNKNOWN = -2;
const UNAVAILABLE = -1;
const log = require('debug')('PackResult');

/**
 * Class that will hold calculate result
 * as well as handy methods
 */
class PackResult {
    constructor(another) {
        if (another) {
            log('Creating PackResult based on cache', another);
            this.packQty = another.packQty;
            this.packs = another.packs.slice();
            log('Creating PackResult based on cache', this);            
        } else {
            this.packQty = UNKNOWN;
            this.packs = [];
        }
    }

    isPackUnknown() {
        return this.packQty === UNKNOWN;
    }

    isPackUnavailable() {
        return this.packQty === UNAVAILABLE;
    }

    setPackQtyUnavailable() {
        this.packQty = UNAVAILABLE;
    }

    setPackQty(val) {
        this.packQty = val;
    }

    getPackQty() {
        return this.packQty;
    }

    addPack(p) {
        this.packs.push(p);
    }

    setPacks(ps) {
        this.packs = (ps || []).slice();
    }

    getPacks() {
        return this.packs;
    }

    /**
     * Given sub result, update the current result
     * @param {*} another 
     * @param {*} p 
     */
    updateFromSub(another, p) {
        log('updateFromSub', another, p);
        if (another) {
            // Pack qty = sub pack qty + 1 (current pack)
            this.packQty = another.packQty + 1;
            // packs used = sub pack used + current pack
            this.packs = another.packs, this.packs.push(p);
        }
    }
}

module.exports = PackResult;