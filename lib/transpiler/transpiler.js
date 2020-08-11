"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dictionaryjs = require("dictionaryjs");

var _transpilerHeaderDecs = _interopRequireDefault(require("./transpiler-header-decs"));

var _transpilerConditionals = _interopRequireDefault(require("./transpiler-conditionals"));

var _transpilerFuncsAndSelectors = _interopRequireDefault(require("./transpiler-funcs-and-selectors"));

var _transpilerExpressions = _interopRequireDefault(require("./transpiler-expressions"));

var _transpilerDoScope = _interopRequireDefault(require("./transpiler-do-scope"));

var _transpilerMathOp = _interopRequireDefault(require("./transpiler-math-op"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var codeGenFor = new _dictionaryjs.Dictionary();

_transpilerHeaderDecs.default.addTranspilerFeatures(codeGenFor);

_transpilerConditionals.default.addTranspilerFeatures(codeGenFor);

_transpilerFuncsAndSelectors.default.addTranspilerFeatures(codeGenFor);

_transpilerExpressions.default.addTranspilerFeatures(codeGenFor);

_transpilerDoScope.default.addTranspilerFeatures(codeGenFor);

_transpilerMathOp.default.addTranspilerFeatures(codeGenFor);

function transpile(dweeve) {
  var code = {
    text: "dweeve = () => ( ",
    decs: '',
    lines: [],
    doScopes: []
  };

  code.addCode = function (text) {
    code.text += text;
    code.lines.push(text);
  };

  var context = {
    parentType: 'dweeve',
    node: dweeve,
    compiler: recursiveTranspile
  };
  recursiveTranspile(context, code);
  code.text += "\n);";
  return code;
}

function recursiveTranspile(context, code) {
  var n = context.node;
  if (n === undefined || n === null || n.type === undefined) return;
  var goDeep = true;
  var codeGen = codeGenFor[n.type];
  if (codeGen !== undefined) goDeep = codeGen(context, code); // if we have a token leaf node, do nothing, otherwise do some compiling!

  if (n.hasOwnProperty('text') && n.hasOwnProperty('value')) {} else if (goDeep) {
    for (var key in n) {
      if (key !== 'type' && n.hasOwnProperty(key)) {
        var v = n[key];

        if (Array.isArray(v)) {
          v.forEach(function (an) {
            return context.compiler({
              parentType: n.type,
              node: an,
              compiler: context.compiler
            }, code);
          });
        } else {
          context.compiler({
            parentType: n.type,
            node: v,
            compiler: context.compiler
          }, code);
        }
      }
    }
  }
}

var _default = {
  transpile: transpile
};
exports.default = _default;