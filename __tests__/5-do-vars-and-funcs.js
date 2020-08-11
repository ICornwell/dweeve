import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Test do scopes', function() {
  it('var x = do...', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
      output application/json
      var myVar = do {
          var name = "dweeve"
          ---
          name
      }
      ---
      { result: myVar }
    `

    let exptected_result = `
    {
      "result": "dweeve"
    }
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('fun x() = do...', function(done) {
        
  let payload = ''

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  output application/json
  var myVar = do {
      var name = "dweeve"
      ---
      name
  }
  ---
  { result: myVar }
  `

  let exptected_result = `
  {
    "result": "dweeve"
  }
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('fun x(arg) = do...', function(done) {
        
  let payload = ''

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  output application/json
  fun test(p) = do {
      var a = "Foo" ++ p
      ---
      a
  }
  ---
  { result: test(" Bar") }
  `

  let exptected_result = `
  {
    "result": "Foo Bar"
  }
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)