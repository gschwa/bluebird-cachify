'use strict';

var Promise = require('bluebird'); //jshint ignore:line

module.exports = FakeObject;

// fake-object
function FakeObject() {
  this.value = 10;
}

FakeObject.prototype.foo = function (foo) {
  return Promise.delay(2000).return(foo * this.value); // force a 2 second delay
};