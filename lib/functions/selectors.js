"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function addFunctions(context) {
  context['__doDotOp'] = __doDotOp;
  context['__doDotStarOp'] = __doDotStarOp;
  context['__doDotDotStarOp'] = __doDotDotStarOp;
  context['__doDotDotOp'] = __doDotDotOp;
  context['__getIdentifierValue'] = __getIdentifierValue;
  context['__flattenDynamicContent'] = __flattenDynamicContent;
}

function __getIdentifierValue(identifier) {
  return identifier;
}

function __doDotOp(lhs, rhs, lhsName, rhsName) {
  if (lhs == undefined) throw 'Can not reference member: "' + rhsName + '" as "' + lhsName + '" is not defined / present.';

  try {
    if (!Array.isArray(lhs)) {
      if (lhs['__ukey-obj']) {
        var r = Object.values(lhs).filter(function (v) {
          return _typeof(v) === 'object';
        }).find(function (kvp) {
          return kvp[rhs];
        })[rhs];
        return r;
      } else {
        var _r = lhs[rhs];
        if (_r == undefined) throw 'undefined';
        return _r;
      }
    } else {
      var _r2 = lhs.filter(function (m) {
        return m['__ukey-obj'] || m[rhs] !== undefined;
      }).map(function (kvps) {
        if (kvps['__ukey-obj']) {
          return Object.values(kvps).filter(function (v) {
            return _typeof(v) === 'object';
          }).find(function (kvp) {
            return kvp[rhs];
          })[rhs];
        } else {
          return kvps[rhs];
        }
      });

      return _r2;
    }
  } catch (ex) {
    return null; //  throw 'Can not reference member: "' + rhsName + '" of "' + lhsName + '", it is not defined / present.'; 
  }
}

function __doDotStarOp(lhs, rhs, lhsName, rhsName) {
  lhs = convertJsonObjsToArray(lhs);

  try {
    var ms = lhs.filter(function (m) {
      return m[rhs] !== undefined || m['__ukey-obj'] && Object.values(m).find(function (o) {
        return Object.keys(o)[0] === rhs;
      }) != undefined;
    });
    var r = ms.map(function (kvps) {
      return kvps[rhs] ? kvps[rhs] : Object.values(kvps).find(function (o) {
        return Object.keys(o)[0] === rhs;
      })[rhs];
    });
    return r;
  } catch (ex) {
    return null;
  }
}

function __doDotDotStarOp(lhs, rhs, lhsName, rhsName) {
  //    lhs = convertJsonObjsToArray(lhs)
  try {
    var r = getDescendentValues(lhs, rhs);
    return r;
  } catch (ex) {
    return null;
  }
}

function getDescendentValues(obj, key) {
  var vs = [];
  if (_typeof(obj) !== 'object') return []; // two loops to go down before in, to match dataweave 2.0 ordering

  for (var k in obj) {
    var kvp = dewrapKeyedObj(obj, k);
    if (kvp.key === key) vs.push(kvp.val);
  }

  for (var _k in obj) {
    var _kvp = dewrapKeyedObj(obj, _k);

    vs = vs.concat(getDescendentValues(_kvp.val, key));
  }

  return vs;
}

function __doDotDotOp(lhs, rhs, lhsName, rhsName) {
  //    lhs = convertJsonObjsToArray(lhs)
  try {
    var r = getFirstDescendentValue(lhs, rhs);
    return r;
  } catch (ex) {
    return null;
  }
}

function getFirstDescendentValue(obj, key) {
  var vs = [];
  if (_typeof(obj) !== 'object') return [];

  for (var k in obj) {
    var kvp = dewrapKeyedObj(obj, k);

    if (kvp.key === key) {
      vs.push(kvp.val);
      break;
    }
  }

  for (var _k2 in obj) {
    var _kvp2 = dewrapKeyedObj(obj, _k2);

    vs = vs.concat(getFirstDescendentValue(_kvp2.val, key));
  }

  return vs;
}

function dewrapKeyedObj(obj, key) {
  if (!key.startsWith('__key')) return {
    key: key,
    val: obj[key]
  };else return {
    key: Object.keys(obj[key])[0],
    val: Object.values(obj[key])[0]
  };
}

function __flattenDynamicContent(obj) {
  if (obj == null || obj == undefined || !obj['__hasDynamicContent']) return obj;
  var newObj = {
    "__ukey-obj": true
  };
  var idx = 0;
  Object.keys(obj).forEach(function (k) {
    if (k.startsWith('__key')) {
      newObj['__key' + idx++] = obj[k];
    } else if (k.startsWith('__dkey')) {
      if (Array.isArray(obj[k])) {
        obj[k].forEach(function (m) {
          if (m != null && m['__ukey-obj']) {
            // when flattening recursive dynamic content unbundle the ukey-objs 
            // before re-bundling
            Object.keys(m).filter(function (fk) {
              return fk.startsWith('__key');
            }).forEach(function (ik) {
              if (m[il]) newObj['__key' + idx++] = m[ik];
            });
          } else newObj['__key' + idx++] = m;
        });
      } else {
        if (obj[k] != null && obj[k] != undefined) {
          Object.keys(obj[k]).forEach(function (dk) {
            if (dk.startsWith('__key')) {
              if (obj[k][dk]) // ignore undefined entries left from conditional members
                newObj['__key' + idx++] = obj[k][dk];
            } else if (dk !== '__ukey-obj') {
              newObj['__key' + idx++] = _defineProperty({}, dk, obj[k][dk]);
            }
          });
        }
      }
    } else if (!k.startsWith('__')) {
      newObj['__key' + idx++] = _defineProperty({}, k, obj[k]);
    }
  });
  return newObj;
}

function convertJsonObjsToArray(lhs) {
  if (!Array.isArray(lhs) && lhs['__ukey-obj']) lhs = Object.values(lhs);else if (!Array.isArray(lhs) && !lhs['__ukey-obj']) {
    arr = [];

    for (var k in lhs) {
      arr.push(_defineProperty({}, k, lhs[k]));
    }

    lhs = arr;
  }
  return lhs;
}

var _default = {
  addFunctions: addFunctions
};
exports.default = _default;