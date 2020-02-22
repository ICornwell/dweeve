const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('Test not and bang(!) functions', function() {
  it('low precedence "not"', function(done) {
        
    payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `{"r": not 3 == 4}`;
    let exptected_result = `{"r":true}`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('not with and and or', function(done) {
  payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `{"r":not true and false or true}`;
    let exptected_result = `{"r":false}`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('bang with and and or', function(done) {
  payload = ''
    let attributes = {};
    let vars = {};

    let dwl = `{"r":!false or true}`;
    let exptected_result = `{"r":true}`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('bang with dot', function(done) {
  payload = '{"a":true}'
    let attributes = {};
    let vars = {};

    let dwl = `{"r":!payload.a}`;
    let exptected_result = `{"r":false}`;

    let result = dweeve.run(dwl, payload, attributes, vars);
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

}
)