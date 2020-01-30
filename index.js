const dweeve = require('./src/exe/dweeve')

function dwrun (dwl, payload, vars, attributes) {
    return dweeve.run(dwl, payload, vars, attributes)
}

module.exports = dwrun;