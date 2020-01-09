const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;

describe('Set a default value', function() {
    it('simple default for undefined payload key', function(done) {
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

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });
    it('simple default for null var object key value', function(done) {
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

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });
    it('default value set from an "if" statement', function(done) {
        let payload = {};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        var myVar = (1 + 1)
        output application/json
        ---
        if (isOdd(myVar)) "value is odd"
        else "value is even"
        `;

        let exptected_result = `
        "value is even"
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });
} )



