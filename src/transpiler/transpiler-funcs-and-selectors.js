const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let genPreDict = new Dictionary.Dictionary();
let genPostDict = new Dictionary.Dictionary();

genPreDict['dot-op'] = (context, code) => { 
    let op = context.node;
    switch (op.op.type) {
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
    context.compiler({parentType: 'dot-op-lhs', node: context.node.lhs, compiler:context.compiler}, code);
    code.addCode('), (\'');
    context.compiler({parentType: 'dot-top-rhs', node: context.node.rhs, compiler:context.compiler}, code);
    code.addCode('\')) )');
    
    return false;
 };

 genPreDict['bin-op'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.lhs, compiler:context.compiler}, code);
    if (op.op.value==='++') // double plus for string concat will be single + for javascript
        code.addCode('+');
    else
        code.addCode(op.op.value);
    context.compiler({node: op.rhs, compiler:context.compiler}, code);
    return false;
 };

 genPreDict['fun-call'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.fun, compiler:context.compiler}, code);
    code.addCode('(');
    if (op.args!==null && Array.isArray(op.args.args)) {
        idx=0;
        op.args.args.forEach(arg => {
            context.compiler({node: arg, compiler:context.compiler}, code);
            if (++idx<op.args.args.length)
                code.addCode(', ');
        });
    }
    code.addCode(')');
    return false;
 };


function addTranspilerFeatures(preDict, postDict) {
    for (k in genPreDict)
        preDict[k]=genPreDict[k];
    for (k in genPostDict)
        postDict[k]=genPostDict[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}
