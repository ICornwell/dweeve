"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dictionaryjs = require("dictionaryjs");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var codeGenFor = new _dictionaryjs.Dictionary();

codeGenFor['do-dweeve'] = function (context, code) {
  var doDweeve = context.node;
  var doCode = getSubCode(code);
  var doId = '__do' + code.doScopes.length;
  code.doScopes.push(_defineProperty({}, doId, doCode));
  doCode.addCode('let doScope = () => (');
  context.compiler({
    node: doDweeve.dweeve,
    compiler: context.compiler
  }, doCode);
  doCode.addCode(')\n');
  var args = '';

  if (context.argList !== undefined && context.argList != null) {
    context.argList.forEach(function (arg) {
      if (arg !== null) args += ', ' + arg.value + ': ' + arg.value;
    });
  }

  code.addCode("__execDoScope(`\n" + doCode.decs + '\n' + doCode.text + '`, {payload: payload' + args + '} )');
  return false;
};

function getSubCode(code) {
  var subCode = {
    text: '',
    decs: '',
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