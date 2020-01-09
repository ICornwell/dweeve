const dweeve = require("../src/exe/dweeve.js");
var chai = require('chai');
var assert = chai.assert;

describe('Extract-Data', function() {
    it('extract named item from object and array vars', function(done) {
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

        
        assert.equal(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract value from var by key return in object with a key', function(done) {
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

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract value from values from xml', function(done) {
        let payload = `
        <users>
            <user>Mariano</user>
        </users>
        `;
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.users
        `;

        let exptected_result = `
        {
            "user": "Mariano"
          }
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract simple value from values from payload with .', function(done) {
        let payload = { myObj : {
            item1: "bob",
            item2: "jim",
            item3: "jane"
        }};
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item2
        `;

        let exptected_result = `
        "jim"
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract simple value from values from payload array with .', function(done) {
        let payload = { myObj :  [
            { item1: "bob"},
            { item2: "jim" },
            { item3: "jane"}
            ]
        };
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item2
        `;

        let exptected_result = `
        [ "jim" ]
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract multiple values from values from payload array with .', function(done) {
        let payload = { myObj :  [
            { item1: "bob"},
            { item2: "jim" },
            { item1: "jane"}
            ]
        };
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item1
        `;

        let exptected_result = `
        [ "bob", "jane" ]
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });

    it('extract multiple objects from values from payload array with .', function(done) {
        let payload = { };
        let attributes = {};
        let vars = {};

        let dwl = `
        %dw 2.0
        var myData = {
        "people": [
            {
            "person": {
                "name": "Nial",
                "address": {
                "street": {
                    "name": "Italia",
                    "number": 2164
                },
                "area": {
                    "zone": "San Isidro",
                    "name": "Martinez"
                }
                }
            }
            },
            {
            "person": {
                "name": "Coty",
                "address": {
                "street": {
                    "name": "Monroe",
                    "number": 323
                },
                "area": {
                    "zone": "BA",
                    "name": "Belgrano"
                }
                }
            }
            }
        ]
        }
        output application/json
        ---
        myData.people.person.address.street
        `;

        let exptected_result = `
        [
            {
              "name": "Italia",
              "number": 2164
            },
            {
              "name": "Monroe",
              "number": 323
            }
          ]
        `;

        let result = dweeve.run(dwl, payload, attributes, vars);

        assert.deepEqual(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example');
        done();
    });
} )
