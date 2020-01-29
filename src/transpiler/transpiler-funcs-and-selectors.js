const Dictionary = require('dictionaryjs');

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['dot-op'] = (context, code) => { 
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

 codeGenFor['bin-op'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.lhs, compiler:context.compiler}, code);
    if (op.op.value==='++') // double plus for string concat will be single + for javascript
        code.addCode('+');
    else
        code.addCode(op.op.value);
    context.compiler({node: op.rhs, compiler:context.compiler}, code);
    return false;
 };

 codeGenFor['fun-call'] = (context, code) => { 
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
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}
