import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'



it('date add', function(done) {
  let dwl = `
var payload = '2021-04-13'
---
dateAdd(payload, {months: 2})
`

let exptected_result = `"2021-06-13T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('date add days', function(done) {
  let dwl = `
var payload = '2021-02-25'
---
dateAddDays(payload, 5)
`

let exptected_result = `"2021-03-02T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('date add months', function(done) {
  let dwl = `
var payload = '2021-01-29'
---
dateAddMonths(payload, 1)
`

let exptected_result = `"2021-02-28T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('date add years', function(done) {
  let dwl = `
var payload = '2021-01-29'
---
dateAddYears(payload, 3)
`

let exptected_result = `"2024-01-29T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('days between added dates', function(done) {
  let dwl = `
var d1 = '2021-01-29'
var d2 = '2021-04-02'
---
daysBetween(dateAdd(d1, {days:30}), dateAddDays(d2, -1))
`

let exptected_result = `32`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

