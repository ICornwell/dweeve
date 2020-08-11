import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('core2 function tests', function() {
  it('reduce numbers', function(done) {
        
    let payload = ''
    let attributes = {}
    let vars = {}

    let dwl = `[2, 3] reduce ($ + $$)`
    let exptected_result = `5`

    let result = dweeve.run(dwl, payload, attributes, vars)
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('reduce numbers with init', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `[2, 3] reduce (v, acc = 3)->(v + acc)`
  let exptected_result = `8`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('oderBy letters', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `%dw 2.0
  output application/json
  ---
  [{ letter: "e" }, { letter: "d" }] orderBy($.letter)`
  let exptected_result = `[ {"letter": "d"}, {"letter": "e"}]`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('oderBy numbers, reversed', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `%dw 2.0
  output application/json
  ---
  orderDescending: ([3,8,1] orderBy -$)`
  let exptected_result = `{ "orderDescending": [8,3,1] }`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)