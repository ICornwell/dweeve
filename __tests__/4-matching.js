import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('Test matching', function() {
  it('mixed examples, all match types', function(done) {
        
    let payload = { field1: "Bob", field2: "Jones"}

    let attributes = {}
    let vars = {}
    let dwl1 = `
     myInput.string match {
        case str if str == "Emiliano" -> str ++ " Lesende"
     }
     `
    let dwl = `
    %dw 2.0
   
    var myInput = { "string": "hello fred", "number": 90,
     "object" : {"name" : "bob"}, "bool" : true,
     "name" : "Emiliano", "strings" : "strings", "bangtest" : "bang"}
    
    ---
    {
      a: myInput.string match {
        case str if str == "Emiliano" -> str ++ " Lesende"
        case myVar if (myVar == "strings") -> ("strings =" ++ myVar)
        case word matches /(hello)\\s\\w+/ ->  word[1]  ++ " was matched"
      },
      b: myInput.bool match {
        case num is Boolean -> "could be true or false:" ++ num
        case is Object -> "we got an Object"
        case "bob"  -> "is bob!"
        case word: "bang" ->  word ++ " was matched"
      },
      c: myInput.name match {
        case str if str == "Emiliano" -> str ++ " Lesende"
        case myVar if (myVar == "strings") -> ("strings =" ++ myVar)
        case word matches /(hello)\\s\\w+/ ->  word[1]  ++ " was matched"
      },
      d: myInput.object match {
        case num is Boolean -> "could be true or false:" ++ num
        case is Object -> "we got an Object"
        case "bob"  -> "is bob!"
        case word: "bang" ->  word ++ " was matched"
      },
      e: myInput.strings match {
        case str if str == "Emiliano" -> str ++ " Lesende"
        case myVar if (myVar == "strings") -> ("strings =" ++ myVar)
        case word matches /(hello)\\s\\w+/ ->  word[1]  ++ " was matched"
      },
      f: myInput.object.name match {
        case num is Boolean -> "could be true or false:" ++ num
        case is Object -> "we got an Object"
        case "bob"  -> "is bob!"
        case word: "bang" ->  word ++ " was matched"
      },
      g: myInput.bangtest match {
        case num is Boolean -> "could be true or false:" ++ num
        case is Object -> "we got an Object"
        case "bob"  -> "is bob!"
        case word: "bang" ->  word ++ " was matched"
      },
      h: myInput.number match {
        case num is Boolean -> "could be true or false:" ++ num
        case is Object -> "we got an Object"
        case "bob"  -> "is bob!"
        case word: "bang" ->  word ++ " was matched"
      }
    }
    `

    let exptected_result = `
    {
      "a": "hello was matched",
      "b": "could be true or false:true",
      "c": "Emiliano Lesende",
      "d": "we got an Object",
      "e": "strings =strings",
      "f": "is bob!",
      "g": "bang was matched"
    }
    `

    let result = dweeve.run(dwl, payload, attributes, vars)

    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
})

}
)