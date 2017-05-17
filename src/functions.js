'use strict';
const { Middleware, Feature, Evaluator, Comparable, Mockable } = require('./base-types').types;
const { recurrsiveToString } = require('./utils');

const RandExp = require('randexp');
const jp = require('jsonpath');
const faker = require('faker');
const moment = require('moment');
const uuidV4 = require('uuid/v4');

const float = function (options = {}) {
    let fn = new Middleware({
        type: 'float',
        features: [
            Comparable, Mockable
        ],
        options: {
            gt: options.gt,
            gte: options.gte,
            lt: options.lt,
            lte: options.lte
        },
        compareFunc: function (value) {
            if (typeof value !== 'number') {
                return false;
            }
            if (this.options.gt !== undefined && value <= this.options.gt) {
                return false;
            }
            if (this.options.gte !== undefined && value < this.options.gte) {
                return false;
            }
            if (this.options.lt !== undefined && value >= this.options.lt) {
                return false;
            }
            if (this.options.lte !== undefined && value > this.options.lte) {
                return false;
            }
            return true;
        },
        mock: function () {
            let max = undefined;
            if (this.options.lt !== undefined && (max === undefined || this.options.lt < max)) {
                max = this.options.lt;
            }
            if (this.options.lte !== undefined && (max === undefined || this.options.lte < max)) {
                max = this.options.lte;
            }
            let min = undefined;
            if (this.options.gt !== undefined && (min === undefined || this.options.gt > min)) {
                min = this.options.gt;
            }
            if (this.options.gte !== undefined && (min === undefined || this.options.gte > min)) {
                min = this.options.gte;
            }
            if (max !== undefined && min === undefined) {
                min = max > 0 ? 0 : max - 100;
            } else if (min !== undefined && max === undefined) {
                max = min < 0 ? 0 : min + 100;
            } else if (max === undefined && min === undefined) {
                min = 0;
                max = 100;
            }

            return Math.random() * (max - min) + min;
        },
        toJsonString: function () {
            return `float(${JSON.stringify(this.options)})`;
        }
    });
    return fn;
}

