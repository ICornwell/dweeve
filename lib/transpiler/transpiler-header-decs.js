"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dictionaryjs = require("dictionaryjs");

var codeGenFor = new _dictionaryjs.Dictionary();

codeGenFor['var-dec'] = function (context, code) {
  var op = context.node;
  var decCode = getSubCode(code);
  decCode.addCode('var ' + op.varName + ' = ');
  context.compiler({
    node: op.varVal,
    compiler: context.compiler
  }, decCode);
  decCode.addCode(';\n');
  code.decs += decCode.text;
  return false;
};

codeGenFor['fun-def'] = function (context, code) {
  var op = context.node;
  var decCode = getSubCode(code);
  decCode.addCode('\n function ' + op.func.value + '(');

  if (op.args !== null && Array.isArray(op.args)) {
    var idx = 1;
    op.args.forEach(function (arg) {
      if (arg !== null) {
        decCode.addCode(arg.value);
        if (idx++ < op.args.length) decCode.addCode(', ');
      }
    });
  }

  decCode.addCode(') { return ( \n');
  context.compiler({
    node: op.body,
    compiler: context.compiler,
    argList: op.args
  }, decCode);
  decCode.addCode(' ) }\n');
  code.decs += decCode.text;
  return false;
};

function getSubCode(code) {
  var subCode = {
    text: '',
    lines: code.lines,
    doScopes: code.doScopes
  };

  subCode.addCode = function (text) {
    subCode.text += text;
    subCode.lines.push(text);
  };

  return subCode;
}

function addTranspilerFeatures(preDict) {
  for (var k in codeGenFor) {
    preDict[k] = codeGenFor[k];
  }
}

var _default = {
  addTranspilerFeatures: addTranspilerFeatures
};
exports.default = _default;