const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('core2 function tests', function() {
  it('reduce numbers', function(done) {
        
    payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `[2, 3] reduce ($ + $$)`;
    let exptected_result = `5`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('reduce numbers with init', function(done) {
        
  payload = ''
  let attributes = {};
  let vars = {};

  let dwl = `[2, 3] reduce (v, acc = 3)->(v + acc)`;
  let exptected_result = `8`;

  let result = dweeve.run(dwl, payload, attributes, vars);
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

}
)