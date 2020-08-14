"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nearley = _interopRequireDefault(require("nearley"));

var _stripComments = _interopRequireDefault(require("strip-comments"));

var _dweeveGrammar = _interopRequireDefault(require("../parser/dweeve-grammar"));

var _transpiler = _interopRequireDefault(require("../transpiler/transpiler"));

var _beautify = _interopRequireDefault(require("./beautify"));

var _vm = _interopRequireDefault(require("vm"));

var _xmldom2jsobj = _interopRequireDefault(require("./xmldom2jsobj"));

var _xmldom = require("xmldom");

var _selectors = _interopRequireDefault(require("../functions/selectors"));

var _core = _interopRequireDefault(require("../functions/core"));

var _core2 = _interopRequireDefault(require("../functions/core2"));

var _doScope = _interopRequireDefault(require("../functions/doScope"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var lastTimings = {
  "parser": 0,
  "transpiler": 0,
  "execution": 0
};

function runWithTimes(dwl, payload, vars, attributes) {
  var r = run(dwl, payload, vars, attributes);
  return {
    "result": r,
    "times": lastTimings
  };
}

function run(dwl, payload, vars, attributes) {
  try {
    if (typeof payload === 'string' && payload.trim().startsWith('<') && payload.trim().endsWith('>')) {
      var xml = payload.trim();
      var doc = new _xmldom.DOMParser().parseFromString(xml);
      payload = _xmldom2jsobj.default.toJsObj(doc);
    } else if (typeof payload === 'string' && payload.trim().startsWith('{') && payload.trim().endsWith('}')) {
      payload = payload.replace(/\r\n/g, '\n');
      payload = runDweeveScript(payload, {});
    }

    var t = _typeof(payload);

    var result = innerRun(dwl, payload, vars, attributes);
    return result;
  } catch (err) {
    return "Error parsing input payload:" + err.message;
  }
}

function innerRun(dwl, payload, vars, attributes) {
  try {
    var args = {
      payload: payload,
      vars: vars,
      attributes: attributes
    };
    var result = runDweeveScript(dwl, args);
    return (0, _beautify.default)(result, null, 2, 100);
  } catch (err) {
    return err.message ? err.message : err;
  }
}

function runDweeveScript(dwl, args) {
  _core.default.addFunctions(args);

  _core2.default.addFunctions(args);

  _doScope.default.addFunctions(args);

  _selectors.default.addFunctions(args);

  var startPtime = Date.now();
  var parser = new _nearley.default.Parser(_nearley.default.Grammar.fromCompiled(_dweeveGrammar.default));
  dwl = dwl.replace(/\r\n/g, '\n');
  dwl = (0, _stripComments.default)(dwl);
  parser.feed(dwl.trim());
  if (parser.results.length === 0) throw "Dweeve parser found no (or somehow incomplete) dweeve!";
  if (parser.results.length > 1) throw "Dweeve parser found more than one intepretation of the dweeve!";
  var startTtime = Date.now();

  var code = _transpiler.default.transpile(parser.results[0]);

  var script = new _vm.default.Script(code.decs + '\n' + code.text + '\n var result=dweeve()');
  var context = new _vm.default.createContext(args);
  var startEtime = Date.now();
  script.runInContext(context);
  var endEtime = Date.now();
  var result = context.result;
  lastTimings = {
    "parser": startTtime - startPtime,
    "transpiler": startEtime - startTtime,
    "execution": endEtime - startEtime
  };
  return result;
}

var _default = {
  run: run,
  runWithTimes: runWithTimes
};
exports.default = _default;