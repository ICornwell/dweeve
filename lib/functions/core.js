"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _formatNumberWithString = _interopRequireDefault(require("format-number-with-string"));

var _dateFns = require("date-fns/");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function addFunctions(context) {
  context['isOdd'] = isOdd;
  context['concat'] = concat;
  context['abs'] = abs;
  context['avg'] = avg;
  context['ceil'] = ceil;
  context['contains'] = contains;
  context['dateAdd'] = dateAdd;
  context['dateAddDays'] = dateAddDays;
  context['dateAddMonths'] = dateAddMonths;
  context['dateAddYears'] = dateAddYears;
  context['daysBetween'] = daysBetween;
  context['distinctBy'] = distinctBy;
  context['distinctByKeys'] = distinctByKeys;
  context['endsWith'] = endsWith;
  context['filter'] = filter;
  context['filterObject'] = filterObject;
  context['find'] = find;
  context['flatMap'] = flatMap;
  context['flatten'] = flatten;
  context['floor'] = floor;
  context['startsWith'] = startsWith;
  context['map'] = map;
  context['mapObject'] = mapObject;
  context['readUrl'] = readUrl;
  context['__add'] = __add;
  context['__minus'] = __minus;
  context['__indexed'] = __indexed;
  context['__format'] = __format;
}

function isOdd(number) {
  return number % 2 ? true : false;
}

function concat(a, b) {
  return a + b;
}

function abs(num) {
  return Math.abs(num);
}

function avg(list) {
  if (!Array.isArray(list)) return 0;

  try {
    var agg = 0;
    list.forEach(function (m) {
      agg += m;
    });
    return agg / list.length;
  } catch (_unused) {}

  return 0;
}

function ceil(num) {
  return Math.ceil(num);
}

function contains(arr, item) {
  return arr.includes(item);
}

function dateAdd(d1, additive) {
  try {
    var date1 = typeof d1 === 'string' ? Date.parse(d1) : d1;
    var newDate = (0, _dateFns.add)(date1, additive);
    return newDate;
  } catch (err) {
    throw "Could not process dates for daysBetween:" + err.message;
  }
}

function dateAddDays(d1, days) {
  try {
    var date1 = typeof d1 === 'string' ? Date.parse(d1) : d1;
    var newDate = (0, _dateFns.addDays)(date1, days);
    return newDate;
  } catch (err) {
    throw "Could not process dates for daysBetween:" + err.message;
  }
}

function dateAddMonths(d1, months) {
  try {
    var date1 = typeof d1 === 'string' ? Date.parse(d1) : d1;
    var newDate = (0, _dateFns.addMonths)(date1, months);
    return newDate;
  } catch (err) {
    throw "Could not process dates for daysBetween:" + err.message;
  }
}

function dateAddYears(d1, years) {
  try {
    var date1 = typeof d1 === 'string' ? Date.parse(d1) : d1;
    var newDate = (0, _dateFns.addYears)(date1, years);
    return newDate;
  } catch (err) {
    throw "Could not process dates for daysBetween:" + err.message;
  }
}

function daysBetween(d1, d2) {
  try {
    var date1 = typeof d1 === 'string' ? Date.parse(d1) : d1 instanceof Date ? d1.getTime() : d1;
    var date2 = typeof d2 === 'string' ? Date.parse(d2) : d2 instanceof Date ? d2.getTime() : d2;
    var time = date2 - date1;
    return time / (1000 * 60 * 60 * 24);
  } catch (err) {
    throw "Could not process dates for daysBetween:" + err.message;
  }
}

function distinctBy(items, criteria) {
  if (items == null || items == undefined) throw 'Error: trying to distinctBy on a null/undefined object/array';
  var out = [];
  var distinctList = [];
  var ewl = items['__ukey-obj'];

  for (var key in items) {
    if (key !== '__ukey-obj') {
      var k = items;
      var v = items[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);
      var candidate = JSON.stringify(criteria(v, k));

      if (!distinctList.includes(candidate)) {
        distinctList.push(candidate);
        out.push(v);
      }
    }
  }

  return out;
}

