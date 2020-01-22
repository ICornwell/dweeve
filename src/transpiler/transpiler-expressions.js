const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let genPreDict = new Dictionary.Dictionary();
let genPostDict = new Dictionary.Dictionary();

genPreDict['member-list'] = (context, code) => { 
    if (context.node.members.length > 1) {
        code.addCode('{ "__extra-wrapped-list": true, \n') ; 
        let idx=0;
        context.node.members.forEach(m => {
            code.addCode('"__key' + idx++ + '": {') ; 
            context.compiler({parentType: 'obj-member', node: m, compiler:context.compiler}, code);
            code.addCode('},\n ') ; 
        });
        code.addCode('}\n')
    } else if (context.node.members.length === 1) {
        code.addCode('{')
        context.compiler({parentType: 'obj-member', node: context.node.members[0], compiler:context.compiler}, code);
        code.addCode('}')
    }
    return false; 
};

genPreDict['array'] = (context, code) => { 
    code.addCode('[') ; 
    context.node.members.args.forEach(m => {
        context.compiler({parentType: 'array-member', node: m, compiler:context.compiler}, code);
        code.addCode(', ') ; 
    });
    code.addCode(']') ; 
    return false; 
};

genPreDict['default-expression'] = (context, code) => { 
    code.addCode('( () => { let d = (');
    context.compiler({parentType: 'default-expression-default', node: context.node.default, compiler:context.compiler}, code);
    code.addCode('); try { let v = (') ; 
    context.compiler({parentType: 'default-expression-value', node: context.node.value, compiler:context.compiler}, code);
    code.addCode('); if (v!==null && v!==undefined) {return v;} else {return d;} } catch {return d} } )()\n ') 
    return false; 
};

genPreDict['idx-identifier'] = (context, code) => { 
    let id = context.node;
   
    code.addCode(id.ident.ident.value + '[');
    context.compiler({parentType: 'indexed-identifier', node: id.idx, compiler:context.compiler}, code);
    code.addCode(']') ; 
   
    return false; 
};

genPreDict['lambda'] = (context, code) => { 
    let lamda = context.node;
   
    code.addCode('(');
    if (lamda.args!==null && Array.isArray(lamda.args)) {
        idx=1;
        lamda.args.forEach(arg => {
            if (arg!==null) {
                code.addCode(arg.value);
                if (idx++<lamda.args.length)
                    code.addCode(', ');
            }
        });
    }
    code.addCode(') => (');
    context.compiler({parentType: 'lambda', node: lamda.expression, compiler:context.compiler}, code);
    code.addCode(')\n');
    return false; 
};

genPreDict['dynamic-key'] = (context, code) => { 
    code.addCode('[');
    context.compiler({parentType: 'dynamic-key', node: context.node.value, compiler:context.compiler}, code);
    code.addCode(']: ');
    return false;
};

// ( () => { try { return  key ;} catch { return 'bat'}; })()

//genPostDict['member-list'] = (context, code) => { code.addCode('}\n') };

genPostDict['key'] = (context, code) => { code.addCode(': ') };

//genPostDict['member'] = (context, code) => { code.addCode(',\n') };

genPreDict['word'] = (context, code) => { code.addCode(context.node.value ) };
genPreDict['number'] = (context, code) => { code.addCode(context.node.value) };
genPreDict['dblstring'] = (context, code) => { code.addCode(context.node.value) };
genPreDict['sglstring'] = (context, code) => { code.addCode(context.node.value) };
genPreDict['bool'] = (context, code) => { code.addCode(context.node.value) };
genPreDict['null'] = (context, code) => { code.addCode(context.node.value) };



function addTranspilerFeatures(preDict, postDict) {
    for (k in genPreDict)
        preDict[k]=genPreDict[k];
    for (k in genPostDict)
        postDict[k]=genPostDict[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}
