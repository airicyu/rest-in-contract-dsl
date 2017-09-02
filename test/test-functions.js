'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const supertest = require('supertest');
const dsl = require('./../index');
const RandExp = require('randexp');
const jp = require('jsonpath');
const faker = require('faker');
const moment = require('moment');
const uuidV4 = require('uuid/v4');

const { Middleware, Feature, Evaluator, Comparable, Mockable } = dsl.baseTypes;

const {
    float,
    integer,
    date,
    text,
    name,
    email,
    phone,
    address,
    uuid4,
    regex,
    jsonpath,
    sum,
    subtract,
    multiply,
    divide,
    recurrsiveCompare,
    recurrsiveEvaluate,
    recurrsiveMock,
    value,
    stubValue,
    testValue,
    evalContext,
    anyOf,
    notAnyOf
} = dsl.functions;

const { recurrsiveToString } = dsl.utils

describe('DSL functions test', function () {
    this.timeout(2000);

    before(function (done) {
        done();
    });

    it("Test Middleware ", function (done) {
        var testMiddleware = new Middleware({});
        expect(testMiddleware.serialId).to.equals('8e2dc6a8-0b49-4506-b705-d2a47456376b');
        expect(testMiddleware.type).to.null;
        expect(testMiddleware.options).to.eqls({});
        expect(Array.isArray(testMiddleware.features)).to.true;
        expect(testMiddleware.features.length).to.equals(0);

        testMiddleware = new Middleware({
            type: 'test',
            features: [Mockable, Comparable],
            compareFunc: function (value) {
                return value === 123;
            },
            mock: function () {
                return 123;
            },
            toJsonString: function () {
                return 'test()';
            }
        });

        var executeResult = testMiddleware.execute({
            features: [Mockable]
        });
        expect(executeResult).to.equals(123);

        executeResult = testMiddleware.execute({
            features: [Comparable],
            compareFunc: [123]
        });
        expect(executeResult).to.equals(true);

        executeResult = testMiddleware.execute({
            features: []
        });
        expect(executeResult).to.equals(executeResult);

        expect(Evaluator.type).to.equals('Evaluator');
        expect(Comparable.type).to.equals('Comparable');
        expect(Mockable.type).to.equals('Mockable');

        done();
    });

    it("Test float", function (done) {
        var fnInstance = float({ gt: 0.5, lt: 0.6 });
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;
        expect(fnInstance.compareFunc("abc")).to.false;
        expect(fnInstance.compareFunc(0.4)).to.false;
        expect(fnInstance.compareFunc(0.5)).to.false;
        expect(fnInstance.compareFunc(0.55)).to.true;
        expect(fnInstance.compareFunc(0.6)).to.false;
        expect(fnInstance.compareFunc(0.7)).to.false;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gt(0.5);
            expect(mockVal).to.lt(0.6);
        }
        expect(fnInstance.toJsonString()).to.equal('float({"gt":0.5,"lt":0.6})');


        fnInstance = float({ gte: 0.5, lte: 0.6 });
        expect(fnInstance.compareFunc(0.4)).to.false;
        expect(fnInstance.compareFunc(0.5)).to.true;
        expect(fnInstance.compareFunc(0.55)).to.true;
        expect(fnInstance.compareFunc(0.6)).to.true;
        expect(fnInstance.compareFunc(0.7)).to.false;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(0.5);
            expect(mockVal).to.lte(0.6);
        }
        expect(fnInstance.toJsonString()).to.equal('float({"gte":0.5,"lte":0.6})');


        fnInstance = float({ gte: -200 });
        expect(fnInstance.compareFunc(-200.1)).to.false;
        expect(fnInstance.compareFunc(-200)).to.true;
        expect(fnInstance.compareFunc(-199.9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(-200);
        }

        fnInstance = float({ gt: -10 });
        expect(fnInstance.compareFunc(-10.1)).to.false;
        expect(fnInstance.compareFunc(-10)).to.false;
        expect(fnInstance.compareFunc(-9.9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gt(-10);
        }

        fnInstance = float({ lte: 200 });
        expect(fnInstance.compareFunc(200.1)).to.false;
        expect(fnInstance.compareFunc(200)).to.true;
        expect(fnInstance.compareFunc(199.9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.lte(200);
        }

        fnInstance = float({ lte: 10 });
        expect(fnInstance.compareFunc(10.1)).to.false;
        expect(fnInstance.compareFunc(10)).to.true;
        expect(fnInstance.compareFunc(9.9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.lte(10);
        }

        fnInstance = float();
        expect(fnInstance.compareFunc(10.1)).to.true;
        expect(fnInstance.compareFunc(-10.1)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(0);
            expect(mockVal).to.lte(100);
        }

        done();
    });

    it("Test integer", function (done) {
        var fnInstance = integer({ gt: 1, lt: 3 });
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;
        expect(fnInstance.compareFunc("abc")).to.false;
        expect(fnInstance.compareFunc(0)).to.false;
        expect(fnInstance.compareFunc(1)).to.false;
        expect(fnInstance.compareFunc(2)).to.true;
        expect(fnInstance.compareFunc(3)).to.false;
        expect(fnInstance.compareFunc(4)).to.false;
        expect(fnInstance.compareFunc(2.5)).to.false;
        for (var i = 0; i < 50; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gt(1);
            expect(mockVal).to.lt(3);
        }
        expect(fnInstance.toJsonString()).to.equal('integer({"gt":1,"lt":3})');

        fnInstance = integer({ gte: 1, lte: 3 });
        expect(fnInstance.compareFunc(0)).to.false;
        expect(fnInstance.compareFunc(1)).to.true;
        expect(fnInstance.compareFunc(2)).to.true;
        expect(fnInstance.compareFunc(3)).to.true;
        expect(fnInstance.compareFunc(4)).to.false;
        expect(fnInstance.compareFunc(2.5)).to.false;
        for (var i = 0; i < 50; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(1);
            expect(mockVal).to.lte(3);
        }
        expect(fnInstance.toJsonString()).to.equal('integer({"gte":1,"lte":3})');

        fnInstance = integer({ gte: -200 });
        expect(fnInstance.compareFunc(-201)).to.false;
        expect(fnInstance.compareFunc(-200)).to.true;
        expect(fnInstance.compareFunc(-199)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(-200);
        }

        fnInstance = integer({ gt: -10 });
        expect(fnInstance.compareFunc(-11)).to.false;
        expect(fnInstance.compareFunc(-10)).to.false;
        expect(fnInstance.compareFunc(-9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gt(-10);
        }

        fnInstance = integer({ lte: 200 });
        expect(fnInstance.compareFunc(201)).to.false;
        expect(fnInstance.compareFunc(200)).to.true;
        expect(fnInstance.compareFunc(199)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.lte(200);
        }

        fnInstance = integer({ lte: 10 });
        expect(fnInstance.compareFunc(11)).to.false;
        expect(fnInstance.compareFunc(10)).to.true;
        expect(fnInstance.compareFunc(9)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.lte(10);
        }

        fnInstance = integer();
        expect(fnInstance.compareFunc(10)).to.true;
        expect(fnInstance.compareFunc(-10)).to.true;
        for (var i = 0; i < 1000; i++) {
            let mockVal = fnInstance.mock();
            expect(mockVal).to.gte(0);
            expect(mockVal).to.lte(100);
        }

        done();
    });

    it("Test date", function (done) {

        //test date
        var fnInstance = date({});
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('2000-01-01')).to.true;
        expect(fnInstance.compareFunc('2000-01-01 11:00:00')).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2}/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('date({})');


        //test past
        var fnInstance = date({
            format: 'YYYY:MM:DD',
            type: 'past'
        });

        expect(fnInstance.compareFunc('1900:01:01')).to.true;
        expect(fnInstance.compareFunc('3000:01:01')).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}:\d{2}:\d{2}/)[0] === mockValue).to.true;
        expect(moment(mockValue, 'YYYY:MM:DD').valueOf()).to.lt(moment.now());

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY:MM:DD","type":"past"})');


        //test future
        fnInstance = date({
            format: 'YYYY:MM:DD',
            type: 'future'
        });

        expect(fnInstance.compareFunc('1900:01:01')).to.false;
        expect(fnInstance.compareFunc('3000:01:01')).to.true;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}:\d{2}:\d{2}/)[0] === mockValue).to.true;
        expect(moment(mockValue, 'YYYY:MM:DD').valueOf()).to.gt(moment.now());

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY:MM:DD","type":"future"})');

        //test between
        fnInstance = date({
            format: 'YYYY-MM-DD HH:mm:ss',
            type: 'between',
            from: '1999-01-02 01:01:01',
            to: '2001-12-31 01:01:01'
        });

        expect(fnInstance.compareFunc('1999-01-01')).to.false;
        expect(fnInstance.compareFunc('1999-01-02')).to.false;
        expect(fnInstance.compareFunc('1999-01-03')).to.true;
        expect(fnInstance.compareFunc('2000-01-01')).to.true;
        expect(fnInstance.compareFunc('2001-12-31')).to.true;
        expect(fnInstance.compareFunc('2002-01-01')).to.false;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0] === mockValue).to.true;
        let mockValueTimestamp = moment(mockValue).valueOf();
        expect(mockValueTimestamp).to.gte(moment('1999-01-02 01:01:01').valueOf());
        expect(mockValueTimestamp).to.lte(moment('2001-12-31 01:01:01').valueOf());

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY-MM-DD HH:mm:ss","type":"between","from":"1999-01-02 01:01:01","to":"2001-12-31 01:01:01"})');


        //test between
        fnInstance = date({
            format: 'YYYY-MM-DD HH:mm:ss',
            type: 'between',
            from: moment('1999-01-02 01:01:01+00').valueOf(),
            to: moment('2001-12-31 01:01:01+00').valueOf()
        });

        expect(fnInstance.compareFunc('1999-01-01')).to.false;
        expect(fnInstance.compareFunc('1999-01-02')).to.false;
        expect(fnInstance.compareFunc('1999-01-03')).to.true;
        expect(fnInstance.compareFunc('2000-01-01')).to.true;
        expect(fnInstance.compareFunc('2001-12-31')).to.true;
        expect(fnInstance.compareFunc('2002-01-01')).to.false;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0] === mockValue).to.true;
        mockValueTimestamp = moment(mockValue).valueOf();
        expect(mockValueTimestamp).to.gte(moment('1999-01-02 01:01:01+00').valueOf());
        expect(mockValueTimestamp).to.lte(moment('2001-12-31 01:01:01+00').valueOf());
        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY-MM-DD HH:mm:ss","type":"between","from":915238861000,"to":1009760461000})');

        //test between
        fnInstance = date({
            format: 'YYYY-MM-DD HH:mm:ss',
            type: 'between',
            from: new Date(moment('1999-01-02 01:01:01+00').valueOf()),
            to: new Date(moment('2001-12-31 01:01:01+00').valueOf())
        });
        expect(fnInstance.compareFunc('1999-01-01')).to.false;
        expect(fnInstance.compareFunc('1999-01-02')).to.false;
        expect(fnInstance.compareFunc('1999-01-03')).to.true;
        expect(fnInstance.compareFunc('2000-01-01')).to.true;
        expect(fnInstance.compareFunc('2001-12-31')).to.true;
        expect(fnInstance.compareFunc('2002-01-01')).to.false;


        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[0] === mockValue).to.true;
        mockValueTimestamp = moment(mockValue).valueOf();
        expect(mockValueTimestamp).to.gte(moment('1999-01-02 01:01:01').valueOf());
        expect(mockValueTimestamp).to.lte(moment('2001-12-31 01:01:01').valueOf());

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY-MM-DD HH:mm:ss","type":"between","from":"1999-01-02T01:01:01.000Z","to":"2001-12-31T01:01:01.000Z"})');

        //test from
        fnInstance = date({
            format: 'YYYY-MM-DD',
            from: '1999-01-02',
        });

        expect(fnInstance.compareFunc('1999-01-01')).to.false;
        expect(fnInstance.compareFunc('1999-01-02')).to.true;
        expect(fnInstance.compareFunc('1999-01-03')).to.true;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2}/)[0] === mockValue).to.true;
        expect(!moment(mockValue, 'YYYY:MM:DD').isBefore(moment('1999-01-02'))).to.true;

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY-MM-DD","from":"1999-01-02"})');

        //test to
        fnInstance = date({
            format: 'YYYY-MM-DD',
            to: '1999-01-02',
        });

        expect(fnInstance.compareFunc('1999-01-01')).to.true;
        expect(fnInstance.compareFunc('1999-01-02')).to.true;
        expect(fnInstance.compareFunc('1999-01-03')).to.false;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/\d{4}-\d{2}-\d{2}/)[0] === mockValue).to.true;
        expect(!moment(mockValue, 'YYYY-MM-DD').isAfter(moment('1999-01-02'))).to.true;

        expect(fnInstance.toJsonString()).to.equal('date({"format":"YYYY-MM-DD","to":"1999-01-02"})');

        done();
    });

    it("Test text", function (done) {

        var fnInstance = text();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc(123)).to.false;
        expect(fnInstance.compareFunc("")).to.true;
        expect(fnInstance.compareFunc("It")).to.true;
        expect(fnInstance.compareFunc("It's good")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy.")).to.false;
        expect(fnInstance.compareFunc("It's good, but I'm happy. Now you have two apples.")).to.false;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/[A-Za-z\-' ]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('text({})');

        //test word
        var fnInstance = text({ type: "word" });

        expect(fnInstance.compareFunc(123)).to.false;
        expect(fnInstance.compareFunc("")).to.true;
        expect(fnInstance.compareFunc("It")).to.true;
        expect(fnInstance.compareFunc("It's good")).to.false;
        expect(fnInstance.compareFunc("It's good, but I'm happy.")).to.false;
        expect(fnInstance.compareFunc("It's good, but I'm happy. Now you have two apples.")).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/[A-Za-z\-]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('text({"type":"word"})');


        //test words
        fnInstance = text({ type: "words" });

        expect(fnInstance.compareFunc(123)).to.false;
        expect(fnInstance.compareFunc("")).to.true;
        expect(fnInstance.compareFunc("It")).to.true;
        expect(fnInstance.compareFunc("It's good")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy.")).to.false;
        expect(fnInstance.compareFunc("It's good, but I'm happy. Now you have two apples.")).to.false;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/[A-Za-z\-' ]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('text({"type":"words"})');


        //test sentence
        fnInstance = text({ type: "sentence" });

        expect(fnInstance.compareFunc(123)).to.false;
        expect(fnInstance.compareFunc("")).to.true;
        expect(fnInstance.compareFunc("It")).to.true;
        expect(fnInstance.compareFunc("It's good")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy.")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy. Now you have two apples.")).to.true;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/[A-Za-z\-'" ,.!?;]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('text({"type":"sentence"})');


        //test paragraphs
        fnInstance = text({ type: "paragraphs" });

        expect(fnInstance.compareFunc(123)).to.false;
        expect(fnInstance.compareFunc("")).to.true;
        expect(fnInstance.compareFunc("It")).to.true;
        expect(fnInstance.compareFunc("It's good")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy.")).to.true;
        expect(fnInstance.compareFunc("It's good, but I'm happy. Now you have two apples.")).to.true;

        mockValue = fnInstance.mock();
        expect(mockValue.match(/([A-Za-z\-'" ,.!?;]|\s)+/g)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('text({"type":"paragraphs"})');

        done();
    });

    it("Test name", function (done) {
        var fnInstance = name();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('Mrs. Mary Chan')).to.true;
        expect(fnInstance.compareFunc('maroon 5')).to.true;
        expect(fnInstance.compareFunc('12345')).to.false;
        expect(fnInstance.compareFunc('a,b,c')).to.false;
        expect(fnInstance.compareFunc(12345)).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/([A-Z][a-zA-Z0-9'. ]*)+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('name()');

        done();
    });

    it("Test email", function (done) {
        var fnInstance = email();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('chan123@test.com')).to.true;
        expect(fnInstance.compareFunc('chan_mary123@test.com')).to.true;
        expect(fnInstance.compareFunc('chan.mary123@test.com')).to.true;
        expect(fnInstance.compareFunc('chanmary123@test-ing.com')).to.true;
        expect(fnInstance.compareFunc('chanmary123@test_ing.com')).to.true;
        expect(fnInstance.compareFunc('chanmary123.test.com')).to.false;
        expect(fnInstance.compareFunc('12345')).to.false;
        expect(fnInstance.compareFunc('a,b,c')).to.false;
        expect(fnInstance.compareFunc(12345)).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/[a-zA-Z0-9_.]+@[a-zA-Z0-9_-]+\.[a-zA-Z]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('email()');

        done();
    });

    it("Test phone", function (done) {
        var fnInstance = phone();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('23456789')).to.true;
        expect(fnInstance.compareFunc('(852)23456789')).to.true;
        expect(fnInstance.compareFunc('(852) 23456789')).to.true;
        expect(fnInstance.compareFunc('852-23456789')).to.true;
        expect(fnInstance.compareFunc('852-23456789 x1234')).to.true;
        expect(fnInstance.compareFunc('852-23456789x1234')).to.true;
        expect(fnInstance.compareFunc('a23456789')).to.false;
        expect(fnInstance.compareFunc('123,456,789')).to.false;
        expect(fnInstance.compareFunc(23456789)).to.true;
        expect(fnInstance.compareFunc(true)).to.false;

        var mockValue = fnInstance.mock();

        expect(mockValue.match(/[0-9xX \-().]+/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('phone()');

        done();
    });

    it("Test address", function (done) {
        var fnInstance = address();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('Block 10, Baker Rd., UK')).to.true;
        expect(fnInstance.compareFunc('Block 10, \nBaker Rd., UK')).to.true;
        expect(fnInstance.compareFunc('chan.mary@test.com')).to.false;
        expect(fnInstance.compareFunc(12345)).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/([0-9A-Za-z ,'.]|\s)+/g)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('address()');

        done();
    });

    it("Test uuid4", function (done) {
        var fnInstance = uuid4();
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc(uuidV4())).to.true;
        expect(fnInstance.compareFunc('chan.mary@test.com')).to.false;
        expect(fnInstance.compareFunc('1234')).to.false;
        expect(fnInstance.compareFunc(12345)).to.false;

        var mockValue = fnInstance.mock();
        expect(mockValue.match(/[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('uuid4()');

        done();
    });

    it("Test regex", function (done) {
        var fnInstance = regex("[0-9]{4},[a-z]{6},[A-Z]{3}");
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc("0123,abcxyz,ABC")).to.true;
        expect(fnInstance.compareFunc('chan.mary@test.com')).to.false;
        expect(fnInstance.compareFunc('1234')).to.false;
        var mockValue = fnInstance.mock();
        expect(mockValue.match(/[0-9]{4},[a-z]{6},[A-Z]{3}/)[0] === mockValue).to.true;

        expect(fnInstance.toJsonString()).to.equal('regex("[0-9]{4},[a-z]{6},[A-Z]{3}")');

        fnInstance = regex("[0-9]{4}");
        expect(fnInstance.compareFunc("1234")).to.true;
        expect(fnInstance.compareFunc(1234)).to.false;

        done();
    });

    it("Test jsonpath", function (done) {
        var fnInstance = jsonpath("$.req.body");
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "100"
            }
        })).to.equals("100");

        expect(fnInstance.evaluate({
            req: {
                body: 100
            }
        })).to.equals(100);

        expect(fnInstance.toJsonString()).to.equal('jsonpath("$.req.body")');
        done();
    });

    it("Test sum", function (done) {
        var fnInstance = sum(jsonpath("$.req.body"), 1, 10);
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "100"
            }
        })).to.equals(111);

        expect(fnInstance.toJsonString()).to.equal('sum(jsonpath("$.req.body"), 1, 10)');

        fnInstance = sum();
        expect(fnInstance.evaluate({})).to.equals(0);

        done();
    });

    it("Test subtract", function (done) {
        var fnInstance = subtract(jsonpath("$.req.body"), 1);
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "100"
            }
        })).to.equals(99);

        expect(fnInstance.toJsonString()).to.equal('subtract(jsonpath("$.req.body"), 1)');

        fnInstance = subtract(100, jsonpath("$.req.body"));
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "10"
            }
        })).to.equals(90);

        done();
    });

    it("Test multiply", function (done) {
        var fnInstance = multiply(jsonpath("$.req.body"), 1.5);
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "100"
            }
        })).to.equals(150);

        expect(fnInstance.toJsonString()).to.equal('multiply(jsonpath("$.req.body"), 1.5)');

        done();
    });

    it("Test divide", function (done) {
        var fnInstance = divide(jsonpath("$.req.body"), 2);
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "100"
            }
        })).to.equals(50);

        expect(fnInstance.toJsonString()).to.equal('divide(jsonpath("$.req.body"), 2)');

        fnInstance = divide(200, jsonpath("$.req.body"));
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({
            req: {
                body: "10"
            }
        })).to.equals(20);

        fnInstance = divide(1, 0);
        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({})).to.equals(Infinity);

        done();
    });

    it("Test recurrsiveToString", function (done) {
        expect(recurrsiveToString([{ 1: 1 }, { "abc": "def" }, 3])).to.equal('[ { "1": 1 }, { "abc": "def" }, 3 ]');
        expect(recurrsiveToString([function () {}, { a: function () {} }])).to.equal('[ {  } ]');
        done();
    });

    it("Test recurrsiveEvaluate", function (done) {
        var testObj = [{ 1: 1 }, { "abc": "def" }, 3];
        expect(recurrsiveEvaluate(testObj).evaluate({})).to.eqls(testObj);
        expect(recurrsiveEvaluate(testObj).toJsonString()).to.equals('recurrsiveEvaluate([ { "1": 1 }, { "abc": "def" }, 3 ])');

        testObj = name();
        expect(recurrsiveEvaluate(testObj).evaluate({})).to.eqls(testObj);
        expect(recurrsiveEvaluate(testObj).toJsonString()).to.equals('recurrsiveEvaluate(name())');
        done();
    });

    it("Test recurrsiveMock", function (done) {
        var testObj = [{ a: 1 }];
        var fnInstance = recurrsiveMock(testObj);
        expect(fnInstance.mock()).to.eqls(testObj);
        expect(fnInstance.toJsonString()).to.equals('recurrsiveMock([ { "a": 1 } ])');

        testObj = text();
        fnInstance = recurrsiveMock(testObj);
        var mockResult = fnInstance.mock();
        expect(testObj.compareFunc(mockResult)).to.true;
        expect(fnInstance.toJsonString()).to.equals('recurrsiveMock(text({}))');

        testObj = recurrsiveEvaluate({ a: 1 });
        fnInstance = recurrsiveMock(testObj);
        mockResult = fnInstance.mock();
        expect(mockResult).to.equals(testObj);
        expect(fnInstance.toJsonString()).to.equals('recurrsiveMock(recurrsiveEvaluate({ "a": 1 }))');

        done();
    });

    it("Test recurrsiveCompare", function (done) {
        var testObj = [{ a: 1, b: { c: "abc", d: [1, 2, 3] } }];
        var compareObj = [{ a: 1, b: { c: "abc", d: [1, 2, 3] } }];
        var fnInstance = recurrsiveCompare(compareObj);

        expect(fnInstance.compareFunc(testObj)).to.true;
        expect(fnInstance.toJsonString()).to.equals('recurrsiveCompare([ { "a": 1, "b": { "c": "abc", "d": [ 1, 2, 3 ] } } ])');

        testObj = ["a"];
        compareObj = { 0: "a" };
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.false;

        testObj = { 0: "b" };
        compareObj = { 0: "a" };
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.false;

        testObj = 123;
        compareObj = 123;
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.true;

        testObj = "abc";
        compareObj = "abc";
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.true;

        testObj = new Date(1000);
        compareObj = new Date(1000);
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.true;

        testObj = "abcde";
        compareObj = text();
        fnInstance = recurrsiveCompare(compareObj);
        expect(fnInstance.compareFunc(testObj)).to.true;

        done();
    });

    it("Test evalContext", function (done) {
        var testContext = {
            req: {
                body: {
                    a: 1
                }
            }
        }
        var evalFn = function (context) {
            return context.req.body.a;
        };
        var fnInstance = evalContext(evalFn);
        expect(fnInstance.evaluate(testContext)).to.eqls(1);
        expect(fnInstance.toJsonString()).to.equals(
            `evalContext(${evalFn.toString()})`
        );

        done();
    });

    it("Test anyOf", function (done) {
        var fnInstance = anyOf('a', 'b', 'c', 10);

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;
        expect(fnInstance.hasFeature(Mockable)).to.true;

        expect(fnInstance.compareFunc('a')).to.true;
        expect(fnInstance.compareFunc('b')).to.true;
        expect(fnInstance.compareFunc('c')).to.true;
        expect(fnInstance.compareFunc('d')).to.false;
        expect(fnInstance.compareFunc(10)).to.true;
        expect(fnInstance.compareFunc(0)).to.false;

        var mockValue = fnInstance.mock();
        for (var i = 0; i < 50; i++) {
            expect(['a', 'b', 'c', 10].includes(mockValue)).to.true;
        }
        expect(fnInstance.toJsonString()).to.equal('anyOf("a", "b", "c", 10)');

        done();
    });

    it("Test notAnyOf", function (done) {
        var fnInstance = notAnyOf('a', 'b', 'c', 10);

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Comparable)).to.true;

        expect(fnInstance.compareFunc('a')).to.false;
        expect(fnInstance.compareFunc('b')).to.false;
        expect(fnInstance.compareFunc('c')).to.false;
        expect(fnInstance.compareFunc('d')).to.true;
        expect(fnInstance.compareFunc(10)).to.false;
        expect(fnInstance.compareFunc(0)).to.true;

        expect(fnInstance.toJsonString()).to.equal('notAnyOf("a", "b", "c", 10)');

        done();
    });

    it("Test value", function (done) {
        var fnInstance = value({ stub: 'a', test: 'b' });

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');
        expect(fnInstance.evaluateStubValue({})).to.equals('a');
        expect(fnInstance.evaluateTestValue({})).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('value({ "stub": "a", "test": "b" })');



        fnInstance = value({ client: 'a', server: 'b' });

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');
        expect(fnInstance.evaluateStubValue({})).to.equals('a');
        expect(fnInstance.evaluateTestValue({})).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('value({ "stub": "a", "test": "b" })');



        fnInstance = value({ consumer: 'a', producer: 'b' });

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');
        expect(fnInstance.evaluateStubValue({})).to.equals('a');
        expect(fnInstance.evaluateTestValue({})).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('value({ "stub": "a", "test": "b" })');



        fnInstance = value({ stub: 10, test: 20 });

        expect(fnInstance.evaluate({})).to.equals(10);
        expect(fnInstance.evaluate({ isTest: true })).to.equals(20);
        expect(fnInstance.evaluateStubValue({})).to.equals(10);
        expect(fnInstance.evaluateTestValue({})).to.equals(20);

        expect(fnInstance.toJsonString()).to.equal('value({ "stub": 10, "test": 20 })');

        done();
    });

    it("Test stubValue", function (done) {
        var fnInstance = stubValue({ stub: 'a', test: 'b' });

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('a');

        expect(fnInstance.toJsonString()).to.equal('"a"');



        fnInstance = stubValue({ client: 'a', server: 'b' });

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('a');

        expect(fnInstance.toJsonString()).to.equal('"a"');



        fnInstance = stubValue({ consumer: 'a', producer: 'b' });

        expect(fnInstance.evaluate({})).to.equals('a');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('a');

        expect(fnInstance.toJsonString()).to.equal('"a"');



        fnInstance = stubValue({ stub: 10, test: 20 });

        expect(fnInstance.evaluate({})).to.equals(10);
        expect(fnInstance.evaluate({ isTest: true })).to.equals(10);

        expect(fnInstance.toJsonString()).to.equal('10');

        done();
    });

    it("Test testValue", function (done) {
        var fnInstance = testValue({ stub: 'a', test: 'b' });

        expect(Middleware.isMiddleware(fnInstance)).to.be.true;
        expect(fnInstance.hasFeature(Evaluator)).to.true;

        expect(fnInstance.evaluate({})).to.equals('b');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('"b"');



        fnInstance = testValue({ client: 'a', server: 'b' });

        expect(fnInstance.evaluate({})).to.equals('b');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('"b"');



        fnInstance = testValue({ consumer: 'a', producer: 'b' });

        expect(fnInstance.evaluate({})).to.equals('b');
        expect(fnInstance.evaluate({ isTest: true })).to.equals('b');

        expect(fnInstance.toJsonString()).to.equal('"b"');



        fnInstance = testValue({ stub: 10, test: 20 });

        expect(fnInstance.evaluate({})).to.equals(20);
        expect(fnInstance.evaluate({ isTest: true })).to.equals(20);

        expect(fnInstance.toJsonString()).to.equal('20');

        done();
    });

});