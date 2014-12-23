'use strict';

var Promise = require('bluebird'); //jshint ignore:line
var BluebirdCachify = require('../index')('test');
var should = require('should');

describe('index', function () {

  // sample object
  function FakeObject() {
    this.value = 10;
    this.calls = 0;
  }

  FakeObject.prototype.foo = function (foo) {
    this.calls++;
    return Promise.delay(200).return(foo * this.value);
  };

  // a non-promise function
  FakeObject.prototype.bar = function () {
    return {a: 1};
  };

  var fo;

  beforeEach(function () {
    fo = new FakeObject();

    (fo.foo.__cachify__ || false).should.be.false;
  });

  afterEach(function () {
    try {
      fo.foo.restore();
    } catch (e) {}

  });


  it("should execute both calls with the same parameters with no caching", function (done) {
    fo.foo(10)
      .then(function (result) {
        result.should.eql(100);
        return fo.foo(10);
      })
      .then(function (result) {
        result.should.eql(100);
        fo.calls.should.eql(2);
        done();
      })
      .catch(done);
  });

  it("should return the cached value on the second call with the same parameter", function (done) {

    BluebirdCachify.cachify(fo, 'foo', 5000);

    fo.foo(10)
      .then(function (result) {
        result.should.eql(100);
        return fo.foo(10);
      })
      .then(function (result) {
        result.should.eql(100);
        fo.calls.should.eql(1);
        done();
      })
      .catch(done);
  });

  it("should execute the second call with a different parameter", function (done) {

    BluebirdCachify.cachify(fo, 'foo', 5000);

    fo.foo(10)
      .then(function (result) {
        result.should.eql(100);
        fo.calls.should.eql(1);
        return fo.foo(20);
      })
      .then(function (result) {
        result.should.eql(200);
        fo.calls.should.eql(2);
        done();
      })
      .catch(done);
  });

  it("should re-execute the identical call if the ttl has expired", function (done) {
    BluebirdCachify.cachify(fo, 'foo', 100);

    fo.foo(10)
      .then(function (result) {
        result.should.eql(100);
        return Promise.delay(150);
      })
      .then(function () {
        return fo.foo(10);
      })
      .then(function (result) {
        result.should.eql(100);
        fo.calls.should.eql(2);
        done();
      })
      .catch(done);
  });

  it("should restore a 'cachified' function back to 'normal'", function () {
    var originalString = fo.foo.toString();

    (fo.foo.__cachify__ || false).should.be.false;

    BluebirdCachify.cachify(fo, 'foo', 250);

    fo.foo.__cachify__.should.be.true;

    //var cachifiedString = fo.foo.toString();

    fo.foo.restore();
    fo.foo.__cachify__.should.be.false;

    fo.foo.toString().should.eql(originalString);

  });

  it("should use the default ttl", function (done) {

    BluebirdCachify.cachify(fo, 'foo');

    fo.foo(10)
      .then(function (result) {
        result.should.eql(100);
        return fo.foo(10);
      })
      .then(function (result) {
        result.should.eql(100);
        fo.calls.should.eql(1);
        done();
      })
      .catch(done);
  });

  it("should fail if the function name doesn't exist", function () {

    (function(){
      BluebirdCachify.cachify(fo, 'bad');
    }).should.throw(/Function bad does not exist/);

  });

  it("should fail if the function does not return a promise", function () {
    BluebirdCachify.cachify(fo, 'bar');

    (function(){
      fo.bar();
    }).should.throw();

  });

  it("should create a new BlueBirdCachify with a namespace", function () {
    var Temp1 = require('../index')('ns1');
    Temp1.namespace.should.eql('ns1');
  });

  it("should create a new BlueBirdCachify with a namespace and custom cache overrides", function () {
    var Temp1 = require('../index')('ns2', {maxAge: 123});
    Temp1.namespace.should.eql('ns2');
    Temp1.cache._maxAge.should.eql(123);
  });

  it("should create a new BlueBirdCachify with only custom cache overrides", function () {
    var Temp1 = require('../index')({maxAge: 456});
    Temp1.namespace.should.eql('_default');
    Temp1.cache._maxAge.should.eql(456);
  });




});