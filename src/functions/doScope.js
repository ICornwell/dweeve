import vm from 'vm'
import selectorFunctions from '../functions/selectors'
import coreFunctions from '../functions/core' 
 

function addFunctions(context) {
    context['__execDoScope'] = __execDoScope
}

function __execDoScope(code, args) {
    const script = new vm.Script(code + '\n var result=doScope()')
    coreFunctions.addFunctions(args)
    addFunctions(args)
    selectorFunctions.addFunctions(args)
    const context = new vm.createContext(args)
    script.runInContext(context)

    return context.result
}

export default { __execDoScope: __execDoScope, addFunctions: addFunctions};