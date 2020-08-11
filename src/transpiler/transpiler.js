import {Dictionary} from 'dictionaryjs'
import HeaderFeatures from './transpiler-header-decs'
import ConditionalsFeatures from './transpiler-conditionals'
import FuncAndSelectorFeatures from './transpiler-funcs-and-selectors'
import ExpressionFeatures from './transpiler-expressions'
import DoScopeFeatures from './transpiler-do-scope'
import MathOpFeatures from './transpiler-math-op'

let codeGenFor = new Dictionary()

HeaderFeatures.addTranspilerFeatures(codeGenFor)
ConditionalsFeatures.addTranspilerFeatures(codeGenFor)
FuncAndSelectorFeatures.addTranspilerFeatures(codeGenFor)
ExpressionFeatures.addTranspilerFeatures(codeGenFor)
DoScopeFeatures.addTranspilerFeatures(codeGenFor)
MathOpFeatures.addTranspilerFeatures(codeGenFor)


function transpile(dweeve){

    let code = { text: ("dweeve = () => ( "), decs: '', lines: [], doScopes: [] }
    code.addCode = (text) => {
        code.text += text
        code.lines.push(text)
    }

    let context = {parentType : 'dweeve', node: dweeve, compiler: recursiveTranspile}
    recursiveTranspile(context, code)
    code.text+="\n);"

    return code
}

function recursiveTranspile(context, code) {
    let n = context.node
    if (n===undefined || n===null || n.type===undefined) return
    
    let goDeep = true

    let codeGen =codeGenFor[n.type]
    if (codeGen!==undefined) goDeep = codeGen(context, code)
    // if we have a token leaf node, do nothing, otherwise do some compiling!
    if (n.hasOwnProperty('text') && n.hasOwnProperty('value')) {
    } else if (goDeep) {
        for (var key in n) {
            if (key !=='type' && n.hasOwnProperty(key)) {
                let v = n[key]
                if (Array.isArray(v)) {
                    v.forEach(an => context.compiler({parentType: n.type, node: an, compiler:context.compiler}, code))
                } else {
                    context.compiler({parentType: n.type, node: v, compiler:context.compiler}, code)
                }
            }
        }
    }

}

export default { transpile: transpile}