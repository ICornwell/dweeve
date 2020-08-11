import dweeve from '../src/exe/dweeve.js'

import dwassert from '../__asserts__/dwassert'
import strip from 'strip-comments'

import corefuncs from '../src/functions/core.js'

describe('Test Lambda expressions', function() {
  it('simple lambda var return kvp obj', function(done) {
        
    let payload = { field1: "Bob", field2: "Jones"}

    let attributes = {}
    let vars = {}

    let dwl = `
    %dw 2.0
    var myLambda = (a,b)-> { (a) : b}
    ---
    myLambda("key","value")
     `

    let exptected_result = `
    {
      "key": "value"
    }
    `
    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

it('simple lambda var return simple value', function(done) {
        
  let payload = { field1: "Bob", field2: "Jones"}

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  var myLambda = (a,b)-> (a+b)
  ---
  { x: myLambda(3, 4) }
   `

  let exptected_result = `
  {
    "x": 7
  }
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('anonymous lambda var with $, $$', function(done) {
        
  let payload = { field1: "Bob", field2: "Jones"}

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  fun filt(data) = data filter ($ = "abc")
  ---
  filt( {"a":"abc", "b":"def"})
   `

  let exptected_result = `
  [ "abc" ]
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('anonymous lambda var with $, $$, deep matching', function(done) {
        
  let payload = { field1: "Bob", field2: "Jones"}

  let attributes = {}
  let vars = {}

  let dwl = `
  %dw 2.0
  fun filt(data) = data filter ($.x = "abc")
  ---
  filt( {"a":{"x":"abc", "y":"xyz"}, "b":{"x":"def", "y":"lmn"}})
   `

  let exptected_result = `
  [ {"x":"abc", "y":"xyz"} ]
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})

it('interesting recursive filtering and resource usings code', function(done) {
        
  let payload = `
  {
    "command":{
      "version":"1.0.0",
      "user":"ian",
      "commandDate":"2019-10-20T11:15:30",
      "response":[
        {
          "object":{
            "type":"policyHeader",
            "schema":"policyHeader",
            "schemaVersion":"1.0.0",
            "commandId":"PH001",
            "content":{
              "polifcyRef":"xyz-124",
              "inceptionDate":"2019-11-01T00:00:00",
              "expiryDate":"2020-10-31T23:59:59"
            }
          }
        },
        {
          "object":{
            "type":"customer",
            "schema":"customer",
            "schemaVersion":"1.0.0",
            "commandId":"CU001",
            "content":{
              "extRef":"sf00001abc"
            }
          }
        },
        {
          "object":{
            "type":"broker",
            "schema":"broker",
            "schemaVersion":"1.0.0",
            "commandId":"BR001",
            "content":{
              "brokerRef":"br00111"
            }
          }
        },
        {
          "object":{
            "type":"coverage",
            "schema":"coverage",
            "schemaVersion":"1.0.0",
            "commandId":"CV001",
            "content":{
              "coverageRef":"covRef00111"
            }
          }
        },
        {
          "object":{
            "type":"insuredObject",
            "schema":"insuredObject",
            "schemaVersion":"1.0.0",
            "commandId":"IO001",
            "content":{
              "insuredType":"motor",
              "make":"Ford",
              "model":"Fiesta",
              "engine": "2.0"
            }
          }
        },
        {
          "object":{
            "type":"insuredObject",
            "schema":"insuredObject",
            "schemaVersion":"1.0.0",
            "commandId":"IO002",
            "content":{
              "insuredType":"property",
              "description":"office",
              "fire":"yes"
            }
          }
        },
        {
          "relation":{
            "from":"PH001",
            "to":"CU001",
            "rType":"belongsTo"
          }
        },
        {
          "relation":{
            "from":"CU001",
            "to":"PH001",
            "rType":"hasPolicy"
          }
        }
      ]
    }
  }`

  let rf = `{
    "view":{
      "name":"motorPolicy-quote",
      "version":"1.0.0",
      "viewStyle":"hierarchy",
      "viewElement":{
        "object":"policyHeader",
        "elementRef":"PH001",
        "childObjects":[
          {
            "viewElement":{
              "object":"customer",
              "elementRef":"CU001",
              "multiplicity":"single",
              "relationFromParent":"belongsTo",
              "relationToParent":"hasPolicy"
            }
          },
          {
            "viewElement":{
              "object":"broker",
              "elementRef":"BR001",
              "multiplicity":"single",
              "relationFromParent":"managedBy",
              "relationToParent":"managesPolicy"
            }
          },
          {
            "viewElement":{
              "object":"coverage",
              "elementRef":"CV001",
              "multiplicity":"oneOrMore",
              "relationFromParent":"hasCover",
              "relationToParent":"coveredBy",
              "relationToOther":{
                "elementRef":"C001",
                "type":"hasCover"
              },
              "childObjects":[
                {
                  "viewElement":{
                    "object":"insuredObject",
                    "elementRef":"IO001",
                    "multiplicity":"oneOrMore",
                    "relationFromParent":"covers",
                    "relationToParent":"coveredBy"
                  }
                },
                {
                  "viewElement":{
                    "object":"insuredObject",
                    "elementRef":"IO002",
                    "multiplicity":"oneOrMore",
                    "relationFromParent":"covers",
                    "relationToParent":"coveredBy"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
  `

  let attributes = {}
  let vars = {}

 

  var dwl=`%dw 2.0
  output application/json
  
  var policyHeaderView = readUrl("classpath://dw/data/view-metadata-policyHeader.json")
  
  fun findObjectContent(objectType, commandId) = { 
       (objectType): payload.command.response filter ($.object.schema == objectType and $.object.commandId == commandId) map (object , index) ->
          object.object.content
  }
  
  fun findRelation(relation, relationFrom, relationType) = 
    (relation filter (($.from == relationFrom) and ($.rType == relationType))).to
  
  fun renderChildObjects(childObjectsArray) = {
    children: childObjectsArray map ((child, childIndex) -> {
      (child.viewElement.object) : findObjectContent(child.viewElement.object, child.viewElement.elementRef),
      (if (child.viewElement.childObjects != null) 
         renderChildObjects(child.viewElement.childObjects) else {}
      )
    }
    )
  }
  
  var firstViewElement = policyHeaderView.view.viewElement
  ---
  {
    (findObjectContent(firstViewElement.object, firstViewElement.elementRef)),
    (if (firstViewElement.childObjects != null) renderChildObjects(firstViewElement.childObjects) else {})
      //relation: findRelation(payload.command.response.relation, "PH001", policyHeaderView.view.viewElement.childObjects.viewElement[0].relationFromParent),
  }
  `

  let a = `
  {
    (findObjectContent(firstViewElement.object, firstViewElement.elementRef)),
    (if (firstViewElement.childObjects != null) renderChildObjects(firstViewElement.childObjects) else {})
      //relation: findRelation(payload.command.response.relation, "PH001", policyHeaderView.view.viewElement.childObjects.viewElement[0].relationFromParent),
  } `

  let exptected_result = `
  {
    "policyHeader": [
      {
        "polifcyRef": "xyz-124",
        "inceptionDate": "2019-11-01T00:00:00",
        "expiryDate": "2020-10-31T23:59:59"
      }
    ],
    "children": [
      {
        "customer": {
          "customer": [
            {
              "extRef": "sf00001abc"
            }
          ]
        }
      },
      {
        "broker": {
          "broker": [
            {
              "brokerRef": "br00111"
            }
          ]
        }
      },
      {
        "coverage": {
          "coverage": [
            {
              "coverageRef": "covRef00111"
            }
          ]
        },
        "children": [
          {
            "insuredObject": {
              "insuredObject": [
                {
                  "insuredType": "motor",
                  "make": "Ford",
                  "model": "Fiesta",
                  "engine": "2.0"
                }
              ]
            }
          },
          {
            "insuredObject": {
              "insuredObject": [
                {
                  "insuredType": "property",
                  "description": "office",
                  "fire": "yes"
                }
              ]
            }
          }
        ]
      }
    ]
  }
  `

  dwl = strip(dwl)
  
  //const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar2))
  //parser.feed(dwl.trim())

  //if (parser.results.length === 0)
  //throw "Dweeve parser found no dweeve!"

  //if (parser.results.length > 1)
  //throw "Dweeve parser found more than one intepretation of the dweeve!"
 corefuncs.setResourceFileContent("classpath://dw/data/view-metadata-policyHeader.json", rf)
 let result = dweeve.run(dwl, payload, attributes, vars)

 dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})


it('object with bracketed expression as key/val members generator', function(done) {
        
  let payload = { field1: "Bob", field2: "Jones"}

  let attributes = {}
  let vars = {}

 


  let dwl = `
  %dw 2.0
  fun getmoreContent() = ["cat","dog","mouse"] map  { ("item"++$$): $}
  ---
  { "a" : "abc", (getmoreContent())}
   `

  let exptected_result = `
 { "a": "abc", "item0": "cat", "item1" : "dog", "item2" : "mouse"}
  `

  let result = dweeve.run(dwl, payload, attributes, vars)

  dwassert.equalwows(result, exptected_result, 'output does not match example')
  done()
})
}
)