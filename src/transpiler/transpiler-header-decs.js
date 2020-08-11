import {Dictionary} from 'dictionaryjs'

let codeGenFor = new Dictionary()

codeGenFor['var-dec'] = (context, code) => { 
    let op = context.node
    let decCode = getSubCode(code)
    decCode.addCode('var ' + op.varName + ' = ')
    context.compiler({node: op.varVal, compiler:context.compiler}, decCode)
    decCode.addCode(';\n')
    code.decs+=decCode.text
    return false
 }

 codeGenFor['fun-def'] = (context, code) => { 
    let op = context.node
    let decCode = getSubCode(code)
   
    decCode.addCode('\n function ' + op.func.value +'(')
    if (op.args!==null && Array.isArray(op.args)) {
        let idx=1
        op.args.forEach(arg => {
            if (arg!==null) {
                decCode.addCode(arg.value)
                if (idx++<op.args.length)
                    decCode.addCode(', ')
            }
        })
    }
    decCode.addCode(') { return ( \n')
    context.compiler({node: op.body, compiler:context.compiler, argList: op.args}, decCode)
    decCode.addCode(' ) }\n')
    code.decs+=decCode.text
    
    return false
 }
 
 function getSubCode(code)
{
    let subCode = {text: '', lines: code.lines, doScopes: code.doScopes}
    subCode.addCode = (text) => {
        subCode.text += text
        subCode.lines.push(text)
    }
    return subCode
}

function addTranspilerFeatures(preDict) {
    for (let k in codeGenFor)
        preDict[k]=codeGenFor[k]
     
}

export default {addTranspilerFeatures : addTranspilerFeatures}
