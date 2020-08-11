import dweeve from './src/exe/dweeve'

function dwrun (dwl, payload, vars, attributes) {
    return dweeve.run(dwl, payload, vars, attributes)
}

export default dwrun;