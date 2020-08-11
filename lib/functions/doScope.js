"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vm = _interopRequireDefault(require("vm"));

var _selectors = _interopRequireDefault(require("../functions/selectors"));

var _core = _interopRequireDefault(require("../functions/core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addFunctions(context) {
  context['__execDoScope'] = __execDoScope;
}

function __execDoScope(code, args) {
  var script = new _vm.default.Script(code + '\n var result=doScope()');

  _core.default.addFunctions(args);

  addFunctions(args);

  _selectors.default.addFunctions(args);

  var context = new _vm.default.createContext(args);
  script.runInContext(context);
  return context.result;
}

var _default = {
  __execDoScope: __execDoScope,
  addFunctions: addFunctions
};
exports.default = _default;