"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = _interopRequireDefault(require("./core"));

var _pluralize = _interopRequireDefault(require("pluralize"));

var _isLeapYear = _interopRequireDefault(require("date-fns/isLeapYear"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var core = {};

_core.default.addFunctions(core);

function addFunctions(context) {
  context['isEven'] = isEven;
  context['lower'] = lower;
  context['upper'] = upper;
  context['isBlank'] = isBlank;
  context['isDate'] = isDate;
  context['isDecimal'] = isDecimal;
  context['isEmpty'] = isEmpty;
  context['isInteger'] = isInteger;
  context['isLeapYear'] = isLeapYear;
  context['log'] = log;
  context['min'] = min;
  context['minBy'] = minBy;
  context['match'] = match;
  context['matches'] = matches;
  context['max'] = max;
  context['maxBy'] = maxBy;
  context['mod'] = mod;
  context['now'] = now;
  context['groupBy'] = groupBy;
  context['orderBy'] = orderBy;
  context['joinBy'] = joinBy;
  context['reduce'] = reduce;
  context['pluralize'] = pluralize;
  context['trim'] = trim;
  context['to'] = to;
  context['sizeOf'] = sizeOf;
  context['keySet'] = keySet;
  context['splitBy'] = splitBy;
}

function isEven(number) {
  return number % 2 ? false : true;
}

function lower(s) {
  return String(s).toLowerCase();
}

function upper(s) {
  return String(s).toUpperCase();
}

function isBlank(s) {
  return String(s).trim === '';
}

function isDate(value) {
  switch (_typeof(value)) {
    case 'number':
      return true;

    case 'string':
      return !isNaN(Date.parse(value));

    case 'object':
      if (value instanceof Date) {
        return !isNaN(value.getTime());
      }

    default:
      return false;
  }
}

function isEmpty(v) {
  if (v == null || v == undefined) return true;
  if (Array.isArray(v) && v.length == 0) return true;
  if (_typeof(v) === 'object' && Object.keys(v).filter(function (k) {
    return k !== '__ukey-obj' && k !== '__hasDynamicContent';
  }).length == 0) return true;
  if (String(v).trim() === '') return true;
  return false;
}

function isDecimal(num) {
  try {
    var v = parseFloat(num);
    return String(v) == num;
  } catch (err) {
    return false;
  }
}

function isInteger(num) {
  try {
    var v = parseInt(num);
    return String(v) == num;
  } catch (err) {
    return false;
  }
}

function isLeapYear(date) {
  return _isLeapYear.default.default(date);
}

function log(message) {
  console.log(message);
}

function min(list) {
  if (!Array.isArray(list)) return 0;

  try {
    var agg;
    list.forEach(function (m) {
      if (agg == undefined || m < agg) agg = m;
    });
    return agg;
  } catch (err) {}

  return 0;
}

function minBy(list, itemFunc) {
  if (!Array.isArray(list)) return 0;

  try {
    var agg;
    var out = null;
    list.forEach(function (m) {
      var v = itemFunc(m);

      if (agg == undefined || v < agg) {
        agg = v;
        out = m;
      }
    });
    return out;
  } catch (err) {}

  return 0;
}

function match(text, matcher) {
  return text.match(matcher);
}

function matches(text, matcher) {
  return text.match(matcher) != null;
}

function max(list) {
  if (!Array.isArray(list)) return 0;

  try {
    var agg;
    list.forEach(function (m) {
      if (agg == undefined || m > agg) agg = m;
    });
    return agg;
  } catch (err) {}

  return 0;
}

function maxBy(list, itemFunc) {
  if (!Array.isArray(list)) return 0;

  try {
    var agg;
    var out = null;
    list.forEach(function (m) {
      var v = itemFunc(m);

      if (agg == undefined || v > agg) {
        agg = v;
        out = m;
      }
    });
    return out;
  } catch (err) {}

  return 0;
}

function mod(dividend, divisor) {
  return dividend % divisor;
}

function now() {
  return Date.now();
}

function joinBy(arr, s) {
  return arr.join(s);
}

function groupBy(list, criteria) {
  if (typeof criteria === 'function') {
    var groups = core.distinctByKeys(list, criteria);
    var outObj = {};
    groups.forEach(function (g) {
      var gItems = [];
      if (Array.isArray(list)) gItems = core.filter(list, function (v, k) {
        return criteria(v, k) === g;
      });else gItems = core.filterObject(list, function (v, k) {
        return criteria(v, k) === g;
      });

      if (Array.isArray(gItems)) {
        var newArr = [];
        gItems.forEach(function (gi) {
          return newArr.push(gi);
        });
        outObj[g] = newArr;
      } else outObj[g] = gItems;
    });
    return outObj;
  } else {
    return _defineProperty({}, criteria, list);
  }
}

function trim(s) {
  return String(s).trim();
}

function to(start, end) {
  var arr = [];

  for (var idx = start; idx <= end; idx++) {
    arr.push(idx);
  }

  return arr;
}

function reduce(arr, reduceFunc, init) {
  var acc = init; // was there an initialiser for the accumaltor ?

  if (reduceFunc.toString().match(/\([\w]+,\s*[\w]+\s*=/) == null) {
    if (acc == undefined && arr.length > 0) {
      if (isDecimal(arr[0])) acc = 0;else acc = '';
    }
  } else acc = undefined;

  arr.forEach(function (m) {
    if (acc == undefined) acc = reduceFunc(m);else acc = reduceFunc(m, acc);
  });
  return acc;
}

function orderBy(arr, orderFunc, isReversed) {
  var compare = function compare(x, y) {
    if (_typeof(x) == 'object' && Object.keys(x)[0].startsWith('__key')) x = Object.values(x)[0];
    if (_typeof(y) == 'object' && Object.keys(y)[0].startsWith('__key')) x = Object.values(y)[0];
    if (orderFunc(x) > orderFunc(y)) return 1;
    if (orderFunc(y) > orderFunc(x)) return -1;
    return 0;
  };

  var ordered = arr.slice().sort(compare);
  if (isReversed) ordered.reverse();
  return ordered;
}

function pluralize(s) {
  return (0, _pluralize.default)(s);
}

function sizeOf(arr) {
  if (Array.isArray(arr)) return arr.length;
  return 0;
}

function keySet(obj) {
  if (_typeof(obj) !== 'object') return [];
  if (!obj['__ukey-obj']) return Object.keys(obj);
  if (obj['__ukey-obj']) return Object.keys(obj).filter(function (k) {
    return k.startsWith('__key');
  }).map(function (k) {
    return Object.keys(obj[k])[0];
  });
}

function splitBy(str, split) {
  return String(str).split(split);
}

var _default = {
  addFunctions: addFunctions
};
exports.default = _default;