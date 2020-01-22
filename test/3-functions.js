const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('Function definitions and calls', function() {

  it('define and call a simple function', function(done) {
        
    payload = { field1: "Bob", field2: "Jones"}

    let attributes = {};
    let vars = {};

    let dwl = `
    %dw 2.0
   
    fun toUser(obj) = {
      firstName: obj.field1,
      lastName: obj.field2
    }
    
    ---
    toUser(payload)
    `;

    let exptected_result = `
    {
      "firstName": "Bob",
      "lastName" : "Jones"
    }
    `;

    let result = dweeve.run(dwl, payload, attributes, vars);

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('call "inbuilt" isOdd function', function(done) {
        
  payload = { field1: "Bob", field2: "Jones"}

  let attributes = {};
  let vars = {};

  let dwl = `
  %dw 2.0
 
  ---
  { "x" : isOdd(7) }
  `;

  let exptected_result = `
  {
    "x" : true
  }
  `;

  let result = dweeve.run(dwl, payload, attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

it('call "inbuilt" concat function', function(done) {
        
  payload = { field1: "Bob", field2: "Jones"}

  let attributes = {};
  let vars = {};

  let dwl = `
  %dw 2.0
 
  ---
  { "x" : concat("a", "b") }
  `;

  let exptected_result = `
  {
    "x" : "ab"
  }
  `;

  let result = dweeve.run(dwl, payload, attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

it('call "inbuilt" concat function with special 2 param shorthand syntax', function(done) {
        
  payload = { field1: "Bob", field2: "Jones"}

  let attributes = {};
  let vars = {};

  let dwl = `
  %dw 2.0
 
  ---
  { "x" : "a" concat "b" }
  `;

  let exptected_result = `
  {
    "x" : "ab"
  }
  `;

  let result = dweeve.run(dwl, payload, attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

}
)