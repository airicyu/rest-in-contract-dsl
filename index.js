'use strict';

const contractDSL = require('./src/dsl');

/* freeze the dsl function objects to prevent runtime altering */
function deepFreeze(obj) {
  var propNames = Object.getOwnPropertyNames(obj);

  propNames.forEach(function(name) {
    var prop = obj[name];
    if (typeof prop == 'object' && prop !== null)
      deepFreeze(prop);
  });

  return Object.freeze(obj);
}

deepFreeze(contractDSL);

module.exports = contractDSL;
