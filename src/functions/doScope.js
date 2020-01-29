const vm = require('vm');

function __execDoScope(code, args) {
    const script = new vm.Script(code + '\n var result=doScope()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    return context.result
}

module.exports = { __execDoScope: __execDoScope};