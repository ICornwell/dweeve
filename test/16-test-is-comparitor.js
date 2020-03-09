const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('test "is" comparisons', function() {
  it('array is arrat', function(done) {
        
    payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `
    [1,2,3] is Array
    `

    let exptected_result = `true`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('object is an object', function(done) {
        
  payload = ''
  let attributes = {};
  let vars = {};

  let dwl = `
  {"test": "test"} is Object
  `

  let exptected_result = `true`;

  let result = dweeve.run(dwl, payload, attributes, vars);
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

it('string is string', function(done) {
        
  payload = ``

  let attributes = {};
  let vars = {};

  let dwl = `"bob" is String `

  let exptected_result = `true`;

  let result = dweeve.run(dwl, payload, attributes, vars);
  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});
}
)