import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Test add functions', function() {
  it('add two arrays', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    
    ['a', 'b', 'c'] ++ ['e', 'f', 'g']
     `

    let exptected_result = `
    ["a", "b", "c", "e", "f", "g"]
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('add two scalars', function(done) {
  let attributes = {}
  let vars = {}

  let dwl = `
   12 + 17
   `

  let exptected_result = `
  29
  `

  let result = dweeve.run(dwl, '', attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('add two objects', function(done) {
  let attributes = {}
  let vars = {}
  let payload = `
  
  `
  let dwl = `
 
  {"a":"abc", "b": "bbc"} ++ {"c": "ccc", "d": "lll"}
   `

  let exptected_result = `
  {"a":"abc", "b": "bbc", "c": "ccc", "d": "lll"}
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('add object and kvp', function(done) {
  let attributes = {}
  let vars = {}
  let payload = `
  
  `
  let dwl = `
 
  {"a":"abc", "b": "bbc"} ++ ("c": "lll")
   `

  let exptected_result = `
  {"a":"abc", "b": "bbc", "c": "lll"}
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)