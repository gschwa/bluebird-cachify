Bluebird Cachify
=====================

A non-invasive way to cache your [Bluebird](https://www.npmjs.com/package/bluebird) promises. It leverages [lru-cache-plus](https://www.npmjs.com/package/lru-cache-plus) to cache the results.

## Quick Start

```javascript
  var Promise = require('bluebird');
  var BluebirdCachify = require('bluebird-cachify)();
  
  
  // assume you have an instance sample with a function named foo that returns a promise 
  BluebirdCachify.cachify(sample, 'foo', 5000); // cache for 5 seconds
  
  sample.foo(10) 
    .then(function (result) {
      return sample.foo(10); // returns cached result
    })
```

## tl; dr

### Multiple Caches and Configuration
By default, `BluebirdCachify` uses a single cache instance to store results. It may be desirable to have multiple caches with different parameters and default TTLs. This can easily be done. Examples:

```javascript
// using a different namespace
var BluebirdCachify = require('bluebird-cachify)('different namespace');

// setting default options
var BluebirdCachify = require('bluebird-cachify)({max: 1000, maxAge: 8000});

// creating a new namespace with custom options
var BluebirdCachify = require('bluebird-cachify)('namespace2', {max: 1000, maxAge: 8000});
``` 

*See:* [lru-cache-plus](https://www.npmjs.com/package/lru-cache-plus) for possible options and documentation

## API

`require('bluebird-cachify')([String namespace] [, Object options]) --> BluebirdCachify`

Creates or returns a `BluebirdCachify` object for the given `namespace`. Without the optional `namespace` the *default* is returned. Optionally, an `options` object can be provided to customize the cache. The default options are: `{max: 500, maxAge: 3600000}` (see: [lru-cache-plus](https://www.npmjs.com/package/lru-cache-plus))

`BluebirdCachify.cachify(Object instance, String functionName [, Number ttl])`

Caches the given `functionName` for the given `instance`. Optionally, pass `ttl` in milliseconds.
