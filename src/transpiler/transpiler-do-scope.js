import {Dictionary} from 'dictionaryjs'

let codeGenFor = new Dictionary()

codeGenFor['do-dweeve'] = (context, code) => { 
    let doDweeve = context.node
    let doCode = getSubCode(code)
    let doId = '__do'+code.doScopes.length
    code.doScopes.push( {[doId]: doCode})

    doCode.addCode('let doScope = () => (')
    context.compiler({node: doDweeve.dweeve, compiler:context.compiler}, doCode)
    doCode.addCode(')\n')

    let args=''
    if (context.argList!==undefined && context.argList!=null) {
        context.argList.forEach(arg => {
            if (arg!==null)
                args+=', ' + arg.value + ': '+arg.value
        })
    }

    code.addCode("__execDoScope(`\n" + doCode.decs + '\n' +doCode.text + '`, {payload: payload' + args + '} )')

    return false
 }

 
 
 function getSubCode(code)
{
    let subCode = {text: '', decs: '', lines: code.lines, doScopes: code.doScopes}
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
