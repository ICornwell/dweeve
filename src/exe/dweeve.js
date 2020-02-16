const nearley = require("nearley");
const strip = require('strip-comments');
const dwgrammar = require("../parser/dweeve-grammar2.js");
const transpiler = require("../transpiler/transpiler.js");
const beautify = require('./beautify.js');
const vm = require('vm');
const xml2js = require('./xmldom2jsobj')
const DOMParser = require('xmldom').DOMParser;
const selectorFunctions = require('../functions/selectors')
const coreFunctions = require('../functions/core') 
const coreFunctions2 = require('../functions/core2') 
const doScopeFunctions = require('../functions/doScope')       

function run(dwl, payload, vars, attributes) {
    try {
        if (typeof payload === 'string' && payload.trim().startsWith('<') && payload.trim().endsWith('>')) {
            var xml = payload.trim();
            var doc = new DOMParser().parseFromString(xml);
            payload = xml2js.toJsObj(doc);
        } else if (typeof payload === 'string' && payload.trim().startsWith('{') && payload.trim().endsWith('}')) {
            payload = payload.replace(/\r\n/g, '\n');
            payload = runDweeveScript(payload, {})
        }
        let t = typeof payload;
        let result = innerRun (dwl, payload , vars, attributes);
        
        return result;
    }
    catch (err) {
        return "Error parsing input payload:"+err.message
    }
}

function innerRun (dwl, payload, vars, attributes) {
    try {
        const args = {
            payload: payload,
            vars: vars,
            attributes:attributes
        };

        let result = runDweeveScript(dwl, args)
        return beautify(result, null,2,100);
    }
    catch (err) {
        return err.message ? err.message : err;
    }
}

function runDweeveScript(dwl, args) {
    coreFunctions.addFunctions(args)
    coreFunctions2.addFunctions(args)
    doScopeFunctions.addFunctions(args)
    selectorFunctions.addFunctions(args)

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(dwgrammar))
    dwl = dwl.replace(/\r\n/g, '\n')
    dwl = strip(dwl)
    parser.feed(dwl.trim());

    if (parser.results.length === 0)
        throw "Dweeve parser found no (or somehow incomplete) dweeve!"
    if (parser.results.length > 1)
        throw "Dweeve parser found more than one intepretation of the dweeve!"

    const code = transpiler.transpile(parser.results[0]);
    const script = new vm.Script(code.decs + '\n' + code.text + '\n var result=dweeve()')
    const context = new vm.createContext(args)
    script.runInContext(context)
    let result = context.result
    return result;
}




module.exports = { run: run};
