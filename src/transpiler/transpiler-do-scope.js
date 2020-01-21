const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let genPreDict = new Dictionary.Dictionary();
let genPostDict = new Dictionary.Dictionary();

genPreDict['do-dweeve'] = (context, code) => { 
    let doDweeve = context.node;
    let doCode = getSubCode(code);
    let doId = '__do'+code.doScopes.length;
    code.doScopes.push( {[doId]: doCode})

    doCode.addCode('let doScope = () => (');
    context.compiler({node: doDweeve.dweeve, compiler:context.compiler}, doCode);
    doCode.addCode(')\n');

    args=''
    if (context.argList!==undefined && context.argList!=null) {
        context.argList.forEach(arg => {
            if (arg!==null)
                args+=', ' + arg.value + ': '+arg.value;
        });
    }

    code.addCode("__execDoScope(`\n" + doCode.decs + '\n' +doCode.text + '`, {payload: payload' + args + '} )')

    return false;
 };

 
 
 function getSubCode(code)
{
    let subCode = {text: '', decs: '', lines: code.lines, doScopes: code.doScopes}
    subCode.addCode = (text) => {
        subCode.text += text;
        subCode.lines.push(text);
    };
    return subCode;
}

function addTranspilerFeatures(preDict, postDict) {
    for (k in genPreDict)
        preDict[k]=genPreDict[k];
    for (k in genPostDict)
        postDict[k]=genPostDict[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}
