const nearley = require("nearley");
const grammar = require("../parser/dweeve-grammar.js");
const transpiler = require("../transpiler/transpiler.js");
const beautify = require('./beautify.js');
const vm = require('vm');
const xml2js = require('./xmldom2jsobj')
const DOMParser = require('xmldom').DOMParser;
       

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
        __doDotOp:  __doDotOp,
        __doDotStarOp: __doDotStarOp,
        __doDotDotStarOp: __doDotDotStarOp,
        __doDotDotOp: __doDotDotOp,
        __getIdentifierValue: __getIdentifierValue,
        isOdd: isOdd
    };
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(dwl.trim());

    if (parser.results.length === 0)
    throw "Dweeve parser found no dweeve!"

    if (parser.results.length > 1)
    throw "Dweeve parser found more than one intepretation of the dweeve!"

    code = transpiler.transpile(parser.results[0]);
     
    const script = new vm.Script(code.decs + '\n' +code.text + '\n var result=weave(payload)');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    let result = context.result

    return beautify(result, null,2,100);
}

function __getIdentifierValue(identifier){
    return identifier;
}

function __doDotOp(lhs, rhs) {
    try {
        
        if ( !Array.isArray(lhs)) {
            if (lhs['__extra-wrapped-list']){
                let r = Object.values(lhs).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs]
                return r;
            } else {
                let r = lhs[rhs]; 
                console.log(r);
                return r;
            }
        } else {
            let r = lhs.filter(m=>m['__extra-wrapped-list'] || m[rhs]!==undefined)
                .map(kvps=> {
                    if (kvps['__extra-wrapped-list']) {
                        return Object.values(kvps).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs];
                    } else {
                        return kvps[rhs];
                    }
                });
            return r;
        }
     } catch (ex) {
         return null; 
     } 
}

function __doDotStarOp(lhs, rhs) {
    if (!Array.isArray(lhs) && lhs['__extra-wrapped-list'] )
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__extra-wrapped-list'] ) {
        arr= [];
        for (let k in lhs)
            arr.push({[k]:lhs[k]})
        lhs = arr;
    }
    try {
        let r = lhs.filter(m=>m[rhs]!==undefined)
            .map(kvps=> kvps[rhs]);
        return r;

     } catch (ex) {
         return null; 
     } 
}

function __doDotDotStarOp(lhs,rhs) {
    if (!Array.isArray(lhs) && lhs['__extra-wrapped-list'] )
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__extra-wrapped-list'] ) {
        arr= [];
        for (let k in lhs)
            arr.push({[k]:lhs[k]})
        lhs = arr;
    }
try {
    let r = lhs.filter(m=>hasDescendentKey(m,rhs))
        .flatMap(kvps=> getDescendentValues(kvps,rhs));
    return r;

 } catch (ex) {
     return null; 
 } 
}

function hasDescendentKey(obj, key){
    if (typeof obj !== 'object') return false
    for (let k in obj)
        return k === key || hasDescendentKey(obj[k], key)
}

function getDescendentValues(obj, key){
    let vs = []
    if (typeof obj !== 'object') return []
    for (let k in obj) {
        if (k === key) 
            vs.push(obj[k])
        vs = vs.concat(getDescendentValues(obj[k], key))
    }
    return vs
}

function __doDotDotOp(lhs,rhs) {
    
}

function _old__doDotStarOp(lhs, rhs) {
    if (!Array.isArray(lhs) && lhs['__extra-wrapped-list'] )
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__extra-wrapped-list'] ) {
        arr= [];
        for (let k in lhs)
            arr.push({[k]:lhs[k]})
        lhs = arr;
    }
    try {
        let r = lhs.filter(m=>m['__extra-wrapped-list'] || m[rhs]!==undefined)
            .map(kvps=> {
                if (kvps['__extra-wrapped-list']) {
                    return Object.values(kvps).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs];
                } else {
                    return  kvps[rhs] ;
                }
            });
        return r;

     } catch (ex) {
         return null; 
     } 
}

function __getArrayMember(lhs, rhs) {
    try {
        if ( !Array.isArray(lhs)) {
            let r = lhs[rhs]; 
            console.log(r);
            return r;
        } else {
            let r = lhs.filter(m=>m[rhs]!==undefined).map(kvps=>kvps[rhs]);
            return r;
        }
     } catch {
         return null; 
     } 
}

function isOdd(number) {
    return number % 2 ? true: false;
}

module.exports = { run: run};
