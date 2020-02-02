const Dictionary = require('dictionaryjs');

let codeGenFor = new Dictionary.Dictionary();
let opfuncs = new Dictionary.Dictionary();

opfuncs['++'] = stringConcat

codeGenFor['math-result'] = (context, code) => { 
    let op = context.node;
    if (op.value.op)
        opCodeGen(op.value.lhs, op.value.op, op.value.rhs, context, code)
    else
        context.compiler({parentType: 'math-result', node: op.value, compiler:context.compiler}, code);
};

function opCodeGen(lhs, op, rhs, context,code) {
    code.addCode('(');
    if (opfuncs[op.value]!=undefined)
        opfuncs[op.value](lhs, op, rhs, context, code)
    else
        jsopCodeGen(lhs, op, rhs, context, code)
    code.addCode(')');
}
function jsopCodeGen(lhs, op, rhs, context,code) {
    emitOperand(lhs, context, code)
    code.addCode(op.value);
    emitOperand(rhs, context, code)
}

function stringConcat(lhs, op, rhs, context,code) {
    emitOperand(lhs, context, code)
    code.addCode('+');
    emitOperand(rhs, context, code)
}

function emitOperand(operand, context, code) {
    if (operand.op)
        opCodeGen(operand.lhs, operand.op, operand.rhs, context, code)
    else
        context.compiler({parentType: 'math-result', node: operand, compiler:context.compiler}, code);
}

function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    
        
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}