const PackService = require('./lib/PackService');

const fs = require('fs');

class Bakery {
    constructor() {
        this.packService = new PackService();
    }

    /**
     * Read orders from input.txt in current directory
     * @return {object} an array of order object, which is something like {qty: 10, code: 'VS5', raw: '10 VS5'}
     */
    readOrders() {
        let content = fs.readFileSync('./input.txt');
        content = content ? content.toString() : '';
        // Filter out empty lines if any
        let lines = content.split(/\r\n|\n/).filter( l => {return l && l.trim();});
        return lines.map( line => { let spt = line.split(/\s+/); return {qty: spt[0], code: spt[1], raw: line}; });
    }

    /**
     * call readOrders() method and then process them one by one
     * by calling packService.processOrder(), and print result
     */
    processOrders() {
        let orders = this.readOrders();
        (orders || []).forEach( order => {
            try {
                let price = this.packService.processOrder(order.code, order.qty);
                console.log('%s %s $%d', order.qty, order.code, price.totalPrice.toFixed(2));
                Object.keys(price.breakdown || {}).forEach( k => {
                    let bk = price.breakdown[k];
                    console.log('\t%s x %s', bk.qty, bk.name);
                });

            } catch (e) {
                console.error('Line "%s": error when processing order', order.raw, e.message);
            }
        });
    }
}

var bakery = new Bakery();
bakery.processOrders();


