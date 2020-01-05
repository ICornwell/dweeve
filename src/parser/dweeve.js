// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");



const lexer = moo.compile({
            header: /^\%dw [0-9]+\.[0.9]+$/,
            WS:      { match: /[ \t\n]+/, lineBreaks: true },
            headerend : '---',
            comment: /\/\/.*?$/,
            number:  /0|[1-9][0-9]*\.?[0-9]*/,
            regex: /\/(?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\//,
            bool: /(?:true|false)/,
            null: /null/,
            matchroute: /->/,
            fatarrow: /=>/,
            mathbinop: /==|\+\+|<=|>=|\|\||&&|!=|[><\-+/*|&\^]/,
            dotbinop: /[.]/,
            assignment: /=/,
            dblstring:  { match : /["](?:\\["\\]|[^\n"\\])*["]/,},
            sglstring:  { match : /['](?:\\["\\]|[^\n"\\])*[']/,},
            keyvalsep: /:/,
            comma: /,/,
            mimetype:  /(?:application|text)\/\w+/,
            word:  { match : /\w[\w0-9_]*/},
            lparen:  '(',
            rparen:  ')',
            lbrace:  '{',
            rbrace:  '}',
            lsquare:  '[',
            rsquare:  ']',
        
    });

    lexer.next = (next => () => {
        let tok;
        while ((tok = next.call(lexer)) && tok.type === "WS") {}
        return tok;
    })(lexer.next);



    const thing = (name, data) => ( { type: name, 
        data: Array.isArray(data) ? data.filter(e => e !== null && (!Array.isArray(e) || e.length > 0)) : data } );
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "dweeve$ebnf$1", "symbols": ["d_header"], "postprocess": id},
    {"name": "dweeve$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dweeve", "symbols": ["dweeve$ebnf$1", "d_body"], "postprocess": (data) => ( { type:'dweeve', header: data[0], body: data[1] } )},
    {"name": "d_header$ebnf$1", "symbols": []},
    {"name": "d_header$ebnf$1", "symbols": ["d_header$ebnf$1", "h_declaration"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "d_header", "symbols": [(lexer.has("header") ? {type: "header"} : header), "d_header$ebnf$1", {"literal":"---"}], "postprocess": (data) => ( { type:'dweeve', header: data[0], decs: data[1] } )},
    {"name": "d_body", "symbols": ["expression"], "postprocess": (data) => ( { type:'body', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_input_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_output_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_var_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_input_dec", "symbols": [{"literal":"input"}, (lexer.has("mimetype") ? {type: "mimetype"} : mimetype)], "postprocess": (data) => ( { type: 'input-dec', mimetype: data[1]} )},
    {"name": "h_output_dec", "symbols": [{"literal":"output"}, (lexer.has("mimetype") ? {type: "mimetype"} : mimetype)], "postprocess": (data) => ( { type: 'output-dec', mimetype: data[1]} )},
    {"name": "h_var_dec", "symbols": [{"literal":"var"}, (lexer.has("word") ? {type: "word"} : word), (lexer.has("assignment") ? {type: "assignment"} : assignment), "expression"], "postprocess": (data) => ( { type: 'var-dec', varName: data[1], varVal: data[3]} )},
    {"name": "object$ebnf$1", "symbols": []},
    {"name": "object$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "keyvaluepair"]},
    {"name": "object$ebnf$1", "symbols": ["object$ebnf$1", "object$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "object", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "keyvaluepair", "object$ebnf$1", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess":  (data) => ( { type:"member-list",
        members: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ] } ) },
    {"name": "keyvaluepair$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "keyvaluepair$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "keyvaluepair", "symbols": ["key", (lexer.has("keyvalsep") ? {type: "keyvalsep"} : keyvalsep), "expression", "keyvaluepair$ebnf$1"], "postprocess": (data) => ( { type: 'member', key: data[0], value: data[2]} )},
    {"name": "key", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("sglstring") ? {type: "sglstring"} : sglstring)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("dblstring") ? {type: "dblstring"} : dblstring)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'dynamic-key', value: data[1] } )},
    {"name": "expression", "symbols": ["result"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["object"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["array"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["defaultexp"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["ifconditional"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["matcher"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "defaultexp", "symbols": ["expression", {"literal":"default"}, "expression"], "postprocess": (data) => ( { type:'default-expression', value: data[0], default: data[2] } )},
    {"name": "ifconditional", "symbols": [{"literal":"if"}, (lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen), "expression", {"literal":"else"}, "expression"], "postprocess":  (data) => ( { type:'if-conditional', 
        condition: data[2], then: data[4],                        
        else: data[6] } ) },
    {"name": "matcher$ebnf$1$subexpression$1", "symbols": [{"literal":"case"}, "matchcond", (lexer.has("matchroute") ? {type: "matchroute"} : matchroute), "expression"]},
    {"name": "matcher$ebnf$1", "symbols": ["matcher$ebnf$1$subexpression$1"]},
    {"name": "matcher$ebnf$1$subexpression$2", "symbols": [{"literal":"case"}, "matchcond", (lexer.has("matchroute") ? {type: "matchroute"} : matchroute), "expression"]},
    {"name": "matcher$ebnf$1", "symbols": ["matcher$ebnf$1", "matcher$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "matcher$ebnf$2$subexpression$1", "symbols": [{"literal":"else"}, {"literal":"->"}, "expression"]},
    {"name": "matcher$ebnf$2", "symbols": ["matcher$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "matcher$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "matcher", "symbols": ["expression", {"literal":"match"}, (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "matcher$ebnf$1", "matcher$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess":  (data) => ( { type:'pattern-match', 
        input: data[0], then: data[4],                        
        cases: data[3].map (c=>( { match: c[1], result:c[3]}) ),
        else: (data[4])==null ? null : data[4].map (e=>( { matchElse : e[2]} )) } ) },
    {"name": "matchcond$ebnf$1$subexpression$1", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":":"}]},
    {"name": "matchcond$ebnf$1", "symbols": ["matchcond$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "matchcond$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "matchcond", "symbols": ["matchcond$ebnf$1", "literal"], "postprocess": (data) => ( { type:'match-literal', var:data[0], litMatch:data[2] } )},
    {"name": "matchcond", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":"if"}, "expression"], "postprocess": (data) => ( { type:'match-if-exp', var:data[0], litMatch:data[2] } )},
    {"name": "matchcond", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":"matches"}, (lexer.has("regex") ? {type: "regex"} : regex)], "postprocess": (data) => ( { type:'match-literal', var:data[0], regex:data[2] } )},
    {"name": "matchcond", "symbols": ["operand"], "postprocess": (data) => ( { type:'match-vlaue', valMatch:data[0] } )},
    {"name": "matchcond", "symbols": [{"literal":"is"}, (lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ( { type:'match-type', typeName:data[1] } )},
    {"name": "result", "symbols": ["result", (lexer.has("mathbinop") ? {type: "mathbinop"} : mathbinop), "operand"], "postprocess": (data) => ( { type:'bin-op', lhs:data[0], op:data[1], rhs:data[2] } )},
    {"name": "result", "symbols": ["result", (lexer.has("dotbinop") ? {type: "dotbinop"} : dotbinop), "operand"], "postprocess": (data) => ( { type:'dot-op', lhs:data[0], op:data[1], rhs:data[2] } )},
    {"name": "result", "symbols": ["operand"], "postprocess": (data) =>( { type:'some-operand', value: data[0] } )},
    {"name": "operand", "symbols": ["identifier"], "postprocess": (data) => ( { type:'identifier-operand', value: data[0] } )},
    {"name": "operand", "symbols": ["literal"], "postprocess": (data) => ( { type:'literal-operand', value: data[0] } )},
    {"name": "operand", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'bracket-operand', value: data[1] } )},
    {"name": "identifier", "symbols": ["identifier", (lexer.has("lparen") ? {type: "lparen"} : lparen), "arglist", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'fun-call',  fun:data[0], args:data[2] } )},
    {"name": "identifier", "symbols": ["identifier", (lexer.has("lsquare") ? {type: "lsquare"} : lsquare), "expression", (lexer.has("rsquare") ? {type: "rsquare"} : rsquare)], "postprocess": (data) => ( { type:'idx-identifier', ident: data[0], idx: data[2] } )},
    {"name": "identifier", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ( { type:'identifier', ident: data[0] } )},
    {"name": "array", "symbols": [(lexer.has("lsquare") ? {type: "lsquare"} : lsquare), "arglist", (lexer.has("rsquare") ? {type: "rsquare"} : rsquare)], "postprocess": (data) => ( { type:'array',  members:data[1] } )},
    {"name": "arglist$ebnf$1", "symbols": []},
    {"name": "arglist$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "expression"]},
    {"name": "arglist$ebnf$1", "symbols": ["arglist$ebnf$1", "arglist$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arglist", "symbols": ["expression", "arglist$ebnf$1"], "postprocess":  (data) => ( { type:"arg-list",
        args: [data[0], ...(data[1].flat().filter(a=>a.type!=='comma') ) ] } ) },
    {"name": "literal", "symbols": [(lexer.has("sglstring") ? {type: "sglstring"} : sglstring)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("dblstring") ? {type: "dblstring"} : dblstring)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("null") ? {type: "null"} : null)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => ( { type:'literal', value: data[0] } )}
]
  , ParserStart: "dweeve"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
