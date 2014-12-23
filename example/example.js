'use strict';

var Promise = require('bluebird');
var BluebirdCachify = require('../index')();
var FakeObject = require('./fake-object');

var fo = new FakeObject();

BluebirdCachify.cachify(fo, 'foo', 5000); // cache calls for 5 seconds

var startTime = new Date().getTime();

fo.foo(5) // initial call to foo with parameter 5 (not cached)
  .then(function (result) {
    console.log("with parameter 5 took %d ms to get result: %d", new Date().getTime() - startTime, result);
    startTime = new Date().getTime();
    return fo.foo(10); // second call with a different parameter (not cached)
  })
  .then(function (result) {
    console.log("with parameter 10 took %d ms to get result: %d", new Date().getTime() - startTime, result);

    startTime = new Date().getTime();
    return fo.foo(5); // second call with parameter 5 (returns cached value)
  })
  .then(function (result) {
    console.log("with parameter 5 took %d ms to get result: %d", new Date().getTime() - startTime, result);
  });
