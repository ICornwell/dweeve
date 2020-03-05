const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('test "as" operators', function() {
  it('simple number to string', function(done) {
        
    payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `
    var payload = 56
    ---
    payload as String
    `

    let exptected_result = `"56"`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('simple number to formatted string', function(done) {
        
  payload = ''
  let attributes = {};
  let vars = {};

  let dwl = `
  var payload = 56
  ---
  payload as String { format: "##.00"}
  `

  let exptected_result = `"56.00"`;

  let result = dweeve.run(dwl, payload, attributes, vars);
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

it('rename keys with "as" embedded', function(done) {
        
  payload = `{
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

  let attributes = {};
  let vars = {};

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
]`;

  let result = dweeve.run(dwl, payload, attributes, vars);
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});
}
)