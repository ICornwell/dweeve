const Dictionary = require('dictionaryjs');
const HeaderFeatures = require('./transpiler-header-decs')
const ConditionalsFeatures = require('./transpiler-conditionals')
const FuncAndSelectorFeatures = require('./transpiler-funcs-and-selectors')
const ExpressionFeatures = require('./transpiler-expressions')
const DoScopeFeatures = require('./transpiler-do-scope')
var sourceMap = require("source-map");

let genPreDict = new Dictionary.Dictionary();
let genPostDict = new Dictionary.Dictionary();

HeaderFeatures.addTranspilerFeatures(genPreDict, genPostDict);
ConditionalsFeatures.addTranspilerFeatures(genPreDict, genPostDict);
FuncAndSelectorFeatures.addTranspilerFeatures(genPreDict, genPostDict);
ExpressionFeatures.addTranspilerFeatures(genPreDict, genPostDict);
DoScopeFeatures.addTranspilerFeatures(genPreDict, genPostDict);


function transpile(dweeve){

    let code = { text: ("dweeve = () => ( "), decs: '', lines: [], doScopes: [] };
    code.addCode = (text) => {
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
    
    let goDeep = true;

    let pre =genPreDict[n.type]
    if (pre!==undefined) goDeep = pre(context, code)
    // if we have a token leaf node, do nothing, otherwise do some compiling!
    if (n.hasOwnProperty('text') && n.hasOwnProperty('value')) {
    } else if (goDeep) {
        for (var key in n) {
            if (key !=='type' && n.hasOwnProperty(key)) {
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