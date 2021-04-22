import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Hyphen Names', function() {
    it('extract named item from object and array vars', function(done) {
        let payload = {
            "contractInsured": {
                "id": "286aa161-3f24-4eba-b1f6-134b7b5c79f5",
                "__timeStamp": 1619095368657,
                "__entityId": "22b5db5d-8866-4a81-8cb4-3111893dc676",
                "org-id": "5d203efd-fd02-4ded-a5f2-8c6f5d5df4b7",
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
            "run": payload.contractInsured["org-fullName"],
            "view": "motor~motor-renewal-initialisation",
            "viewVersion": "1.1.0",
            "parameters": {
                "dataType": "performanceHistory",
                "goal": 24,
                "deadline": 48,
                "team": "claimsTeam",
                // "extraParams": [] PEGA facing issue with empty array
            }
        }

        `

        let result = dweeve.run(dwl, payload, attributes, vars)

        dwassert.equalwows(result, exptected_result, 'output does not match example')
    //    assert.equal(result.replace(/\s/g,''), exptected_result.replace(/\s/g,''), 'output does not match example')
        done()
    })
})

