var async = require('../lib');
var {expect} = require('chai');
var _ = require('lodash');

describe("detect", () => {

    function detectIteratee(call_order, x, callback) {
        setTimeout(() => {
            call_order.push(x);
            callback(null, x == 2);
        }, x*5);
    }
    
    it('detect', function(done){
        var call_order = [];
        async.detect([3,2,1], detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 25);
    });

    it('detect - multiple matches', function(done){
        var call_order = [];
        async.detect([3,2,2,1,2], detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,2,'callback',2,2,3]);
            done();
        }, 25);
    });

    it('detect error', (done) => {
        async.detect([3,2,1], (x, callback) => {
            setTimeout(() => {callback('error');}, 0);
        }, (err, result) => {
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('detect canceled', (done) => {
        var call_order = [];
        async.detect({'a': 3, 'b': 2, 'c': 1}, (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                return callback(false);
            }
            callback(null);
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3, 2]);
            done();
        }, 25);
    });

    it('detectSeries', function(done){
        var call_order = [];
        async.detectSeries([3,2,1], detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);

            expect(call_order).to.eql([3,2,'callback']);
            done();
        });
    });

    it('detectSeries - multiple matches', function(done){
        var call_order = [];
        async.detectSeries([3,2,2,1,2], detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);

            expect(call_order).to.eql([3,2,'callback']);
            done();
        });
    });

    it('detect no callback', (done) => {
        var calls = [];

        async.detect([1, 2, 3], (val, cb) => {
            calls.push(val);
            cb();
        });

        setTimeout(() => {
            expect(calls).to.eql([1, 2, 3]);
            done();
        }, 10);
    });

    it('detectSeries - ensure stop', (done) => {
        async.detectSeries([1, 2, 3, 4, 5], (num, cb) => {
            if (num > 3) throw new Error("detectSeries did not stop iterating");
            cb(null, num === 3);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(3);
            done();
        });
    });

    it('detectSeries canceled', (done) => {
        var call_order = [];
        async.detectSeries([3, 2, 1], (x, callback) => {
            async.setImmediate(() => {
                call_order.push(x);
                if (x === 2) {
                    return callback(false);
                }
                callback(null);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3, 2]);
            done();
        }, 50);
    });

    it('detectLimit', function(done){
        var call_order = [];
        async.detectLimit([3, 2, 1], 2, detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(() => {
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 50);
    });

    it('detectLimit - multiple matches', function(done){
        var call_order = [];
        async.detectLimit([3,2,2,1,2], 2, detectIteratee.bind(this, call_order), (err, result) => {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(() => {
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 50);
    });
});