const chai = require('chai');  
const expect = require('chai').expect;

const PackService = require('../lib/PackService'); 
const PackResult = require('../lib/PackResult');

var service;


describe('Unit Testing of Program by Test Cases: ', () => {
    let service;

    beforeEach(() => {
        service = new PackService();
    });

    it('should return object with name Vegemite Scroll for code VS5', () => {
        var vs5 = service.getBakeryMetadata('VS5');
        expect(vs5).to.be.an('object');
        expect(vs5).to.have.property('name', 'Vegemite Scroll');
    });

    it('should return pack options [5, 3] for code VS5', () => {
        var packs = service.getBakeryPackOptions('VS5');
        expect(packs).to.deep.equal([5,3]);
    });
    
    it('should return pack options [8, 5, 2] for code MB11', () => {
        var packs = service.getBakeryPackOptions('MB11');
        expect(packs).to.deep.equal([8, 5, 2]);
    });

    it('should return pack options [9, 5, 3] for code CF', () => {
        var packs = service.getBakeryPackOptions('CF');
        expect(packs).to.deep.equal([9,5,3]);
    });

    it('should produce PackQty=10, Packs=[5, 5] given pack options [5,3] and Qty 10', () => {
        var qty = 10, packs = [5,3], resultQty = 2, resultPacks = [5, 5];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(2);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    it('should produce PackQty=4, Packs=[2, 2, 2, 8] given pack options [8,5,2] and Qty 14', () => {
        var qty = 14, packs = [8,5,2], resultQty = 4, resultPacks = [2, 2, 2, 8];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    it('should produce PackQty=3, Packs=[3, 5, 5] given pack options [9,5,3] and Qty 13', () => {
        var qty = 13, packs = [9,5,3], resultQty = 3, resultPacks = [3, 5, 5];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    it('should produce PackQty=4, Packs=[9, 9, 9, 9] given pack options [10,9,2] and Qty 36', () => {
        var qty = 36, packs = [10, 9, 2], resultQty = 4, resultPacks = [9, 9, 9, 9];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    // For qty less than any of the pack size, should return -1 (unavailable)
    it('should produce PackQty=-1 (unavailable), Packs=[] given pack options [8,5] and Qty 3', () => {
        var qty = 3, packs = [5], resultQty = -1, resultPacks = [];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    // For qty same as one of the pack size, should always return 1
    it('should produce PackQty=1, Packs=[] given pack options [8,5] and Qty 5', () => {
        var qty = 5, packs = [5], resultQty = 1, resultPacks = [5];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    it('should produce PackQty=-2 (unknow), Packs=[] given empty pack options and Qty 5', () => {
        var qty = 5, packs = null, resultQty = -2, resultPacks = [];
        var result = service.calcuateMinPacks(packs, qty);
        expect(result.packQty).to.equal(resultQty);
        expect(result.packs.sort()).to.deep.equal(resultPacks);
    });

    it('should calculate total price = 54.8 given MB11, 1 x 8 $24.95 + 3 x 2 $9.95', () => {
        var result = new PackResult();
        result.setPackQty(4), result.setPacks([8,2,2,2]);
        var price = service.calculatePrice('MB11', result);
        expect(price.qty).to.equal(14);
        expect(price.totalPrice).to.equal(54.8);
        expect(price.breakdown).to.have.deep.property('2', {'qty': 3, 'name': '2 $9.95'});
        expect(price.breakdown).to.have.deep.property('8', {'qty': 1, 'name': '8 $24.95'});
    });

});