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
        __execDoScope: __execDoScope,
        isOdd: isOdd,
        concat: concat,
        map: map,
        mapObject: mapObject
    };
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(dwl.trim());

    if (parser.results.length === 0)
    throw "Dweeve parser found no dweeve!"

    if (parser.results.length > 1)
    throw "Dweeve parser found more than one intepretation of the dweeve!"

    code = transpiler.transpile(parser.results[0]);
     
    const script = new vm.Script(code.decs + '\n' +code.text + '\n var result=dweeve()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    let result = context.result

    return beautify(result, null,2,100);
}

function __execDoScope(code, args) {
    const script = new vm.Script(code + '\n var result=doScope()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    return context.result
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
    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = lhs.filter(m=>m[rhs]!==undefined)
            .map(kvps=> kvps[rhs]);
        return r;
     } catch (ex) {
         return null; 
     } 
}

function __doDotDotStarOp(lhs,rhs) {
//    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = getDescendentValues(lhs, rhs)
        return r;
    } catch (ex) {
        return null; 
    } 
}

function getDescendentValues(obj, key){
    let vs = []
    if (typeof obj !== 'object') return []
    // two loops to go down before in, to match dataweave 2.0 ordering
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        if (kvp.key === key) 
            vs.push(kvp.val)
    }
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        vs = vs.concat(getDescendentValues(kvp.val, key))
    }
    return vs
}

function __doDotDotOp(lhs,rhs) {
//    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = getFirstDescendentValue(lhs, rhs)
        return r;
    } catch (ex) {
        return null; 
    }     
}

function getFirstDescendentValue(obj, key){
    let vs = []
    if (typeof obj !== 'object') return []
    
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        if (kvp.key === key) {
            vs.push(kvp.val)
            break;
        }
    }
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        vs = vs.concat(getFirstDescendentValue(kvp.val, key))
    }
    return vs
}

function dewrapKeyedObj(obj, key) {
    if (!key.startsWith('__key'))
        return {key: key, val: obj[key]}
    else
        return {key : Object.keys(obj[key])[0], val:Object.values(obj[key])[0]}
}

function convertJsonObjsToArray(lhs) {
    if (!Array.isArray(lhs) && lhs['__extra-wrapped-list'])
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__extra-wrapped-list']) {
        arr = [];
        for (let k in lhs)
            arr.push({ [k]: lhs[k] });
        lhs = arr;
    }
    return lhs;
}



function isOdd(number) {
    return number % 2 ? true: false;
}

function concat(a,b) {
    return a+b;
}

function map(source, mapFunc){
    let out = []
    let ewl = (source['__extra-wrapped-list'])
    for(let key in source) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = source[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            out.push(mapFunc(v, k));
        }
    }

    return out;
}

function mapObject(source, mapFunc){
    let out = {'__extra-wrapped-list': true};
    let ewl = (source['__extra-wrapped-list'])
    let idx=0;
    for(let key in source) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = source[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            out['__key'+idx++]=(mapFunc(v, k));
        }
    }

    return out;
}

module.exports = { run: run};
