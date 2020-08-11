"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dictionaryjs = require("dictionaryjs");

var codeGenFor = new _dictionaryjs.Dictionary();

codeGenFor['fun-call'] = function (context, code) {
  var op = context.node;
  if (op.fun.type) context.compiler({
    node: op.fun,
    compiler: context.compiler
  }, code);else code.addCode(op.fun);
  code.addCode('(');

  if (op.args !== null && Array.isArray(op.args)) {
    var idx = 0;
    op.args.forEach(function (arg) {
      if (isAnonymousLambdaExpression(arg) && idx > 0) // only for rhs lambdas, hence idx > 0!
        // otherwise [x,y,z] filter ($ >3) map ($++'!') picks up the '$' on the filter rhs and assume map lhs needs the anonymous treatment
        buildLamda(arg, context, code);else if (typeof arg === 'boolean') code.addCode(arg.toString());else context.compiler({
        node: arg,
        compiler: context.compiler
      }, code);
      if (++idx < op.args.length) code.addCode(', ');
    });
  }

  code.addCode(')');
  return false;
};

function buildLamda(expression, context, code) {
  code.addCode('($,$$,$$$) => (');
  context.compiler({
    parentType: 'lambda',
    node: expression,
    compiler: context.compiler
  }, code);
  code.addCode(')\n');
}

function isAnonymousLambdaExpression(node) {
  //TODO: add check that we don't already have a fully expressed lambda, just using $ notation
  return node && node.type && getAllIdentifiersUsedInExpression(node).filter(function (id) {
    return id.match(/[$]+/);
  }).length > 0;
}

function getAllIdentifiersUsedInExpression(expression) {
  var identifiers = [];
  recurseGetAllIdentifiersUsedInExpression(expression, identifiers);
  return identifiers;
}

function recurseGetAllIdentifiersUsedInExpression(expPart, identifiers) {
  if (expPart == null || expPart == undefined) return;

  if (expPart.type && expPart.type === 'identifier') {
    identifiers.push(expPart.ident.value);
    return;
  } //TOOD: every possible part of a node! (or just loop and do everything!)


  if (expPart.value) recurseGetAllIdentifiersUsedInExpression(expPart.value, identifiers);
  if (expPart.lhs) recurseGetAllIdentifiersUsedInExpression(expPart.lhs, identifiers);
  if (expPart.rhs) recurseGetAllIdentifiersUsedInExpression(expPart.rhs, identifiers);
  if (expPart.key) recurseGetAllIdentifiersUsedInExpression(expPart.key, identifiers);
  if (expPart.members) if (Array.isArray(expPart.members)) expPart.members.forEach(function (m) {
    return recurseGetAllIdentifiersUsedInExpression(m, identifiers);
  });else if (Array.isArray(expPart.members.args)) expPart.members.args.forEach(function (m) {
    return recurseGetAllIdentifiersUsedInExpression(m, identifiers);
  });
  if (expPart.args) expPart.args.forEach(function (a) {
    return recurseGetAllIdentifiersUsedInExpression(a, identifiers);
  });
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