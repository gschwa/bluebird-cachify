'use strict';

var Promise = require('bluebird'); //jshint ignore:line
var jsonHash = require('json-hash');
var util = require('util');
var debug = require('debug')('cachify');
var LRU = require('lru-cache-plus');
var _ = require('lodash');

var DEFAULT_MAX_AGE = 1000 * 60 * 60; // 1 hour
var CACHE_FLAG = '__cachify__';
var PRE_CACHED_FUNCTION_PREFIX = '__precached-';

var instances = {};


module.exports = factory;

function factory(namespace /* optional */, options /* optional */) {

  if (typeof(namespace) === 'object') {
    options = namespace;
    namespace = null;
  }

  namespace = namespace || '_default';

  var instance = instances[namespace];

  if (!instance) {
    instance = instances[namespace] = new BluebirdCachify(namespace, options);
  }

  return instance;
}


function BluebirdCachify(namespace /* optional */, options /* optional */) {
  this.namespace = namespace;
  this.cache = LRU(_.defaults(options || {}, {max: 500, maxAge: DEFAULT_MAX_AGE}));
}


BluebirdCachify.prototype.cachify = function (receiver, functionName, ttl) {

  ttl = ttl || DEFAULT_MAX_AGE;

  // make sure the function exists
  if (typeof(receiver[functionName]) !== 'function') {
    throw new Error(util.format("Function %s does not exist", functionName));
  }

  if (!receiver[functionName][CACHE_FLAG]) {
    // save the original method
    receiver[PRE_CACHED_FUNCTION_PREFIX + functionName] = receiver[functionName];
  }

  var uniq = new Date().getTime().toString();

  var cache = this.cache;

  receiver[functionName] = function () {

    var args = Array.prototype.slice.call(arguments);
    var cacheKey = util.format('%s::%s::%s', functionName, uniq, jsonHash.digest(args));

    var cachedValue = cache.get(cacheKey);

    if (cachedValue) {
      debug("CACHE HIT: %s (ttl: %d)", cacheKey, ttl);
      return Promise.resolve(cachedValue);
    }

    debug("CACHE MISS:", cacheKey);
    return receiver[PRE_CACHED_FUNCTION_PREFIX + functionName].apply(receiver, args)
      .tap(function (result) {
        cache.set(cacheKey, result, ttl);
      });
  };

  receiver[functionName][CACHE_FLAG] = true;

  receiver[functionName].restore = function () {
    receiver[functionName] = receiver[PRE_CACHED_FUNCTION_PREFIX + functionName];
    receiver[functionName][CACHE_FLAG] = false;
  };
};




