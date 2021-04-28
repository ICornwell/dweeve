import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('test "as" operators', function() {
  it('simple number to string', function(done) {
        
    let payload = ''
    let attributes = {}
    let vars = {}

    let dwl = `
    var payload = 56
    ---
    payload as String
    `

    let exptected_result = `"56"`

    let result = dweeve.run(dwl, payload, attributes, vars)
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})


  it('string to number', function(done) {
       let dwl = `
    var payload = '45'
    ---
    payload as Number
    `

    let exptected_result = `45`

    let result = dweeve.run(dwl, '', {}, {})
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('string to bool', function(done) {
  let dwl = `
var payload = 'True'
---
payload as Boolean
`

let exptected_result = `true`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('string to date', function(done) {
  let dwl = `
var payload = '2021-04-13'
---
payload as Date
`

let exptected_result = `"2021-04-13T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('string to string via dateAdd', function(done) {
  let dwl = `
var payload = '2021-04-13'
---
dateAdd(payload as Date , {days: 7}) as String
`

let exptected_result = `"TueApr20202101:00:00GMT+0100(BritishSummerTime)"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('string to date via dateAdd', function(done) {
  let dwl = `
var payload = '2021-04-13'
---
dateAdd(payload as Date , {days: 7})
`

let exptected_result = `"2021-04-20T00:00:00.000Z"`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

it('string to date to number', function(done) {
  let dwl = `
var payload = '2021-04-13'
---
payload as Date as Number
`

let exptected_result = `1618272000000`

let result = dweeve.run(dwl, '', {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})



it('simple number to formatted string', function(done) {
        
  let payload = ''
  let attributes = {}
  let vars = {}

  let dwl = `
  var payload = 56
  ---
  payload as String { format: "##.00"}
  `

  let exptected_result = `"56.00"`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('rename keys with "as" embedded', function(done) {
        
  let payload = `{
    "flights":[
    {
    "availableSeats":45,
    "airlineName":"Ryan Air",
    "aircraftBrand":"Boeing",
    "aircraftType":"737",
    "departureDate":"12/14/2017",
    "origin":"BCN",
    "destination":"FCO"
    },
    {
    "availableSeats":15,
    "airlineName":"Ryan Air",
    "aircraftBrand":"Boeing",
    "aircraftType":"747",
    "departureDate":"08/03/2017",
    "origin":"FCO",
    "destination":"DFW"
    }]
  }`

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
output application/json
---
payload.flights map (flight) -> {
    (flight mapObject (value, key) -> {
        (emptySeats: value) if(key as String == 'availableSeats'),
        (airline: value) if(key as String == 'airlineName'),
        ((key):value) if(key as String !='availableSeats' and key as String != 'airlineName')
    })
}
  `

  let exptected_result = `[
  {
    "emptySeats": 45,
    "airline": "Ryan Air",
    "aircraftBrand": "Boeing",
    "aircraftType": "737",
    "departureDate": "12/14/2017",
    "origin": "BCN",
    "destination": "FCO"
  },
  {
    "emptySeats": 15,
    "airline": "Ryan Air",
    "aircraftBrand": "Boeing",
    "aircraftType": "747",
    "departureDate": "08/03/2017",
    "origin": "FCO",
    "destination": "DFW"
  }
]`

  let result = dweeve.run(dwl, payload, attributes, vars)
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})
}
)