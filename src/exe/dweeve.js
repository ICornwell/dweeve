import nearley from 'nearley'
import strip from 'strip-comments'
import grammar from '../parser/dweeve-grammar'
import transpiler from '../transpiler/transpiler'
import beautify from './beautify'
import vm from 'vm'
import xml2js from './xmldom2jsobj'
import {DOMParser} from 'xmldom'
import selectorFunctions from '../functions/selectors'
import coreFunctions from '../functions/core' 
import coreFunctions2 from '../functions/core2' 
import doScopeFunctions from '../functions/doScope'       

function run(dwl, payload, vars, attributes) {
    try {
        if (typeof payload === 'string' && payload.trim().startsWith('<') && payload.trim().endsWith('>')) {
            var xml = payload.trim()
            var doc = new DOMParser().parseFromString(xml)
            payload = xml2js.toJsObj(doc)
        } else if (typeof payload === 'string' && payload.trim().startsWith('{') && payload.trim().endsWith('}')) {
            payload = payload.replace(/\r\n/g, '\n')
            payload = runDweeveScript(payload, {})
        }
        let t = typeof payload
        let result = innerRun (dwl, payload , vars, attributes)
        
        return result
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
        }

        let result = runDweeveScript(dwl, args)
        return beautify(result, null,2,100)
    }
    catch (err) {
        return err.message ? err.message : err
    }
}

function runDweeveScript(dwl, args) {
    coreFunctions.addFunctions(args)
    coreFunctions2.addFunctions(args)
    doScopeFunctions.addFunctions(args)
    selectorFunctions.addFunctions(args)

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    dwl = dwl.replace(/\r\n/g, '\n')
    dwl = strip(dwl)
    parser.feed(dwl.trim())

    if (parser.results.length === 0)
        throw "Dweeve parser found no (or somehow incomplete) dweeve!"
    if (parser.results.length > 1)
        throw "Dweeve parser found more than one intepretation of the dweeve!"

    const code = transpiler.transpile(parser.results[0])
    const script = new vm.Script(code.decs + '\n' + code.text + '\n var result=dweeve()')
    const context = new vm.createContext(args)
    script.runInContext(context)
    let result = context.result
    return result
}




export default { run: run}
