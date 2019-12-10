"use strict";
var isFunction = require("lodash/isFunction");
var isPlainObject = require("lodash/isPlainObject");
var DeserializerUtils = require("./deserializer-utils");

module.exports = function(opts) {
  if (!opts) {
    opts = {};
  }

  this.deserialize = function(jsonapi, callback) {
    function sideData() {
      let resultSideData = {};
      if (isPlainObject(jsonapi.links)) {
        resultSideData.links = jsonapi.links;
      }
      if (isPlainObject(jsonapi.meta)) {
        resultSideData.meta = jsonapi.meta;
      }
      return resultSideData;
    }

    function collection() {
      return Promise.all(
        jsonapi.data.map(function(d) {
          return new DeserializerUtils(jsonapi, d, opts).perform();
        })
      ).then(function(result) {
        if (isFunction(callback)) {
          callback(null, result);
        }
        var additional = sideData();

        return { ...result, ...additional };
      });
    }

    function resource() {
      return new DeserializerUtils(jsonapi, jsonapi.data, opts)
        .perform()
        .then(function(result) {
          if (isFunction(callback)) {
            callback(null, result);
          }

          var additional = sideData();

          return { ...result, ...additional };
        });
    }

    if (Array.isArray(jsonapi.data)) {
      return collection();
    } else {
      return resource();
    }
  };
};
