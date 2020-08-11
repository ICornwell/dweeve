import xml2js from '../src/exe/xmldom2jsobj'
import chai from 'chai'
import {DOMParser} from 'xmldom'

describe('XmltoJsObj', function() {
    it('simpleXml', function(done) {
            let xml="<users><user>bob</user><user>jane</user></users>"
            
            var doc = new DOMParser().parseFromString(xml)

            let r = xml2js.toJsObj(doc)

            console.log(JSON.stringify(r))
            let f = { a___1: 'g', b: 'g', a___2:'f'}

            let r1 = f[Object.keys(f).find(k=>(k==='a' || k.startsWith('a'+'__')))]

            done()
    }
    )
}

)