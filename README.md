# rest-in-contract-dsl
Contract script DSL for rest-in-contract

[![npm version](https://img.shields.io/npm/v/rest-in-contract-dsl.svg)](https://www.npmjs.com/package/rest-in-contract-dsl)
[![node](https://img.shields.io/node/v/rest-in-contract-dsl.svg)](https://www.npmjs.com/package/rest-in-contract-dsl)
[![Codecov branch](https://img.shields.io/codecov/c/github/airicyu/rest-in-contract-dsl/master.svg)](https://codecov.io/gh/airicyu/rest-in-contract-dsl)
[![Build](https://travis-ci.org/airicyu/rest-in-contract-dsl.svg?branch=master)](https://travis-ci.org/airicyu/rest-in-contract-dsl)

[![GitHub issues](https://img.shields.io/github/issues/airicyu/rest-in-contract-dsl.svg)](https://github.com/airicyu/rest-in-contract-dsl/issues)
[![GitHub forks](https://img.shields.io/github/forks/airicyu/rest-in-contract-dsl.svg)](https://github.com/airicyu/rest-in-contract-dsl/network)
[![GitHub stars](https://img.shields.io/github/stars/airicyu/rest-in-contract-dsl.svg)](https://github.com/airicyu/rest-in-contract-dsl/stargazers)
[![GitHub License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/airicyu/rest-in-contract-dsl/master/LICENSE)
[![dependencies Status](https://david-dm.org/airicyu/rest-in-contract-dsl/status.svg)](https://david-dm.org/airicyu/rest-in-contract-dsl)
[![devDependencies Status](https://david-dm.org/airicyu/rest-in-contract-dsl/dev-status.svg)](https://david-dm.org/airicyu/rest-in-contract-dsl?type=dev)

## Base Types

#### Middlewares

The base abstract type of all dsl functions.

#### Feature

The base abstract type of all features implemented by a dsl function.

### Evaluator

A dsl function feature which allow evaluating a value from the context.

### Comparable

A dsl function feature which allow comparing or validating with a target value.

#### Mockable

A dsl function feature which allow mocking value.


## DSL functions

### float

Representing a float number value.

#### Implementing features

Comparable, Mockable

#### Options

| Option key | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| lt | It defines the "less than" criterion. This criterion is used for comparing values and mocking values. | optional | 0.1 |
| lte | It defines the "less than equal" criterion. This criterion is used for comparing values and mocking values. | optional | 0.1 |
| gt | It defines the "greater than" criterion. This criterion is used for comparing values and mocking values. | optional | 0.9 |
| gte | It defines the "greater than equal" criterion. This criterion is used for comparing values and mocking values. | optional | 0.9 |

#### Sample

```javascript
var fnInstance = float({ gt: 0.5, lt: 0.6 });

fnInstance.compareFunc("abc");//false;
fnInstance.compareFunc(0.4);//false;
fnInstance.compareFunc(0.5);//false
fnInstance.compareFunc(0.55);//true
fnInstance.compareFunc(0.6);//false
fnInstance.compareFunc(0.7);//false

fnInstance.mock();//0.5800135823905961
```

### integer

Representing an integer number value.

#### Implementing features

Comparable, Mockable

#### Options

| Option key | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| lt | It defines the "less than" criterion. This criterion is used for comparing values and mocking values. | optional | 1 |
| lte | It defines the "less than equal" criterion. This criterion is used for comparing values and mocking values. | optional | 1 |
| gt | It defines the "greater than" criterion. This criterion is used for comparing values and mocking values. | optional | 10 |
| gte | It defines the "greater than equal" criterion. This criterion is used for comparing values and mocking values. | optional | 10 |

#### Sample

```javascript
var fnInstance = integer({ gt: 1, lt: 5 });

fnInstance.compareFunc("abc");//false;
fnInstance.compareFunc(0);//false;
fnInstance.compareFunc(1);//false
fnInstance.compareFunc(3);//true
fnInstance.compareFunc(5);//false
fnInstance.compareFunc(7);//false

fnInstance.mock();//2
fnInstance.mock();//3
fnInstance.mock();//3
fnInstance.mock();//4

var fnInstance = integer({ gte: 1, lte: 5 });

fnInstance.compareFunc("abc");//false;
fnInstance.compareFunc(0);//false;
fnInstance.compareFunc(1);//true
fnInstance.compareFunc(3);//true
fnInstance.compareFunc(5);//true
fnInstance.compareFunc(7);//false

fnInstance.mock();//5
fnInstance.mock();//2
fnInstance.mock();//4
fnInstance.mock();//4
fnInstance.mock();//1
```

### date

Representing a date value. 

#### Implementing features

Comparable, Mockable

#### Options

| Option key | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| format | It defines the date format which is used for comparing values and mocking values  | optional | 'YYYY-MM-DD HH:mm:ss' |
| type | It may either be "past", "future" or "betwen". Like the worings said, it defines how it would behave for comparing values and mocking values. "past" would only allow date in the past. "future" would only allow date in the future. "between" allow date value between a range. | optional | "past", "future" or "betwen" |
| from | It defines the "from" criterion, which is the minimum aceptable value. This criterion is used for comparing values and mocking values. | optional | 10 |
| to | It defines the "to" criterion, which is the maximum aceptable value. This criterion is used for comparing values and mocking values. | optional | 10 |

#### Sample

```javascript
var fnInstance = date({
    format: 'YYYY-MM-DD HH:mm:ss',
    type: 'between',
    from: '1999-01-02 01:01:01',
    to: '2001-12-31 01:01:01'
});

fnInstance.compareFunc('1999-01-01');//false;
fnInstance.compareFunc('1999-01-02');//false;
fnInstance.compareFunc('1999-01-03');//true;
fnInstance.compareFunc('2000-01-01');//true;
fnInstance.compareFunc('2001-12-31');//true;
fnInstance.compareFunc('2002-01-01');//false;

mockValue = fnInstance.mock();//2000-06-30 21:25:25
mockValue = fnInstance.mock();//2001-07-19 14:21:38
mockValue = fnInstance.mock();//2001-08-10 18:43:24
mockValue = fnInstance.mock();//1999-10-06 12:05:08
mockValue = fnInstance.mock();//2000-10-31 03:32:38
```

### regex

Representing a string pattern value.

#### Implementing features

Comparable, Mockable

#### Function arguments

regex(pattern)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| pattern | The string representation of Regex pattern | mandatory | "[0-9]{4},[a-z]{6},[A-Z]{3}" |

#### Sample

```javascript
var fnInstance = regex("[0-9]{4},[a-z]{6},[A-Z]{3}");
fnInstance.compareFunc('0123,abcxyz,ABC'));//true
fnInstance.compareFunc('apple'));//false

fnInstance.mock();//9345,wpaump,JEU
fnInstance.mock();//4576,fcwlfz,NAP
fnInstance.mock();//3047,drfitz,OQC
fnInstance.mock();//5510,vpymny,SEC
fnInstance.mock();//1154,mgppdb,KYW
```

### text

Representing a text value.

#### Implementing features

Comparable, Mockable

#### Options

| Option key | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| type | It defines the type of text criterion. It may be either "word", "words", "sentence" or "paragraphs". | optional | either "word", "words", "sentence" or "paragraphs" |

#### Sample

```javascript
var fnInstance = text({ type: "word" });
fnInstance.compareFunc("apple");//true;
fnInstance.mock();//"facilis"

fnInstance = text({ type: "words" });
fnInstance.compareFunc("apple tree");//true;
fnInstance.mock();//"voluptatum porro soluta"

fnInstance = text({ type: "sentence" });
fnInstance.compareFunc("Apple tree is great.");//true;
fnInstance.mock();//"Dolorem ut eum hic."

fnInstance = text({ type: "paragraphs" });
fnInstance.compareFunc("Apple tree is great. Lemon tree is great too.");//true;
fnInstance.compareFunc(123);//false;
fnInstance.mock();//"Omnis ipsam quis. Sed quo molestias. ......"
```

### name

Representing a name value.

#### Implementing features

Comparable, Mockable

#### Sample

```javascript
var fnInstance = name();
fnInstance.compareFunc("Mary Chan");//true;
fnInstance.mock();//"Jacinto Jones"
```

### email

Representing an email value.

#### Implementing features

Comparable, Mockable

#### Sample

```javascript
var fnInstance = name();
fnInstance.compareFunc("chan.mary123@test.com");//true;
fnInstance.mock();//"Hettie56@yahoo.com"
```

### phone

Representing a phone value.

#### Implementing features

Comparable, Mockable

#### Sample

```javascript
var fnInstance = phone();
fnInstance.compareFunc('23456789'));//true
fnInstance.compareFunc('(852)23456789'));//true
fnInstance.compareFunc('(852) 23456789'));//true
fnInstance.compareFunc('852-23456789'));//true
fnInstance.compareFunc('852-23456789x1234'));//true
fnInstance.compareFunc('852-23456789X1234'));//true
fnInstance.compareFunc('a23456789'));//false
fnInstance.compareFunc('123,456,789'));//false
fnInstance.compareFunc(23456789));//true

fnInstance.mock();//1-018-789-4795 x9374
fnInstance.mock();//(953) 814-4850
fnInstance.mock();//(788) 031-9558
fnInstance.mock();//(567) 476-8360 x436
fnInstance.mock();//1-430-650-6285 x861
```

### address

Representing an address value.

#### Implementing features

Comparable, Mockable

#### Sample

```javascript
var fnInstance = address();
fnInstance.compareFunc('Block 10, Baker Rd., UK'));//true
fnInstance.compareFunc('Block 10, \nBaker Rd., UK'));//true

fnInstance.mock();//"881 Hagenes Cape"
fnInstance.mock();//"74087 Nayeli Trace"
fnInstance.mock();//"087 Heller Divide"
fnInstance.mock();//"495 Parisian Lock"
fnInstance.mock();//"2458 Jeromy Village"
```

### uuid4

Representing an uuid4 value.

#### Implementing features

Comparable, Mockable

#### Sample

```javascript
var fnInstance = uuid4();
fnInstance.compareFunc('a341a6a8-b4de-4880-8942-d67c3c4f30fc'));//true
fnInstance.compareFunc('3caea76e-7060-471f-a0d8-11b7e272956b'));//true

fnInstance.mock();//"04072af7-b00b-4046-b669-42eeb17fa8da"
fnInstance.mock();//"0bd7cfcf-2cd0-48c4-bd4b-6e36e2b3f6cb"
fnInstance.mock();//"b4a8512c-addf-4596-82ea-d0a3e385b016"
```


### jsonpath

Evaluating value from context's json path.

#### Implementing features

Evaluator

#### Function arguments

jsonpath(expression)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| expression | The jsonpath expression | mandatory | "$.req.body" |

#### Sample

```javascript
var fnInstance = jsonpath("$.req.body");

fnInstance.evaluate({
    req: {
        body: 100
    }
});
//100

fnInstance.evaluate({
    req: {
        body: "abc"
    }
});
//"abc"
```

### sum

Evaluating sum of values

#### Implementing features

Evaluator

#### Function arguments

sum(values...)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| values... | The function arguments are the input values for evaluating the sum | mandatory | 1,2,3,4,... |

#### Sample

```javascript
var fnInstance = sum(6, 200, 50, 1000);
fnInstance.evaluate({});//1256

var fnInstance = sum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
fnInstance.evaluate({});//55

var fnInstance = sum(jsonpath("$.req.body"), 1);
fnInstance.evaluate({
    req: {
        body: 100
    }
});
//101
```

### subtract

Evaluating subtract result of two values

#### Implementing features

Evaluator

#### Function arguments

subtract(a, b)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| a | The number which would be subtracted by b | mandatory | 10 |
| b | The number which would be subtracted from a | mandatory | 3 |

#### Sample

```javascript
var fnInstance = subtract(10, 3);
fnInstance.evaluate({});//7

var fnInstance = subtract(jsonpath("$.req.body"), 1);
fnInstance.evaluate({
    req: {
        body: 100
    }
});
//99
```

### multiply

Evaluating multiply result of values

#### Implementing features

Evaluator

#### Function arguments

multiply(values...)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| values... | The function arguments are the input values for evaluating the multiply result | mandatory | 1,2,3,4,... |

#### Sample

```javascript
var fnInstance = multiply(2, 4, 10);
fnInstance.evaluate({});//80

var fnInstance = multiply(1, 2, 3, 4, 5);
fnInstance.evaluate({});//120

var fnInstance = multiply(jsonpath("$.req.body"), 2);
fnInstance.evaluate({
    req: {
        body: 100
    }
});
//200
```

### divide

Evaluating divide result of two values

#### Implementing features

Evaluator

#### Function arguments

divide(a, b)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| a | The number which would be divided by b | mandatory | 12 |
| b | The number which would be divided from a | mandatory | 3 |

#### Sample

```javascript
var fnInstance = subtract(12, 3);
fnInstance.evaluate({});//4

var fnInstance = subtract(jsonpath("$.req.body"), 25);
fnInstance.evaluate({
    req: {
        body: 100
    }
});
//4
```

### anyOf

Allow comparing value or mocking value which is any of the listed values.

#### Implementing features

Comparable, Mockable

#### Function arguments

anyOf(values...)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| values... | The function arguments are the possible values. | mandatory | 'a', 'b', 'c', ... |

#### Sample

```javascript
var fnInstance = anyOf('a', 'b', 'c');
fnInstance.compareFunc('a');//true
fnInstance.compareFunc('b');//true
fnInstance.compareFunc('c');//true
fnInstance.compareFunc('d');//false

fnInstance.mock();//"a"
fnInstance.mock();//"c"
fnInstance.mock();//"c"
fnInstance.mock();//"b"
```

### notAnyOf

Allow comparing value which is not any of the listed values.

#### Implementing features

Comparable

#### Function arguments

notAnyOf(values...)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| values... | The function arguments are the values that shouldn't be | mandatory | 'a', 'b', 'c', ... |

#### Sample

```javascript
var fnInstance = notAnyOf('a', 'b', 'c');
fnInstance.compareFunc('a');//false
fnInstance.compareFunc('b');//false
fnInstance.compareFunc('c');//false
fnInstance.compareFunc('d');//true
```

### evalContext

Evaluating value from the context

#### Implementing features

Evaluator

#### Function arguments

evalContext(evalFunction)

| Argument | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| evalFunction | The function for evaluating context | mandatory | function(context){...} |

#### Sample

```javascript
var fnInstance = evalContext(function (context) {
    return context.req.body.a + context.req.body.b;
});

fnInstance.evaluate({
    req: {
        body: {
            a: 1,
            b: 2
        }
    }
});//3

var fnInstance = evalContext(function (context) {
    return "Hello " + context.req.body.name;
});

fnInstance.evaluate({
    req: {
        body: {
            name: "Mary"
        }
    }
});//"Hello Mary"
```


### value

Evaluating "Stub" value or "Test" value.
During evaluating value, it will look up the context's "isTest" value. If "isTest" is true, then it will evaluating test value, otherwise stub value.

#### Implementing features

Evaluator

#### Options

| Option key | Description | Required | Example |
| ---------- | ----------- | -------- | ------- |
| stub | The value being evaluated when evaluating stub value | mandatory | any |
| test | The value being evaluated when evaluating test value | mandatory | any |

#### Sample

```javascript
var fnInstance = value({ stub: 'a', test: 'b'});

fnInstance.evaluate({});//"a"
fnInstance.evaluate({});//"b"

var fnInstance = value({ stub: jsonpath("$.req.body"), test: "123"});

fnInstance.evaluate({
    req: {
        body: "abc"
    }
});//"abc"

fnInstance.evaluate({
    req: {
        body: "abc"
    },
    isTest: true
});//"123"
```