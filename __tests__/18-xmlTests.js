import xml2js from '../lib/exe/xmldom2jsobj'
import beautify from '../lib/exe/beautify'

import {DOMParser} from 'xmldom'


describe('XmltoJsObj', function() {
    it('simpleXml', function(done) {
            let xml="<users><user>bob</user><user>jane</user></users>"
            
            var doc = new DOMParser().parseFromString(xml)

            let r = xml2js.toJsObj(doc)

            const prettyJ = beautify(r, null, 1, 200)

            const exp = '{ "users": { "user": "bob", "user": "jane" } }'
            
            expect(prettyJ).toBe(exp)

            done()
    }
    )

    it('Xml with document header', function(done) {
        let xml=`<?xml version='1.0' encoding='UTF-8'?>
        <prices>
          <basic>14.99</basic>
          <premium>53.01</premium>
          <vip>398.99</vip>
        </prices>`
        
        var doc = new DOMParser().parseFromString(xml)

        let r = xml2js.toJsObj(doc)

        const prettyJ = beautify(r, null, 1, 200)

        const exp = "{ \"prices\": { \"basic\": 14.99, \"premium\": 53.01, \"vip\": 398.99 } }"
        
        expect(prettyJ).toBe(exp)

        done()
    }
    )
}

)