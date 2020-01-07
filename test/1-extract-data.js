const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;

describe('Extract-Data', function() {
    it('should transform example 1 to example result 1', function(done) {
        let payload = {};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        var myObject = { "myKey" : "1234", "name" : "somebody" }
        var myArray = [ { "myKey" : "1234" }, { "name" : "somebody" } ]
        output application/json
        ---
        {
            selectingValueUsingKeyInObject : myObject.name,
            selectingValueUsingKeyOfObjectInArray : myArray.name,
        }
        `;

        let exptected_result = `
        {
            "selectingValueUsingKeyInObject": "somebody",
            "selectingValueUsingKeyOfObjectInArray": [ "somebody" ]
        }
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result, JSON.parse(exptected_result), 'output does not match example');
        done();
    });

    it('should transform example 2 to example result 2', function(done) {
        let payload = {};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        var myObject = { user : "a" }
        output application/json
        ---
        { myObjectExample : myObject.user }
        `;

        let exptected_result = `
        { "myObjectExample": "a" }
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result, JSON.parse(exptected_result), 'output does not match example');
        done();
    });

    
} )
