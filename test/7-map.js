const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('Test map function', function() {
  it('simple map over an explicit array literal', function(done) {
        
    payload = ''

    let attributes = {};
    let vars = {};

    let dwl = `
    %dw 2.0
    output application/json

    ---
    ['a', 'b', 'c'] map ((v,i) -> (i + 1 + '_' + v))
     `;

    let exptected_result = `
    [ "1_a", "2_b", "3_c" ]
    `;

    let result = dweeve.run(dwl, payload, attributes, vars);

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('simple map over an extra-wrapped-list', function(done) {
  let attributes = {};
  let vars = {};

  let dwl = `
  %dw 2.0
  output application/json
  var payload = {"name":"bob","name":"jim","name":"john"}
  ---
  payload map ((v,k) -> ( {(v): k} ))
   `;

  let exptected_result = `
  [ {"bob": "name"}, {"jim": "name"},{"john": "name"}]
  `;

  let result = dweeve.run(dwl, '', attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

it('simple mapObject over an extra-wrapped-list', function(done) {
  let attributes = {};
  let vars = {};
  payload=`
  <?xml version='1.0' encoding='UTF-8'?>
  <prices>
      <basic>9.99</basic>
      <premium>53.01</premium>
      <vip>398.99</vip>
  </prices>
  `;
  let dwl = `
  %dw 2.0
  output application/xml
  ---
  {
      prices: payload.prices mapObject (value, key) -> {
          (key): (value + 5)
      }
  }
   `;

  let exptected_result = `
  {"prices" : {"basic":14.99, "premium":58.01, "vip":403.99}}
  `;

  let result = dweeve.run(dwl, payload, attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

}
)