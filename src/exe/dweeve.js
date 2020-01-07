const nearley = require("nearley");
const grammar = require("../parser/dweeve-grammar.js");
const transpiler = require("../transpiler/transpiler.js");
const prettyJs = require('pretty-js');
const util = require('util');
const vm = require('vm');


function run(dwl, payload, vars, attributes) {
    const args = {
        payload: payload,
        vars: vars,
        attributes:attributes,
        __getMember:  __getMember
      };
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(dwl.trim());

    console.log("Interpreations found: " +parser.results.length);

    code = transpiler.transpile(parser.results[0]);

//    console.log(prettyJs(code.decs));
//    console.log(prettyJs(code.text));
      
      const script = 
      new vm.Script(code.decs + '\n' +code.text + '\n var result=weave(payload)');
      
      const context = new vm.createContext(args);
      script.runInContext(context);

      return context.result;
}

function __getMember(lhs, rhs) {
    try {
        if ( !Array.isArray(lhs)) {
            return lhs[rhs]; 
        } else {
            return lhs.filter(m=>m[rhs]!==undefined).map(kvps=>kvps[rhs]);
        }
     } catch {
         return null; 
     } 
}

module.exports = { run: run};
