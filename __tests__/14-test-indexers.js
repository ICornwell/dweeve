import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('test indexers', function() {
  it('simple numeric into array', function(done) {
        
    let payload = ''
    let attributes = {}
    let vars = {}

    let dwl = `
    var payload = [1,2,3,4,5,6,7]
    ---
    payload[4]`
    let exptected_result = `5`

    let result = dweeve.run(dwl, payload, attributes, vars)
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('complex into array', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `
  var payload = [1,2,3,4,5,6,7]
   
  var a=2
  ---
  payload[a+1]`
  let exptected_result = `4`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('complex into array  (fiddly)', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `
  var payload = [1,2,3,4,5,6,7]
   
  var a=2
  ---
  payload[2 + 2 * 1 + 2 + 1 -5 + 1]`
  let exptected_result = `4`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})


it('indexer as dynamic key', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `
  var payload = { "items" : {"some" : {"name":"ian","age":49}, "other" : {"name":"jim","age":60} } }
   
  var mykey = 'other'
  ---
  payload.items[(mykey)].age`
  let exptected_result = `60`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)