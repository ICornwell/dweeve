const dweeve = require('./src/exe/dweeve')

exports.dwrun = function(dwl, payload, vars, attributes) {
    dweeve.run(dwl, payload, vars, attributes)
}