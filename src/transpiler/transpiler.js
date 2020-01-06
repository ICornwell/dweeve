const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let genPreDict = new Dictionary.Dictionary();
let genPostDict = new Dictionary.Dictionary();

genPreDict['member-list'] = (context, code) => { 
    code.addLine('{\n') ; 
    context.node.members.forEach(m => {
        context.compiler({parentType: 'obj-member', node: m, compiler:context.compiler}, code);
    });
    return false; 
};

genPreDict['array'] = (context, code) => { 
    code.addLine('[') ; 
    context.node.members.args.forEach(m => {
        context.compiler({parentType: 'array-member', node: m, compiler:context.compiler}, code);
        code.addLine(', ') ; 
    });
    code.addLine(']') ; 
    return false; 
};

genPreDict['default-expression'] = (context, code) => { 
    code.addLine('( () => { let d = (');
    context.compiler({parentType: 'default-expression-default', node: context.node.default, compiler:context.compiler}, code);
    code.addLine('); try { let v = (') ; 
    context.compiler({parentType: 'default-expression-value', node: context.node.value, compiler:context.compiler}, code);
    code.addLine('); if (v!==null && v!==undefined) {return v;} else {return d;} } catch {return d} } )()\n ') 
    return false; 
};

// ( () => { try { return  key ;} catch { return 'bat'}; })()

genPostDict['member-list'] = (context, code) => { code.addLine('}\n') };

genPostDict['key'] = (context, code) => { code.addLine(': ') };

genPostDict['member'] = (context, code) => { code.addLine(',\n') };

genPreDict['word'] = (context, code) => { code.addLine(context.node.value) };
genPreDict['number'] = (context, code) => { code.addLine(context.node.value) };
genPreDict['dblstring'] = (context, code) => { code.addLine(context.node.value) };
genPreDict['sglstring'] = (context, code) => { code.addLine(context.node.value) };
genPreDict['bool'] = (context, code) => { code.addLine(context.node.value) };
genPreDict['null'] = (context, code) => { code.addLine(context.node.value) };


genPreDict['dot-op'] = (context, code) => { 
    let op = context.node;
    code.addLine('( __getMember( (');
    context.compiler({parentType: 'dot-op-lhs', node: context.node.lhs, compiler:context.compiler}, code);
    code.addLine('), (\'');
    context.compiler({parentType: 'dot-top-rhs', node: context.node.rhs, compiler:context.compiler}, code);
    code.addLine('\')) )');
    
    return false;
 };

 genPreDict['if-conditional'] = (context, code) => { 
    let op = context.node;
    code.addLine('( () =>  { if (');
    context.compiler({parentType: 'if-conidtion', node: context.node.condition, compiler:context.compiler}, code);
    code.addLine(') { return (');
    context.compiler({parentType: 'if-then', node: context.node.then, compiler:context.compiler}, code);
    code.addLine(');} else { return (');
    context.compiler({parentType: 'if-else', node: context.node.else, compiler:context.compiler}, code);
    code.addLine(');} } ) ()');
    
    return false;
 };

 genPreDict['pattern-match'] = (context, code) => { 
    let cn = context.node;
    code.addLine('( () => { let $ = (');
    context.compiler({parentType: 'if-condition', node: cn.input, compiler:context.compiler}, code);
    code.addLine('); \n');
    if (Array.isArray(cn.cases)){
        cn.cases.forEach( c => {
            if (c.match.type === 'match-if-exp') {
                code.addLine('{');
                if (c.match.var !== null) {code.addLine(' let '+ c.match.var.value + ' = $; ')};
                code.addLine(' if (');
                context.compiler({parentType: 'if-exp-match', node: c.match.expMatch, compiler:context.compiler}, code);
                code.addLine(') { return (');
                context.compiler({parentType: 'if-exp-match-result', node: c.result, compiler:context.compiler}, code);
                code.addLine(') } }\n');
            }

            if (c.match.type === 'match-regex') {
                code.addLine('{ try {');
                code.addLine(' let '+ c.match.var.value + ' = $.match(' + c.match.regex + '); ');
                code.addLine(' if ('+ c.match.var.value + ' !==null) { return (');
                context.compiler({parentType: 'if-exp-match-result', node: c.result, compiler:context.compiler}, code);
                code.addLine(') } } catch {} }\n');
            }

            if (c.match.type === 'match-literal') {
                code.addLine('{');
                if (c.match.var !== null) {code.addLine(' let '+ c.match.var.value + ' = $; ')};
                code.addLine(' if ( $ ===' + c.match.litMatch.value.value + ') { return (');
                context.compiler({parentType: 'if-exp-match-result', node: c.result, compiler:context.compiler}, code);
                code.addLine(') } }\n');
            }

            if (c.match.type === 'match-type') {
                code.addLine('{');
                if (c.match.var !== null) {code.addLine(' let '+ c.match.var.value + ' = $; ')};
                code.addLine(' if ( typeof $ is ' + c.match.typeName.value.toLowerCase() + ') { return (');
                context.compiler({parentType: 'if-exp-match-result', node: c.result, compiler:context.compiler}, code);
                code.addLine(') } }\n');
            }

        });
    };
    if (cn.else !== null) {
        code.addLine('return (');
        context.compiler({parentType: 'if-else', node: cn.else, compiler:context.compiler}, code);
        code.addLine(');');
    }
    code.addLine('} ) ()');
    
    return false;
 };

 genPreDict['var-dec'] = (context, code) => { 
    let op = context.node;
    let decCode = getSubCode(code);
    decCode.addLine('var ' + op.varName + ' = ');
    context.compiler({node: op.varVal, compiler:context.compiler}, decCode);
    decCode.addLine(';\n');
    code.decs+=decCode.text;
    return false;
 };

 genPreDict['bin-op'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.lhs, compiler:context.compiler}, code);
    if (op.op.value==='++') // double plus for string concat will be single + for javascript
        code.addLine('+');
    else
        code.addLine(op.op.value);
    context.compiler({node: op.rhs, compiler:context.compiler}, code);
    return false;
 };

function getSubCode(code)
{
    let subCode = {text: '', lines: code.lines}
    subCode.addLine = (text) => {
        subCode.text += text;
        subCode.lines.push(text);
    };
    return subCode;
}

function transpile(dweeve){


    let code = { text: ("weave = (payload) => ( "), decs: '', lines: [] };
    code.addLine = (text) => {
        code.text += text;
        code.lines.push(text);
    };

    let context = {parentType : 'dweeve', node: dweeve, compiler: recursiveTranspile}

    recursiveTranspile(context, code)

    code.text+="\n);"

    return code;
}

function recursiveTranspile(context, code) {
    let n = context.node;
    if (n===undefined || n===null || n.type===undefined) return;
    console.log("Type: "+n.type);
    
    let goDeep = true;

    let pre =genPreDict[n.type]
    if (pre!==undefined) goDeep = pre(context, code)

    if (n.hasOwnProperty('text') && n.hasOwnProperty('value')) {
        console.log("      - val: "+n['value']);
    } else if (goDeep) {
        for (var key in n) {
            if (key !=='type' && n.hasOwnProperty(key)) {
                console.log("    - processing: "+key);
                let v = n[key];
                if (Array.isArray(v)) {
                    v.forEach(an => context.compiler({parentType: n.type, node: an, compiler:context.compiler}, code))
                } else {
                    context.compiler({parentType: n.type, node: v, compiler:context.compiler}, code)
                }
            }
        }
    }

    let post =genPostDict[n.type]
    if (post!==undefined) post(context, code)
};

module.exports = { transpile: transpile};