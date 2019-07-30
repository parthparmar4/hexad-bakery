const filename = '../bakery.dev.json';
const bakeryData = require(filename);


const PackResult = require('./PackResult');
const log = require('debug')('PackService');


/**
 * Class handle pack related process
 */
class PackService {
    constructor() {
        this.minPackCache = {};
    }

    /**
     * Generate a key in string which is unique given the pack options and quantity
     * @param {*array of number} packs Pack options as integer array
     * @param {*number} qty Quanty as integer
     */
    generateCachekey(packs, qty) {
        return '' + qty + '#' + JSON.stringify(packs);
    }

    /**
     * Retrieve bakery metadata from bakery.<env>.json based on given code (e.g. VS5)
     * @param {*string} product code
     * @return {object} refer to bakery.<env>.json
     */
    getBakeryMetadata(code) {
        return bakeryData[code];
    }

    /**
     * Retrieve bakery pack options from bakery.<env>.json based on given code (e.g. VS5)
     * and return array in descending order (e.g. [9, 5, 3])
     * @param {*string} product code
     * @return {number array}
     */
    getBakeryPackOptions(code) {
        let bakery = this.getBakeryMetadata(code);
        return bakery ? Object.keys(bakery.packs).map(x => { return parseInt(x); }).sort((a, b) => { return b - a; }) : null;
    }

    /**
     * Calculate total price and breakdown based on given produt code and packResult
     * @param {*string} Product code
     * @param {*PackResult} packResult 
     * @return {object} something like {qty: 14, totalPrice: 45.50, breakdown: {<packSize>: {qty: 1, name: <packsize $ price>}}}
     */
    calculatePrice(code, packResult) {
        let bakery = this.getBakeryMetadata(code);
        let result = { code, qty: 0, totalPrice: 0, breakdown: {} };
        packResult && packResult.getPacks().forEach(p => {
            let key = '' + p;
            result.qty += p;
            result.totalPrice += bakery.packs[key];
            result.breakdown[key] = result.breakdown[key] || { qty: 0, name: key + ' $' + bakery.packs[key].toFixed(2) }, result.breakdown[key].qty++;
        });
        return result;
    }

    /**
     * Given pack options and quantity, generate the result which contains
     * number of packs, and packs used (as array)
     * @param {*number array} pack Pack options as array
     * @param {*number} quantity Quantity as integer
     * @return {PackResult} which contains number of packs, and packs used (as array)
     */
    calcuateMinPacks(packs, quantity) {
        log('calcuateMinPacks Start', packs, quantity);

        let cacheKey = this.generateCachekey(packs, quantity), cache = this.minPackCache[cacheKey];
        // Revive cache data by creating a new PackResult object, as the object maybe changed
        // don't want the cache copy to be changed
        if (cache) return new PackResult(cache);

        let result = new PackResult(), minResult, minP;
        // Loop through all the pack options
        for (let idx in (packs || [])) {
            let p = packs[idx];
            // If the given quantity is same as the pack size
            if (quantity === p) {
                // Set pack quantity to 1, add current pack to result, then return (best match)
                result.setPackQty(1), result.addPack(p);
                break;
            }
            // If the given quantity is bigger than current pack size
            else if (quantity > p) {
                // Calculate the result by passing in same pack options, and quantity - current pack size
                let subresult = this.calcuateMinPacks(packs, quantity - p);
                if (!subresult.isPackUnavailable()) {
                    // If pack can be generated, then compare with current minimum
                    // If number of packs is less than current min, then mark it as min
                    if (!minResult || minResult.getPackQty() > subresult.getPackQty())
                        minResult = subresult, minP = p;
                } else // if no pack available for quantity - current pack size then mark the current result unavailable
                    result.setPackQtyUnavailable();
            } else // quantity less than current pack size, return unavailable result
                result.setPackQtyUnavailable();
        }
        // Update current result based on sub result
        result.updateFromSub(minResult, minP);
        // Store result data only into cache
        this.minPackCache[cacheKey] = Object.assign({}, result);

        log('put %s into cache with key %s', JSON.stringify(this.minPackCache[cacheKey]), cacheKey);

        log('calcuateMinPacks End', packs, quantity, result);
        return result;
    }

    /**
     * Given code and quantity, call calculateMinPacks() and calculatePrice to return total price and breakdown
     * @param {*string} code Product code
     * @param {*number} qty Quantity as integer
     */
    processOrder(code, qty) {
        let packOptions = this.getBakeryPackOptions(code);
        if (isNaN(+qty) || qty < 1) throw new Error('Invalid qty ' + qty);
        if (!packOptions || packOptions.length === 0) throw new Error('Bakery not found by code ' + code);
        let packResult = this.calcuateMinPacks(packOptions, qty);
        if (packResult.isPackUnavailable()) throw new Error('Cannot create packs for ' + qty + ', please try another quantity.');

        return this.calculatePrice(code, packResult);
    }
}

module.exports = PackService;