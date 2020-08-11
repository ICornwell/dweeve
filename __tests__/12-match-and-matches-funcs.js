import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('match and matches as functions', function() {
  it('simple match', function(done) {
        
    let payload = ''
    let attributes = {}
    let vars = {}

    let dwl = `"me@mulesoft.com" match (/([a-z]*)@([a-z]*).com/)`
    let exptected_result = `["me@mulesoft.com", "me", "mulesoft"]`

    let result = dweeve.run(dwl, payload, attributes, vars)
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})



}
)