const integer = function (options = {}) {
    let fn = new Middleware({
        type: 'integer',
        features: [
            Comparable, Mockable
        ],
        options: {
            gt: options.gt,
            gte: options.gte,
            lt: options.lt,
            lte: options.lte
        },
        compareFunc: function (value) {
            if (typeof value !== 'number') {
                return false;
            }
            if (this.options.gt !== undefined && value <= this.options.gt) {
                return false;
            }
            if (this.options.gte !== undefined && value < this.options.gte) {
                return false;
            }
            if (this.options.lt !== undefined && value >= this.options.lt) {
                return false;
            }
            if (this.options.lte !== undefined && value > this.options.lte) {
                return false;
            }
            if (Math.floor(value) !== value) {
                return false;
            }
            return true;
        },
        mock: function () {
            let max = undefined;
            if (this.options.lt !== undefined && (max === undefined || this.options.lt < max)) {
                max = this.options.lt;
            }
            if (this.options.lte !== undefined && (max === undefined || this.options.lte < max)) {
                max = this.options.lte;
            }
            let min = undefined;
            if (this.options.gt !== undefined && (min === undefined || this.options.gt > min)) {
                min = this.options.gt;
            }
            if (this.options.gte !== undefined && (min === undefined || this.options.gte > min)) {
                min = this.options.gte;
            }
            if (max !== undefined && min === undefined) {
                min = max > 0 ? 0 : max - 100;
            } else if (min !== undefined && max === undefined) {
                max = min < 0 ? 0 : min + 100;
            } else if (max === undefined && min === undefined) {
                min = 0;
                max = 100;
            }

            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        toJsonString: function () {
            return `integer(${JSON.stringify(this.options)})`;
        }
    });
    return fn;
}

const date = function (options = {}) {
    let fn = new Middleware({
        type: 'date',
        features: [
            Comparable, Mockable
        ],
        options: {
            format: options.format || moment.ISO_8601,
            type: options.type,
            from: options.from,
            to: options.to
        },
        compareFunc: function (value) {
            let dateValue = moment(value, this.options.format);
            let timestamp = dateValue.valueOf();
            if (!dateValue.isValid()) {
                return false;
            }
            if (this.options.from) {
                let fromDate = moment(this.options.from);
                if (fromDate.isValid()) {
                    let fromTimestamp = fromDate.valueOf;
                    if (timestamp < fromTimestamp) {
                        return false;
                    }
                }
            }
            if (this.options.to) {
                let toDate = moment(this.options.to);
                if (toDate.isValid()) {
                    let toTimestamp = toDate.valueOf;
                    if (timestamp > toTimestamp) {
                        return false;
                    }
                }
            }
            return true;
        },
        mock: function () {
            let dateStr = '';
            if (this.options.type === 'past') {
                dateStr = faker.date.past();
            } else if (this.options.type === 'future') {
                dateStr = faker.date.future();
            } else if (this.options.type === 'between') {
                dateStr = faker.date.between(this.options.from, this.options.to);
            } else {
                dateStr = faker.date.recent();
            }
            return moment(dateStr).format(this.options.format);
        },
        toJsonString: function () {
            return `date(${JSON.stringify(this.options)})`;
        }
    });
    return fn;
}

const text = function (options = {}) {
    let fn = new Middleware({
        type: 'text',
        features: [
            Comparable, Mockable
        ],
        options: {
            type: options.type
        },
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let type = this.options.type;
                let matchResult = null;
                if (type === 'word') {
                    matchResult = stringValue.match(/[A-Za-z\-]+/);
                } else if (type === 'words') {
                    matchResult = stringValue.match(/[A-Za-z\-' ]+/);
                } else if (type === 'sentence') {
                    matchResult = stringValue.match(/[A-Za-z\-'" ,.!?;]+/);
                } else if (type === 'paragraphs') {
                    matchResult = stringValue.match(/[A-Za-z\-'" ,.!?;]+/);
                }
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            let type = this.options.type;
            if (type === 'word') {
                return faker.lorem.word();
            } else if (type === 'words') {
                return faker.lorem.words();
            } else if (type === 'sentence') {
                return faker.lorem.sentence();
            } else if (type === 'paragraphs') {
                return faker.lorem.paragraphs();
            }
            return faker.lorem.words();
        },
        toJsonString: function () {
            return `text(${JSON.stringify(this.options)})`;
        }
    });
    return fn;
}


const name = function () {
    let fn = new Middleware({
        type: 'name',
        features: [
            Comparable, Mockable
        ],
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let matchResult = stringValue.match(/([A-Z][a-zA-Z0-9'. ]*)+/);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return faker.name.findName();
        },
        toJsonString: function () {
            return 'name()';
        }
    });
    return fn;
}

const email = function () {
    let fn = new Middleware({
        type: 'email',
        features: [
            Comparable, Mockable
        ],
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let matchResult = stringValue.match(/[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return faker.internet.email();
        },
        toJsonString: function () {
            return 'email()';
        }
    });
    return fn;
}

const phone = function () {
    let fn = new Middleware({
        type: 'phone',
        features: [
            Comparable, Mockable
        ],
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let matchResult = stringValue.match(/[0-9xX \-().]+/);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return faker.phone.phoneNumber();
        },
        toJsonString: function () {
            return 'phone()';
        }
    });
    return fn;
}

const address = function () {
    let fn = new Middleware({
        type: 'address',
        features: [
            Comparable, Mockable
        ],
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let matchResult = stringValue.match(/[0-9A-Za-z ,'.]+/);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return faker.address.streetAddress();
        },
        toJsonString: function () {
            return 'address()';
        }
    });
    return fn;
}

const uuid4 = function () {
    let fn = new Middleware({
        type: 'uuid4',
        features: [
            Comparable, Mockable
        ],
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                let matchResult = stringValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return uuidV4();
        },
        toJsonString: function () {
            return 'uuid4()';
        }
    });
    return fn;
}

const regex = function (pattern) {
    let fn = new Middleware({
        type: 'regex',
        features: [
            Comparable, Mockable
        ],
        options: {
            pattern: pattern
        },
        compareFunc: function (value) {
            if (value) {
                let stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                //let stringValue = JSON.stringify(value);
                let matchResult = stringValue.match(this.options.pattern);
                return matchResult && matchResult[0].length === stringValue.length;
            }
            return false;
        },
        mock: function () {
            return new RandExp(new RegExp(this.options.pattern)).gen();
        },
        toJsonString: function () {
            return 'regex(' + JSON.stringify(pattern) + ')';
        }
    });
    return fn;
}

const sum = function (...objects) {
    let sum = new Middleware({
        type: 'sum',
        features: [
            Evaluator
        ],
        options: {
            objects: objects
        },
        evaluate: function (context) {
            let result;
            let objs = this.options.objects || [];
            objs.map((obj) => {
                let retVal = recurrsiveEvaluate(obj).evaluate(context);
                if (typeof retVal === 'string') {
                    retVal = parseFloat(retVal);
                }
                return retVal;
            }).forEach((obj) => {
                if (result === undefined) {
                    result = obj;
                } else {
                    result = result + obj;
                }
            });

            return result;
        },
        toJsonString: function () {
            return 'sum(' + this.options.objects.map(obj=>recurrsiveToString(obj)).join(', ') + ')';
        }
    });
    return sum;
};

const subtract = function (obj1, obj2) {
    let subtract = new Middleware({
        type: 'subtract',
        features: [
            Evaluator
        ],
        options: {
            obj1,
            obj2
        },
        evaluate: function (context) {
            let result;
            let obj1 = recurrsiveEvaluate(this.options.obj1).evaluate(context);
            obj1 = typeof obj1 === 'string' ? parseFloat(obj1) : obj1;
            let obj2 = recurrsiveEvaluate(this.options.obj2).evaluate(context);
            obj2 = typeof obj2 === 'string' ? parseFloat(obj2) : obj2;

            return obj1 - obj2;
        },
        toJsonString: function () {
            return `subtract(${recurrsiveToString(this.options.obj1)}, ${recurrsiveToString(this.options.obj2)})`;
        }
    });
    return subtract;
};

const multiply = function (...objects) {
    let multiply = new Middleware({
        type: 'multiply',
        features: [
            Evaluator
        ],
        options: {
            objects: objects
        },
        evaluate: function (context) {
            let result;
            let objs = this.options.objects || [];
            objs.map((obj) => {
                let retVal = recurrsiveEvaluate(obj).evaluate(context);
                if (typeof retVal === 'string') {
                    retVal = parseFloat(retVal);
                }
                return retVal;
            }).forEach((obj) => {
                if (result === undefined) {
                    result = obj;
                } else {
                    result = result * obj;
                }
            });

            return result;
        },
        toJsonString: function () {
            return 'multiply(' + this.options.objects.map(obj=>recurrsiveToString(obj)).join(', ') + ')';
        }
    });
    return multiply;
};

const divide = function (obj1, obj2) {
    let divide = new Middleware({
        type: 'divide',
        features: [
            Evaluator
        ],
        options: {
            obj1,
            obj2
        },
        evaluate: function (context) {
            let result;
            let obj1 = recurrsiveEvaluate(this.options.obj1).evaluate(context);
            obj1 = typeof obj1 === 'string' ? parseFloat(obj1) : obj1;
            let obj2 = recurrsiveEvaluate(this.options.obj2).evaluate(context);
            obj2 = typeof obj2 === 'string' ? parseFloat(obj2) : obj2;

            return obj1 / obj2;
        },
        toJsonString: function () {
            return `divide(${recurrsiveToString(this.options.obj1)}, ${recurrsiveToString(this.options.obj2)})`;
        }
    });
    return divide;
};

const recurrsiveEvaluate = function (object) {
    let middleware = new Middleware({
        type: 'recurrsiveEvaluate',
        features: [
            Evaluator
        ],
        options: {
            object: object
        },
        evaluate: function (context) {
            let returnObj;

            let currObject = this.options.object;
            if (typeof currObject === 'object') {
                if (Array.isArray(currObject)) {
                    returnObj = [];
                } else {
                    returnObj = {};
                }

                if (Middleware.isMiddleware(currObject)) {
                    if (currObject.hasFeature(Evaluator)) {
                        returnObj = currObject.execute({
                            features: [Evaluator],
                            evaluate: [context]
                        });
                    } else {
                        returnObj = currObject;
                    }
                } else {
                    for (let key in currObject) {
                        let property = currObject[key]
                        returnObj[key] = recurrsiveEvaluate(property).evaluate(context);
                    }
                }

            } else {
                returnObj = currObject;
            }
            return returnObj;
        },
        toJsonString: function () {
            return 'recurrsiveEvaluate(' + recurrsiveToString(object) + ')';
        }
    });
    return middleware;
}

const recurrsiveMock = function (object) {
    let mock = new Middleware({
        type: 'recurrsiveMock',
        features: [
            Mockable
        ],
        options: {
            object: object
        },
        mock: function () {
            let returnObj;

            let currObject = this.options.object;
            if (typeof currObject === 'object') {
                if (Array.isArray(currObject)) {
                    returnObj = [];
                } else {
                    returnObj = {};
                }

                if (Middleware.isMiddleware(currObject)) {
                    if (currObject.hasFeature(Mockable)) {
                        returnObj = currObject.mock();
                    } else {
                        returnObj = currObject;
                    }
                } else {
                    for (let key in currObject) {
                        let property = currObject[key]
                        returnObj[key] = recurrsiveMock(property).mock();
                    }
                }
            } else {
                returnObj = currObject;
            }
            return returnObj;
        },
        toJsonString: function () {
            return 'recurrsiveMock(' + recurrsiveToString(object) + ')';
        }
    });
    return mock;
}

const recurrsiveCompare = function (object) {
    let compare = new Middleware({
        type: 'recurrsiveCompare',
        features: [
            Comparable
        ],
        options: {
            object: object
        },
        compareFunc: function (target) {
            if (target) {
                let match = true;
                let currentObj = this.options.object;
                if (typeof currentObj === 'object') {
                    if (Middleware.isMiddleware(currentObj)) {
                        currentObj = currentObj.execute({
                            features: [Evaluator]
                        });
                    }
                    if (Middleware.isMiddleware(currentObj) && currentObj.hasFeature(Comparable)) {
                        return currentObj = currentObj.compareFunc(target);
                    }

                    for (let key in currentObj) {
                        if (Middleware.isMiddleware(currentObj[key]) && currentObj[key].hasFeature(Comparable)) {
                            match = match && currentObj[key].compareFunc(target[key]);
                        } else {
                            match = match && recurrsiveCompare(currentObj[key]).compareFunc(target[key]);
                        }
                        if (!match) {
                            break;
                        }
                    }
                    return match;
                } else {
                    return JSON.stringify(this.options.object) === JSON.stringify(target);
                }
            }
            return target === this.options.object;
        },
        toJsonString: function () {
            return 'recurrsiveCompare(' + recurrsiveToString(object) + ')';
        }
    });
    return compare;
}

const evalContext = function (evalFn) {
    let fn = new Middleware({
        type: 'evalContext',
        features: [
            Evaluator
        ],
        options: {
            evalFn: evalFn
        },
        evaluate: function (context) {
            return evalFn(context);
        },
        toJsonString: function () {
            return `evalContext(${JSON.stringify(this.options.evalFn)})`;
        }
    });
    return fn;
}

const jsonpath = function (pathExpression) {
    let fn = new Middleware({
        type: 'jsonpath',
        features: [
            Evaluator
        ],
        options: {
            pathExpression: pathExpression
        },
        evaluate: function (context) {
            return jp.value(context, this.options.pathExpression);
        },
        toJsonString: function () {
            return `jsonpath(${JSON.stringify(this.options.pathExpression)})`;
        }
    });
    return fn;
}


const anyOf = function (...choices) {
    let fn = new Middleware({
        type: 'anyOf',
        features: [
            Comparable, Mockable
        ],
        options: {
            choices: choices
        },
        compareFunc: function (value) {
            let jsonValue = JSON.stringify(value);
            for (let choice of this.options.choices) {
                let choiceJsonValue = JSON.stringify(choice);
                if (jsonValue === choiceJsonValue) {
                    return true;
                }
            }
            return false;
        },
        mock: function () {
            return this.options.choices[Math.floor(Math.random() * this.options.choices.length)];
        },
        toJsonString: function () {
            return `anyOf(${this.options.choices.map(c=>JSON.stringify(c)).join(', ')})`;
        }
    });
    return fn;
}

const notAnyOf = function (...choices) {
    let fn = new Middleware({
        type: 'notAnyOf',
        features: [
            Comparable
        ],
        options: {
            choices: choices
        },
        compareFunc: function (value) {
            let jsonValue = JSON.stringify(value);
            for (let choice of this.options.choices) {
                let choiceJsonValue = JSON.stringify(choice);
                if (jsonValue === choiceJsonValue) {
                    return false;
                }
            }
            return true;
        },
        toJsonString: function () {
            return `notAnyOf(${this.options.choices.map(c=>JSON.stringify(c)).join(', ')})`;
        }
    });
    return fn;
}

const value = function (props) {
    let stubValue = props.stub || props.client || props.consumer;
    let testValue = props.test || props.server || props.producer;
    let evaluateFunction = props.evaluateFunction || function (context) {
        if (context.isTest) {
            return this.options.testValue;
        } else {
            return this.options.stubValue;
        }
    };

    let consumerProducerValue = new Middleware({
        type: 'ConsumerProducerValue',
        features: [Evaluator],
        options: {
            stubValue: stubValue,
            testValue: testValue
        },
        evaluate: evaluateFunction,
        evaluateStubValue: function () {
            return this.options.stubValue;
        },
        evaluateTestValue: function () {
            return this.options.testValue;
        },
        toJsonString: function () {
            return `value({stub: ${recurrsiveToString(this.options.stubValue)}, test: ${recurrsiveToString(this.options.testValue)} })`;
        }
    });
    return consumerProducerValue;
}

const stubValue = function (props) {
    let stubValue = props.stub || props.client || props.consumer;
    let testValue = props.test || props.server || props.producer;
    let evaluateFunction = props.evaluateFunction || function () {
        return this.options.stubValue;
    };

    let consumerProducerValue = new Middleware({
        type: 'stubValue',
        features: [Evaluator],
        options: {
            stubValue: stubValue,
            testValue: testValue
        },
        evaluate: evaluateFunction,
        toJsonString: function () {
            return `${recurrsiveToString(this.options.stubValue)}`;
        }
    });
    return consumerProducerValue;
}

const testValue = function (props) {
    let stubValue = props.stub || props.client || props.consumer;
    let testValue = props.test || props.server || props.producer;
    let evaluateFunction = props.evaluateFunction || function () {
        return this.options.testValue;
    };

    let consumerProducerValue = new Middleware({
        type: 'testValue',
        features: [Evaluator],
        options: {
            stubValue: stubValue,
            testValue: testValue
        },
        evaluate: evaluateFunction,
        toJsonString: function () {
            return `${recurrsiveToString(this.options.testValue)}`;
        }
    });
    return consumerProducerValue;
}

module.exports.functions = {
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
    reqContextTransform,
    anyOf,
    notAnyOf
};