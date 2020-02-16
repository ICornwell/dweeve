const Dictionary = require('dictionaryjs');

let codeGenFor = new Dictionary.Dictionary();
let opfuncs = new Dictionary.Dictionary();

opfuncs['++'] = stringConcat
opfuncs['='] = equals
opfuncs['.'] = selector
opfuncs['..'] = selector
opfuncs['.*'] = selector
opfuncs['..*'] = selector
opfuncs['and'] = andLogic
opfuncs['or'] = orLogic

codeGenFor['dot-op'] = (context, code) => { functionHandler(context, code) }
codeGenFor['product'] = (context, code) => { functionHandler(context, code) }
codeGenFor['sum'] = (context, code) => { functionHandler(context, code) }
codeGenFor['relative'] = (context, code) => { functionHandler(context, code) }
codeGenFor['and'] = (context, code) => { functionHandler(context, code) }
codeGenFor['or'] = (context, code) => { functionHandler(context, code) }
codeGenFor['bracket-operand'] = (context, code) => { functionHandler(context, code) }

function functionHandler (context, code)  { 
    let op = context.node;
    if (op.op)
        opCodeGen(op.lhs, op.op, op.rhs, context, code)
    else
        context.compiler({parentType: 'math-result', node: op.value, compiler:context.compiler}, code);
}

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
    code.addCode('__add(');
    emitOperand(lhs, context, code)
    code.addCode(',');
    emitOperand(rhs, context, code)
    code.addCode(')');
}

function equals(lhs, op, rhs, context,code) {
    emitOperand(lhs, context, code)
    code.addCode('===');
    emitOperand(rhs, context, code)
}

function andLogic(lhs, op, rhs, context,code) {
    emitOperand(lhs, context, code)
    code.addCode('&&');
    emitOperand(rhs, context, code)
}

function orLogic(lhs, op, rhs, context,code) {
    emitOperand(lhs, context, code)
    code.addCode('||');
    emitOperand(rhs, context, code)
}

function selector(lhs, op, rhs, context,code) {
    switch (op.type) {
        case "dot":
            code.addCode('( __doDotOp( (');
            break;
        case "dotstar":
            code.addCode('( __doDotStarOp( (');
            break;
        case "dotdotstar":
            code.addCode('( __doDotDotStarOp( (');
            break;
        case "dotdot":
            code.addCode('( __doDotDotOp( (');
            break;
    }
    const lhsExp = emitOperand(lhs, context, code).replace(/'/g, '"').replace(/\n/g, '')
    code.addCode('), (\'');
    const rhsExp = emitOperand(rhs, context, code).replace(/'/g, '"').replace(/\n/g, '')
    code.addCode('\'), \''+ lhsExp + '\', \'' + rhsExp + '\' ))');
    
}

function emitOperand(operand, context, code) {
    const opCode = getSubCode(code)
    if (operand.op)
        opCodeGen(operand.lhs, operand.op, operand.rhs, context, opCode)
    else
        context.compiler({parentType: 'math-result', node: operand, compiler:context.compiler}, opCode);

    code.addCode(opCode.text);
    return opCode.text;
}

function addTranspilerFeatures(preDict, postDict) {
    for (let k in codeGenFor)
        preDict[k]=codeGenFor[k];
    
        
}

function getSubCode(code)
{
    let subCode = {text: '', lines: code.lines, doScopes: code.doScopes}
    subCode.addCode = (text) => {
        subCode.text += text;
        subCode.lines.push(text);
    };
    return subCode;
}

module.exports = {functionHandler: functionHandler, addTranspilerFeatures : addTranspilerFeatures}