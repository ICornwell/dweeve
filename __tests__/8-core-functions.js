import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Test core functions a-f function', function() {

  it('core function filterObject ', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
output application/xml
var l=[-2,0,3,6,10, 8.7]
---
{

  filterObj: {"a" : "apple", "b" : "banana"} filterObject ((value) -> value == "apple")

}
     `


    let exptected_result = `
    {

      "filterObj": { "a": "apple" }


    }
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})


  it('core function calls a - f', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
output application/xml
var l=[-2,0,3,6,10, 8.7]
---
{
    a: abs(l[0]),
    b: avg(l),
	c: ceil(l[5]),
	d: l contains (3),
	e: l contains (56),
	ew: 'hello' endsWith 'lo',
	days : daysBetween('2016-10-01T23:57:59-03:00', '2017-10-01T23:57:59-03:00'),
	distinct: [0, 1, 2, 3, 3, 2, 1, 4] distinctBy (value) -> { "unique" : value },
	filter: [9,2,3,4,5] filter (value, index) -> (value > 2),
  filterObj: {"a" : "apple", "b" : "banana"} filterObject ((value) -> value == "apple"),
  finda: ["Bond", "James", "Bond"] find "Bond",
  findb: "I heart DataWeave" find /\\w*ea\\w*(\\b)/,
  findc: "aabccdbce" find "a",
  flatmap: [ [3,5], [1.9,5.5] ] flatMap (value, index) -> value,
  flatten: flatten([ [2.0, 0], [1,1], [2,3], [5,8] ]),
  floor: [ floor(1.5), floor(2.2), floor(3) ]
}
     `

    let exptected_result = `
    {
      "a": 2,
      "b": 4.283333333333333,
      "c": 9,
      "d": true,
      "e": false,
      "ew": true,
      "days": 365,
      "distinct": [ 0, 1, 2, 3, 4 ],
      "filter": [ 9, 3, 4, 5 ],
      "filterObj": { "a": "apple" },
      "finda": [0,2],
      "findb": [ [2,7], [8,17] ],
      "findc" : [0,1],
      "flatmap" : [ 3, 5, 1.9, 5.5],
      "flatten" : [ 2, 0, 1, 1, 2, 3, 5, 8 ],
      "floor": [ 1, 2, 3]

    }
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('simple map over an extra-wrapped-list', function(done) {
  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  output application/json
  var payload = {"name":"bob","name":"jim","name":"john"}
  ---
  payload map ((v,k) -> ( {(v): k} ))
   `

  let exptected_result = `
  [ {"bob": "name"}, {"jim": "name"},{"john": "name"}]
  `

  let result = dweeve.run(dwl, '', attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('simple mapObject over an extra-wrapped-list', function(done) {
  let attributes = {}
  let vars = {}
  let payload = `
  <?xml version='1.0' encoding='UTF-8'?>
  <prices>
      <basic>9.99</basic>
      <premium>53.01</premium>
      <vip>398.99</vip>
  </prices>
  `
  let dwl = `
  %dw 2.0
  output application/xml
  ---
  {
      prices: payload.prices mapObject (value, key) -> {
          (key): (value + 5)
      }
  }
   `

  let exptected_result = `
  {"prices" : {"basic":14.99, "premium":58.01, "vip":403.99}}
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)