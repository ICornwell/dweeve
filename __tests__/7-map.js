import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Test map function', function() {
  it('simple map over an explicit array literal', function(done) {
        
    let payload = ''

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
    output application/json

    ---
    ['a', 'b', 'c'] map ((v,i) -> (i + 1 + '_' + v))
     `

    let exptected_result = `
    [ "1_a", "2_b", "3_c" ]
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
  let payload=`
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

it('map - rename keys', function(done) {
  let attributes = {}
  let vars = {}
  let payload = `
  {
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
  }
  `
  let dwl = `
  %dw 2.0
output application/json
---
payload.flights map (flight) -> {
    (flight mapObject (value, key) -> {
        (emptySeats: value) if(key  == 'availableSeats'),
        (airline: value) if(key  == 'airlineName'),
        ((key):value) if(key !='availableSeats' and key  != 'airlineName')
    })
}
   `

  let exptected_result = `
  [
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
  ]
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('map - multiple use of key maps', function(done) {
  let attributes = {}
  let vars = {}
  let payload = `
  {
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
  }
  `
  let dwl = `
  %dw 2.0
output application/json
---
payload.flights map (flight) -> {
    (flight mapObject (value, key) -> {
        (key+'__extra'): value,
        (key+'__other'): value
    })
}
   `

  let exptected_result = `
  [
    {
      "availableSeats__extra":45,
      "availableSeats__other":45,
      "airlineName__extra": "Ryan Air",
      "airlineName__other": "Ryan Air",
      "aircraftBrand__extra": "Boeing",
      "aircraftBrand__other": "Boeing",
      "aircraftType__extra": "737",
      "aircraftType__other": "737",
      "departureDate__extra": "12/14/2017",
      "departureDate__other": "12/14/2017",
      "origin__extra": "BCN",
      "origin__other": "BCN",
      "destination__extra": "FCO",
      "destination__other": "FCO"
    },
    {
      "availableSeats__extra":15,
      "availableSeats__other":15,
      "airlineName__extra": "Ryan Air",
      "airlineName__other": "Ryan Air",
      "aircraftBrand__extra": "Boeing",
      "aircraftBrand__other": "Boeing",
      "aircraftType__extra": "747",
      "aircraftType__other": "747",
      "departureDate__extra": "08/03/2017",
      "departureDate__other": "08/03/2017",
      "origin__extra": "FCO",
      "origin__other": "FCO",
      "destination__extra": "DFW",
      "destination__other": "DFW"
    }
  ]
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

}
)
