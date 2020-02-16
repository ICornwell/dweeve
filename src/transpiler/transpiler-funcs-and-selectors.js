const Dictionary = require('dictionaryjs');

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();



 codeGenFor['fun-call'] = (context, code) => { 
    let op = context.node;
    if (op.fun.type)
        context.compiler({node: op.fun, compiler:context.compiler}, code)
    else
        code.addCode(op.fun)

    code.addCode('(');
    if (op.args!==null && Array.isArray(op.args)) {
        let idx=0;
        op.args.forEach(arg => {
            if (isAnonymousLambdaExpression(arg) && idx > 0) // only for rhs lambdas, hence idx > 0!
            // otherwise [x,y,z] filter ($ >3) map ($++'!') picks up the '$' on the filter rhs and assume map lhs needs the anonymous treatment
                buildLamda(arg, context, code);
            else 
                context.compiler({node: arg, compiler:context.compiler}, code);
            if (++idx<op.args.length)
                code.addCode(', ');
        });
    }
    code.addCode(')');
    return false;
 };

 function buildLamda(expression, context, code){
    var args = getAllIdentifiersUsedInExpression(expression).filter(id=>id.match(/[$]+/)).filter(onlyUnique);
    code.addCode('(');
    let idx=1;
    args.forEach(arg => {
        code.addCode(arg);
        if (idx++<args.length)
           code.addCode(', ');
    });
    code.addCode(') => (');
    context.compiler({parentType: 'lambda', node: expression, compiler:context.compiler}, code);
    code.addCode(')\n');
 }

 function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

 function isAnonymousLambdaExpression(node) {
     //TODO: add check that we don't already have a fully expressed lambda, just using $ notation
     return (node && node.type &&
     getAllIdentifiersUsedInExpression(node).filter(id=>(id.match(/[$]+/))).length>0)
 }

 function getAllIdentifiersUsedInExpression(expression){
    let identifiers = [];
    recurseGetAllIdentifiersUsedInExpression(expression, identifiers)
    return identifiers;
 }

 function recurseGetAllIdentifiersUsedInExpression(expPart, identifiers){
    if (expPart.type && expPart.type==='identifier') {
        identifiers.push(expPart.ident.value)
        return
    }
    //TOOD: every possible part of a node! (or just loop and do everything!)
    if (expPart.value)
        recurseGetAllIdentifiersUsedInExpression(expPart.value, identifiers)
    if (expPart.lhs)
        recurseGetAllIdentifiersUsedInExpression(expPart.lhs, identifiers)
    if (expPart.rhs)
        recurseGetAllIdentifiersUsedInExpression(expPart.rhs, identifiers)
    if (expPart.key)
        recurseGetAllIdentifiersUsedInExpression(expPart.key, identifiers)
    if (expPart.members)
        if (Array.isArray(expPart.members))
            expPart.members.forEach(m=>recurseGetAllIdentifiersUsedInExpression(m, identifiers))
        else if (Array.isArray(expPart.members.args))
            expPart.members.args.forEach(m=>recurseGetAllIdentifiersUsedInExpression(m, identifiers))
    if (expPart.args)
        expPart.args.forEach(a=>recurseGetAllIdentifiersUsedInExpression(a, identifiers))

 }


function addTranspilerFeatures(preDict, postDict) {
    for (let k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (let k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}
