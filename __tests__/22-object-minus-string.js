import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'



it('object minus string literal', function(done) {
  let dwl = `
var payload = { "a": 1, "b": 2, "c": 3}
---
payload - "c"
`

let exptected_result = `{ "a": 1, "b": 2}`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('basic minus with numbers', function(done) {
  let dwl = `

---
45 - 23
`

let exptected_result = `22`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('dynamic objects minus string literal', function(done) {
  let dwl = `
var o1 = { "a": 1, "b": 2, "c": 3}
var o2 = { "d": 4, "e": 5, "f": 6}
---
{ (o1 - "c" - "b"),
  (o2 - "e")
 }
`

let exptected_result = `{ "a": 1, "d": 4, "f": 6}`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})