function distinctByKeys(items, criteria) {
  if (items == null || items == undefined) throw 'Error: trying to distinctBy on a null/undefined object/array';
  var out = [];
  var distinctList = [];
  var ewl = items['__ukey-obj'];

  for (var key in items) {
    if (key !== '__ukey-obj') {
      var k = key;
      var v = items[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);
      var candidate = JSON.stringify(criteria(v, k));

      if (!distinctList.includes(candidate)) {
        distinctList.push(candidate);
        out.push(criteria(v, k));
      }
    }
  }

  return out;
}

function endsWith(s1, s2) {
  return String(s1).endsWith(s2);
}

function filter(arr, criteria) {
  if (arr == null || arr == undefined) throw 'Error: trying to filter on a null/undefined object/array';
  var out = [];
  var ewl = arr['__ukey-obj'];

  for (var key in arr) {
    if (key !== '__ukey-obj') {
      var k = key;
      var v = arr[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);

      try {
        if (criteria(v, k)) out.push(v);
      } catch (err) {// errors in filter evaluation will be treated as filter fails, rather than errors
      }
    }
  }

  return out;
}

function filterObject(source, criteria) {
  if (source == null || source == undefined) throw 'Error: trying to filterObject on a null/undefined object/array';
  var out = {
    '__ukey-obj': true
  };
  var ewl = source['__ukey-obj'];
  var idx = 0;

  for (var key in source) {
    if (key !== '__ukey-obj') {
      var k = key;
      var v = source[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);
      if (criteria(v, k)) out['__key' + idx++] = _defineProperty({}, k, v);
    }
  }

  return out;
}

function find(arr, matcher) {
  if (arr == null || arr == undefined) throw 'Error: trying to find on a null/undefined object/array';

  if (Array.isArray(arr)) {
    var out = [];
    var ewl = arr['__ukey-obj'];
    var idx = 0;

    for (var key in arr) {
      if (key !== '__ukey-obj') {
        var k = key;
        var v = arr[key];

        if (ewl) {
          k = Object.keys(v)[0];
          v = Object.values(v)[0];
        }

        k = isNaN(parseInt(k)) ? k : parseInt(k);
        if (String(v).match(matcher)) out.push(k);
      }
    }

    return out;
  } else if (matcher.source !== undefined) {
    var str = String(arr);
    var _out2 = [];
    var gmatcher = new RegExp(matcher.source, 'g');
    var ms = String(str).match(gmatcher);
    var lastidx = 0;
    if (ms == null) return _out2;
    ms.forEach(function (m) {
      var idx = str.indexOf(m, lastidx);

      _out2.push([idx, idx + m.length]);

      lastidx = idx + 1;
    });
    return _out2;
  } else {
    var _str = String(arr);

    var _out3 = [];

    var _gmatcher = new RegExp(matcher, 'g');

    var _ms = String(_str).match(_gmatcher);

    var _lastidx = 0;

    _ms.forEach(function (m) {
      var idx = _str.indexOf(m, _lastidx);

      _out3.push(idx);

      _lastidx = idx + 1;
    });

    return _out3;
  }
}

function flatMap(source, mapFunc) {
  return flatten(map(source, mapFunc));
}

function flatten(source) {
  //    if (source==null || source==undefined)
  //        throw 'Error: trying to flatten on a null/undefined object/array'
  if (source == null || !Array.isArray(source)) return source;
  var out = [];
  source.forEach(function (m) {
    if (Array.isArray(m)) m.forEach(function (im) {
      return out.push(im);
    });else out.push(m);
  });
  return out;
}

function floor(num) {
  return Math.floor(num);
}

function startsWith(s1, s2) {
  return String(s1).startsWith(s2);
}

function map(source, mapFunc) {
  if (source == null || source == undefined) throw 'Error: trying to map on a null/undefined object/array';
  var out = [];
  var ewl = source['__ukey-obj'];

  for (var key in source) {
    if (key !== '__ukey-obj') {
      var k = key;
      var v = source[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);
      out.push(mapFunc(v, k));
    }
  }

  return out;
}

