const nearley = require("nearley");
const grammar = require("../parser/dweeve-grammar.js");
const transpiler = require("../transpiler/transpiler.js");
const beautify = require('./beautify.js');
const vm = require('vm');
const xml2js = require('./xmldom2jsobj')
const DOMParser = require('xmldom').DOMParser;
const selectorFunctions = require('../functions/selectors')
const coreFunctions = require('../functions/core') 
const doScopeFunctions = require('../functions/doScope')       

function run(dwl, payload, vars, attributes) {
 
    if (typeof payload === 'string' && payload.trim().startsWith('<') && payload.trim().endsWith('>')) {
        var xml = payload.trim();
        var doc = new DOMParser().parseFromString(xml);
        payload = xml2js.toJsObj(doc);
    }
    let t = typeof payload;
    let result = innerRun (dwl, payload , vars, attributes);
    
    return result;
}

function innerRun (dwl, payload, vars, attributes) {

    const args = {
        payload: payload,
        vars: vars,
        attributes:attributes,
        __doDotOp:  selectorFunctions.__doDotOp,
        __doDotStarOp: selectorFunctions.__doDotStarOp,
        __doDotDotStarOp: selectorFunctions.__doDotDotStarOp,
        __doDotDotOp: selectorFunctions.__doDotDotOp,
        __getIdentifierValue: selectorFunctions.__getIdentifierValue,
        __execDoScope: doScopeFunctions.__execDoScope,
        isOdd: coreFunctions.isOdd,
        concat: coreFunctions.concat,
        map: coreFunctions.map,
        mapObject: coreFunctions.mapObject
    };
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(dwl.trim());

    if (parser.results.length === 0)
    throw "Dweeve parser found no dweeve!"

    if (parser.results.length > 1)
    throw "Dweeve parser found more than one intepretation of the dweeve!"

    const code = transpiler.transpile(parser.results[0]);
     
    const script = new vm.Script(code.decs + '\n' +code.text + '\n var result=dweeve()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    let result = context.result

    return beautify(result, null,2,100);
}

module.exports = { run: run};
