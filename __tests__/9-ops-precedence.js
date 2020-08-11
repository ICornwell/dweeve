import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('operators and precedence', function() {
  it('grammar tests', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
    var a = 1 + 2

    var b = 2 * 3 + 1

    var c = 1 + 2 * 3

    ---
    { a: a, b: b, c: c}
     `

    let exptected_result = `
    { "a": 3, "b": 7, "c": 7}
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()

   
})
})