function mapObject(source, mapFunc) {
  if (source == null || source == undefined) throw 'Error: trying to mapObject on a null/undefined object/array';
  var out = {
    '__ukey-obj': true
  };
  var ewl = source['__ukey-obj'];
  var idx = 0;

  for (var key in source) {
    if (key !== '__ukey-obj') {
      var k = key;
      var v = source[key];

      if (ewl) {
        k = Object.keys(v)[0];
        v = Object.values(v)[0];
      }

      k = isNaN(parseInt(k)) ? k : parseInt(k);
      var mr = mapFunc(v, k, idx);
      if (mr['__ukey-obj']) idx = reIndexElements(idx, mr, out);else out['__key' + idx++] = mr;
    }
  }

  return out;

  function reIndexElements(idx, mr, out) {
    var oldIdx = 0;

    while (Object.keys(mr).includes('__key' + oldIdx)) {
      out['__key' + idx++] = mr['__key' + oldIdx++];
    }

    return idx;
  }
}

var contentLoader = function contentLoader(path, contentType) {
  return resourceFileContent[path];
};

function setResourceLoader(loader) {
  contentLoader = loader;
}

function setResourceFileContent(name, text) {
  resourceFileContent[name] = text;
}

var resourceFileContent = {};

function readUrl(path, contentType) {
  var content = contentLoader(path, contentType);
  if (contentType === "application/json" || content.trim().startsWith('{') && content.trim().endsWith('}')) return JSON.parse(content);
  return content;
}

function __add(lhs, rhs) {
  if (Array.isArray(lhs) && Array.isArray(rhs)) {
    return lhs.concat(rhs);
  } else if (_typeof(lhs) === "object" && _typeof(rhs) === "object") {
    var newObj = {
      '__ukey-obj': true
    };
    var idx = 0;
    Object.keys(lhs).forEach(function (k) {
      if (k.startsWith('__key')) newObj['__key' + idx++] = lhs[k];else if (k.startsWith('__dkey')) newObj['__dkey' + idx++] = lhs[k];else if (!k.startsWith('__')) newObj['__key' + idx++] = _defineProperty({}, k, lhs[k]);
    });
    Object.keys(rhs).forEach(function (k) {
      if (k.startsWith('__key')) newObj['__key' + idx++] = rhs[k];else if (k.startsWith('__dkey')) newObj['__dkey' + idx++] = rhs[k];else if (!k.startsWith('__')) newObj['__key' + idx++] = _defineProperty({}, k, rhs[k]);
    });
    return newObj;
  } else {
    return lhs + rhs;
  }
}

function __minus(lhs, rhs) {
  if (_typeof(lhs) === 'object' && typeof rhs === 'string') {
    var result = _objectSpread({}, lhs);

    if (!lhs["__ukey-obj"] && result[rhs]) // lhs is just a plain obj
      delete result[rhs];else if (lhs["__ukey-obj"]) {
      // tru to find the key in the wrapped obj
      var wrapperKey = Object.keys(lhs).find(function (k) {
        return Object.keys(lhs[k])[0] === rhs;
      });
      if (wrapperKey) delete result[wrapperKey];
    }
    return result;
  } else return lhs - rhs;
}

function __indexed(obj, indexer) {
  try {
    if (Array.isArray(obj) || obj['__ukey-obj'] == undefined) return obj[indexer];else if (obj['__ukey-obj']) {
      var outval;
      Object.values(obj).forEach(function (v) {
        if (Object.keys(v)[0] === indexer) {
          outval = Object.values(v)[0];
        }
      });
      if (outval != undefined) return outval;
    }
  } catch (err) {}

  return undefined;
}

function __format(text, format) {
  return (0, _formatNumberWithString.default)(text, format);
}

var _default = {
  addFunctions: addFunctions,
  setResourceFileContent: setResourceFileContent,
  setResourceLoader: setResourceLoader
};
exports.default = _default;