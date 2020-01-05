const nearley = require("nearley");
const grammar = require("./dweeve.js");
const transpiler = require("../transpiler/transpiler.js");
const prettyJs = require('pretty-js');
const util = require('util');
const vm = require('vm');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const t1 =`%dw 2.0
output application/xml
---
{ this :1 + 2 + 3 + 4,
  that : 2 + 3 *8,
  other: (2+3) -8
}
    
`;

const t2 = 'if (payload.name == "ian") "thats me" else if (xxx == 7) "numbers!" else "thats not me"';

const t3=`
%dw 2.0
output application/json
var xyz = 2 + 5
var ar1 = ['2', '4', '6', 4 - xyz]
var myObject = { "myKey" : "1234", "name" : "somebody" }
var myArray = [ { "myKey" : "1234" }, { "name" : "somebody" } ]
var myNullExample = { someField : null }
---
{
        address1: payload.order.buyer.address,
        city: payload.order.buyer.city default 'London',
        country: payload.order.buyer.nationality,
        email: payload.order.buyer.email + 'sometext',
        name: payload.order.buyer.name + xyz,
        postalCode: payload.order.buyer.postCode,
        stateOrProvince: payload.order.buyer.state,
        selectingValueUsingKeyInObject : myObject.name,
        selectingValueUsingKeyOfObjectInArray : myArray.name,
        selectingValueUsingKeyOfObjectInArrayFail : myArray.fail,
        selectingValueUsingKeyOfObjectInArrayDef : myArray.defs default xyz,
        defTest: myNullExample.someField default "my default value"
}
`;

const t5 = "n > 3"

const t4 =`
{
    a: myInput.string match {
      case str if str == "Mariano" -> str ++ " de Achaval"
      case str if str == "Emiliano" -> str ++ " Lesende"
    },
    b: myInput.number match {
      case num if num == 3 -> "equal"
      case num if num > 3 -> "greater than"
      case num if num < 3 -> "less than"
    }
  }
`;

var key='test'

var obj = { this: 'that', [key]: 'other',bob: ( () => { try { return  key ;} catch { return 'bat'}; })() };
delete obj['this'];
var ar = [1,2,3];
var ar2 = [ {this: 'that'}, {name: 'then'}];




parser.feed(t4);

console.log("Interpreations found: " +parser.results.length);

code = transpiler.transpile(parser.results[0]);

console.log(prettyJs(code.decs));
console.log(prettyJs(code.text));

const sandbox = {
    payload: { name: 'aian' }, //{ order: { buyer: { name: 'bob', email: 'bob@home.com', address: '4 here st',
    // city: 'London',postCode:'L1 4NN', state:'na', nationality:'uk'}}},
    vars: { x:2, y:9 },
    attributes: { a1: 'a1', a2: 'a2'},
    xxx:87,
    __getMember:  (lhs, rhs) => { try { if ( !Array.isArray(lhs)) {return lhs[rhs];} else {return lhs.find(m=>m[rhs]!==undefined)[rhs];} } catch { return null; } } 
  };

  
  const script = 
  new vm.Script(code.decs + '\n' +code.text + '\n var result=weave(payload)');
  
  const context = new vm.createContext(sandbox);
  script.runInContext(context);

  console.log(context.result);
  

//console.log(parser.results);