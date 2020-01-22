const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;
var dwassert = require('./dwassert');

describe('Test Lambda expressions', function() {
  it('simple lambda var return kvp obj', function(done) {
        
    payload = { field1: "Bob", field2: "Jones"}

    let attributes = {};
    let vars = {};

    let dwl = `
    %dw 2.0
    var myLambda = (a,b)-> { (a) : b}
    ---
    myLambda("key","value")
     `;

    let exptected_result = `
    {
      "key": "value"
    }
    `;

    var myLambda = (a, b) => ({[a]: b});

    dd = () => ( myLambda("key", "value"));
    var r=dd()

    let result = dweeve.run(dwl, payload, attributes, vars);

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done();
});

it('simple lambda var return simple value', function(done) {
        
  payload = { field1: "Bob", field2: "Jones"}

  let attributes = {};
  let vars = {};

  let dwl = `
  %dw 2.0
  var myLambda = (a,b)-> (a+b)
  ---
  { x: myLambda(3, 4) }
   `;

  let exptected_result = `
  {
    "x": 7
  }
  `;

  let result = dweeve.run(dwl, payload, attributes, vars);

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done();
});

}
)