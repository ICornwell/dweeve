const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;

describe('Set a default value', function() {
    it('should transform example 1 to example result 1', function(done) {
        let payload = {};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        output application/json
        ---

        (payload.someField default "my default value")
        `;

        let exptected_result = `
        "my default value"
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
        var myNullExample = { someField : null }
        output application/json
        ---

        (myNullExample.someField default "my default value")
        `;

        let exptected_result = `
        "my default value"
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result, JSON.parse(exptected_result), 'output does not match example');
        done();
    });
    it('should transform example 3 to example result 3', function(done) {
        let payload = {};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        var myVar = (1 + 1)
        output application/json
        ---
        if (myVar == 1) "value is odd"
        else "value is even"
        `;

        let exptected_result = `
        "value is even"
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result, JSON.parse(exptected_result), 'output does not match example');
        done();
    });
} )



