'use strict';

const recurrsiveToString = function (obj) {
    var { Middleware, Comparable } = require('./base-types').types;
    if (Middleware.isMiddleware(obj)) {
        return obj.toJsonString();
    }

    let out = '';
    if (typeof obj === 'object' && !Array.isArray(obj)) {
        out += '{ ';
        let currObjStr = '';
        for (let key in obj) {
            if (typeof obj[key] === 'function') {
                continue;
            }
            currObjStr += JSON.stringify(key) + ": ";
            currObjStr += recurrsiveToString(obj[key]);
            currObjStr += ', ';
        }
        if (currObjStr.length > 2) {
            currObjStr = currObjStr.substr(0, currObjStr.length - 2);
        }
        out += currObjStr + ' }';
    } else if (typeof obj === 'object' && Array.isArray(obj)) {
        out += '[ ';
        for (let i=0; i<obj.length; i++){
            if (typeof obj[i] === 'function') {
                continue;
            }
            out += recurrsiveToString(obj[i]);
            if (i < obj.length - 1){
                out += ', '
            }
        }
        out += ' ]';
    } else {
        out = JSON.stringify(obj);
    }
    return out;
}

module.exports.recurrsiveToString = recurrsiveToString;