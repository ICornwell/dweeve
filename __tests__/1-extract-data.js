import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Extract-Data', function() {
    it('extract named item from object and array vars', function(done) {
        let payload = {}
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        var myObject = { "myKey" : "1234", "name" : "somebody" }
        var myArray = [ { "myKey" : "1234" }, { "name" : "somebody" } ]
        output application/json
        ---
        {
            selectingValueUsingKeyInObject : myObject.name,
            selectingValueUsingKeyOfObjectInArray : myArray.name
        }
        `

        let exptected_result = `
        {
            "selectingValueUsingKeyInObject": "somebody",
            "selectingValueUsingKeyOfObjectInArray": [ "somebody" ]
        }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
    //    assert.equal(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example')
        done()
    })

    it('extract value from var by key return in object with a key', function(done) {
        let payload = {}
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        var myObject = { user : "a" }
        output application/json
        ---
        { myObjectExample : myObject.user }
        `

        let exptected_result = `
        { "myObjectExample": "a" }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract value from values from xml', function(done) {
        let payload = `
        <users>
            <user>Mariano</user>
        </users>
        `
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.users
        `

        let exptected_result = `
        {
            "user": "Mariano"
          }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract simple value from values from payload with .', function(done) {
        let payload = { myObj : {
            item1: "bob",
            item2: "jim",
            item3: "jane"
        }}
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item2
        `

        let exptected_result = `
        "jim"
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract simple value from values from payload array with .', function(done) {
        let payload = { myObj :  [
            { item1: "bob"},
            { item2: "jim" },
            { item3: "jane"}
            ]
        }
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item2
        `

        let exptected_result = `
        [ "jim" ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
       done()
    })

    it('extract multiple values from values from payload array with .', function(done) {
        let payload = { myObj :  [
            { item1: "bob"},
            { item2: "jim" },
            { item1: "jane"}
            ]
        }
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---
        payload.myObj.item1
        `

        let exptected_result = `
        [ "bob", "jane" ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract multiple objects from values from payload array with .', function(done) {
        let payload = { }
        let attributes = {}
        let vars = {}

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
        `

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
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from mixed cpntent Xml', function(done) {
        let payload = `
        <users>
            <user someatttr= "boo">a<inner anAttr="bar">innertest</inner></user>
            <user>b</user>
            <user>c</user>
        </users>
        `
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        output application/json
        ---

        payload.users
        `

        let exptected_result = `
        {
            "user": {
              "__text": "a",
              "inner": "innertest"
            },
            "user": "b",
            "user": "c"
          }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from mixed content Xml, first value only with .', function(done) {
        let payload = `
        <users>
            <user someatttr= "boo">a<inner anAttr="bar">innertest</inner></user>
            <user>b</user>
            <user>c</user>
        </users>
        `
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        output application/json
        ---

        payload.users.user
        `

        let exptected_result = `
        {
            "__text": "a",
            "inner": "innertest"
        }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from mixed content Xml, all values with .*', function(done) {
        let payload = `
        <users>
            <user someatttr= "boo">b<inner anAttr="bar">innertest</inner></user>
            <user>b</user>
            <user>c</user>
        </users>
        `
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        output application/json
        ---

        payload.users.*user
        `

        let exptected_result = `
        [
            {
              "__text": "b",
              "inner": "innertest"
            },
            "b",
            "c"
          ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from json (non-unique keys), all values with .*', function(done) {
        
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        var payload = { "users" : {
            "user": {"name":"a"},
            "user": {"name":"b"},
            "user": {"name":"c"}
            }
          }

        output application/json
        ---

        payload.users.*user
        `

        let exptected_result = `
        [
            {
              "name": "a"
            },
            {
              "name": "b"
            },
            {
              "name": "c"
            }
          ]
        `

        let result = dweeve.run(dwl, '', attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })
yarn 
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        var payload = { "users" : [
            { "user" : "a"},
            { "user" : "b"},
            { "user" : "c"}
            ]
            }

        output application/json
        ---

        payload.users.*user
        `

        let exptected_result = `
        [
            "a",
            "b",
            "c"
          ]
        `

        let result = dweeve.run(dwl, '', attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from json all values with ..*', function(done) {
        
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        var payload = { "users" : {
            "user": {"name":"a"},
            "user": {"name":"b"},
            "user": {"name":"c"}
            }
          }

        output application/json
        ---

        payload.users..*name
        `

        let exptected_result = `
        [
            "a",
            "b",
            "c"
          ]
        `

        let result = dweeve.run(dwl, '', attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from json all values with ..* - this example fails in dataweave 2.0 - works as expected here', function(done) {
        
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        var payload = { "users" : {
            "user": {"name":"a"},
            "user": {"name":"b"},
            "user": {"name":"c", "name":"d"}
            }
          }

        output application/json
        ---

        payload.users..*name
        `

        let exptected_result = `
        [
            "a",
            "b",
            "c",
            "d"
          ]
        `

        let result = dweeve.run(dwl, '', attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from json all values with ..* - order is important -down befor in 2.0!', function(done) {
        
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0

        var payload = { "users" : {
            "user": {"name":"a"},
            "user": {"name":"b"},
            "user": {"name":"c"},
            "name":"d"
            }
          }

        output application/json
        ---

        payload.users..*name
        `

        let exptected_result = `
        [
            "d",
            "a",
            "b",
            "c"
          ]
        `

        let result = dweeve.run(dwl, '', attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract from xml all values with ..* ', function(done) {
        let payload = `<users>
                        <user someatttr= "boo">b<inner anAttr="bar">innertest</inner></user>
                        <user>b</user>
                        <user>c</user>
                    </users>`
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---

        payload..*user
        `

        let exptected_result = `
        [
            {
              "__text": "b",
              "inner": "innertest"
            },
            "b",
            "c"
          ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract all from xml with depth all values with ..* ', function(done) {
        let payload = `<users>
                        <user>a</user>
                        <user>b</user>
                        <user>c</user>
                        <deep>
                            <user>d</user>
                        </deep>
                    </users>`
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---

        payload..*user
        `

        let exptected_result = `
        [
            "a",
            "b",
            "c",
            "d"
          ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })

    it('extract firsts from xml with depth all values with .. ', function(done) {
        let payload = `<users>
                        <user>a</user>
                        <user>b</user>
                        <user>c</user>
                        <deep>
                            <user>d</user>
                        </deep>
                    </users>`
        let attributes = {}
        let vars = {}

        let dwl = `
        %dw 2.0
        output application/json
        ---

        payload..user
        `

        let exptected_result = `
        [
            "a",
            "d"
          ]
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
        done()
    })
} )
