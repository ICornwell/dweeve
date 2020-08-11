"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dictionaryjs = require("dictionaryjs");

var codeGenFor = new _dictionaryjs.Dictionary();

codeGenFor['if-conditional'] = function (context, code) {
  var op = context.node;
  code.addCode('( () =>  { if (');
  context.compiler({
    parentType: 'if-conidtion',
    node: context.node.condition,
    compiler: context.compiler
  }, code);
  code.addCode(') { return (');
  context.compiler({
    parentType: 'if-then',
    node: context.node.then,
    compiler: context.compiler
  }, code);
  code.addCode(');} else { return (');
  context.compiler({
    parentType: 'if-else',
    node: context.node.else,
    compiler: context.compiler
  }, code);
  code.addCode(');} } ) ()');
  return false;
};

codeGenFor['pattern-match'] = function (context, code) {
  var cn = context.node;
  code.addCode('( () => { let $ = (');
  context.compiler({
    parentType: 'if-condition',
    node: cn.input,
    compiler: context.compiler
  }, code);
  code.addCode('); \n');

  if (Array.isArray(cn.cases)) {
    cn.cases.forEach(function (c) {
      if (c.match.type === 'match-if-exp') emitcodeMatchIfExp(code, c, context);else if (c.match.type === 'match-regex') emitcodeMatchRegex(code, c, context);else if (c.match.type === 'match-literal') emitcodeMatchLiteral(code, c, context);else if (c.match.type === 'match-type') emitcodeMatchType(code, c, context);
    });
  }

  if (cn.else !== null) {
    code.addCode('return (');
    context.compiler({
      parentType: 'if-else',
      node: cn.else,
      compiler: context.compiler
    }, code);
    code.addCode(');');
  }

  code.addCode('} ) ()');
  return false;
};

function emitcodeMatchType(code, c, context) {
  code.addCode('{');
  if (c.match.var !== null) code.addCode(' let ' + c.match.var.value + ' = $; ');
  code.addCode(' if ( typeof $ === "' + c.match.typeName.value.toLowerCase() + '") { return (');
  context.compiler({
    parentType: 'if-exp-match-result',
    node: c.result,
    compiler: context.compiler
  }, code);
  code.addCode(') } }\n');
}

function emitcodeMatchLiteral(code, c, context) {
  code.addCode('{');
  if (c.match.var !== null) code.addCode(' let ' + c.match.var.value + ' = $; ');
  code.addCode(' if ( $ ===' + c.match.litMatch.value.value + ') { return (');
  context.compiler({
    parentType: 'if-exp-match-result',
    node: c.result,
    compiler: context.compiler
  }, code);
  code.addCode(') } }\n');
}

function emitcodeMatchRegex(code, c, context) {
  code.addCode('{ try {');
  code.addCode(' let ' + c.match.var.value + ' = $.match(' + c.match.regex + '); ');
  code.addCode(' if (' + c.match.var.value + ' !==null) { return (');
  context.compiler({
    parentType: 'if-exp-match-result',
    node: c.result,
    compiler: context.compiler
  }, code);
  code.addCode(') } } catch {} }\n');
}

function emitcodeMatchIfExp(code, c, context) {
  code.addCode('{');
  if (c.match.var !== null) code.addCode(' let ' + c.match.var.value + ' = $; ');
  code.addCode(' if (');
  context.compiler({
    parentType: 'if-exp-match',
    node: c.match.expMatch,
    compiler: context.compiler
  }, code);
  code.addCode(') { return (');
  context.compiler({
    parentType: 'if-exp-match-result',
    node: c.result,
    compiler: context.compiler
  }, code);
  code.addCode(') } }\n');
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