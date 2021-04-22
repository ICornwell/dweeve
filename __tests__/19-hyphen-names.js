import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Hyphen Names', function() {
    it('extract named item from object and array vars', function(done) {
        let payload = {
            "contractInsured": {
                "org-fullNam": "dsfdsf",
                "org-__timeStamp": 1619095368657
            }
        }
        
        let attributes = {}
        let vars = {}

        let dwl = `
        var insured = payload.contractInsured
        ---
        { 
            "name": "bind",
            "run": insured["org-fullName"],
        }
        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, '{ "name": "bind" }', 'output does not match example')
    //    assert.equal(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example')
        done()
    })
})

