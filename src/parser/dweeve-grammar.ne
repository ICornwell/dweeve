@{%
const moo = require("moo");



const lexer = moo.compile({
            header: /^\%dw [0-9]+\.[0.9]+$/,
            keyword: ['case', 'if', 'default', 'matches', 'match', 'var', 'fun', 'else', 'do'],
            WS:      { match: /[ \t\n]+/, lineBreaks: true },
            headerend : '---',
            comment: /\/\/.*?$/,
            regex: /\/(?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\//,
            bool: /(?:true|false)/,
            null: /null/,
            thinarrow: /->/,
            fatarrow: /=>/,
            dotdotstarbinop: /\.\.\*/,
            dotdotbinop: /\.\./,
            dotstarbinop: /\.\*/,
            dotbinop: /[.]/,
            mathbinop: /==|\+\+|<=|>=|\|\||&&|!=|[=><\-+/*|&\^]/,
            
            dblstring:  { match : /["](?:\\["\\]|[^\n"\\])*["]/,},
            sglstring:  { match : /['](?:\\['\\]|[^\n'\\])*[']/,},
            keyvalsep: /:/,
            comma: /,/,
            mimetype:  /(?:application|text)\/\w+/,
            word:  { match : /[A-Za-z$][\w0-9_$]*/},
            number:  /(?:0|[1-9][0-9]*\.?[0-9]*)/,
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

%}

@{%
    const thing = (name, data) => ( { type: name, 
        data: Array.isArray(data) ? data.filter(e => e !== null && (!Array.isArray(e) || e.length > 0)) : data } );
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

#main structure

dweeve          -> d_header:? d_body {% (data) => ( { type:'dweeve', header: data[0], body: data[1] } ) %}

d_header        -> %header:?  h_declaration:* "---" {% (data) => ( { type:'dweeve', header: data[0], decs: data[1] } ) %}

d_body          -> expression  {% (data) => ( { type:'body', value: data[0] } ) %}
            #     | object  {% (data) => ( { type:'body', value: data[0] } ) %}

h_declaration   -> h_input_dec      {% (data) => (  { type:'head-dec', value: data[0] } ) %}
                 | h_output_dec     {% (data) => (  { type:'head-dec', value: data[0] } ) %}
                 | h_var_dec        {% (data) => (  { type:'head-dec', value: data[0] } ) %}
                 | h_fun_dec        {% (data) => (  { type:'head-dec', value: data[0] } ) %}

h_input_dec     -> "input" %mimetype {% (data) => ( { type: 'input-dec', mimetype: data[1]} ) %}


h_output_dec    -> "output" %mimetype {% (data) => ( { type: 'output-dec', mimetype: data[1]} ) %}

h_var_dec       -> "var" %word "=" h_dec_expression {% (data) => ( { type: 'var-dec', varName: data[1], varVal: data[3]} ) %}

h_fun_dec       -> "fun" %word %lparen %word:? (%comma %word):* %rparen "=" h_dec_expression {% (data) => ( { 
                        type:"fun-def", func:data[1], args: [data[3], ...(data[4].flat().filter(a=>a.type!=='comma') ) ],
                        body: data[7]
                        } )%}

h_dec_expression -> expression {% (data) => ( { type:'expression', value: data[0] } ) %}

                 | "do" %lbrace dweeve %rbrace {% (data) => ( { type: 'do-dweeve', dweeve: data[2]} ) %}

object          -> %lbrace keyvaluepair (%comma keyvaluepair):* %rbrace {% (data) => ( { type:"member-list",
                           members: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ] } ) %}

keyvaluepair    -> key %keyvalsep expression %comma:? {% (data) => ( { type: 'member', key: data[0], value: data[2]} ) %}

key             -> %word {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %sglstring {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %dblstring {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %lparen expression %rparen {% (data) => ( { type:'dynamic-key', value: data[1] } ) %}


expression      -> result {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | object {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | defaultexp {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | ifconditional {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | matcher {% (data) => ( { type:'expression', value: data[0] } ) %}

                 

                 | expression %word expression {% (data) => ( { type:'fun-call',  fun:data[1], 
                    args: { args: [ data[0], data[2] ] } } ) %}

                 | %lparen %word:? (%comma %word):* %rparen %thinarrow expression
                        {% (data) => ( { type:'lambda', ident: data[0],func:data[1], 
                        args: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ],
                        expression: data[5] } ) %}  
                 
                 | array {% (data) => ( { type:'expression', value: data[0] } ) %}
                              


                 #| identifier {% (data) => ( { type:'expression', value: data[0] } ) %}
                 #| literal {% (data) => ( { type:'expression', value: data[0] } ) %}
                 
defaultexp      -> expression "default" expression  {% (data) => ( { type:'default-expression', value: data[0], default: data[2] } ) %}

ifconditional   -> "if" %lparen expression %rparen expression "else" expression
                        {% (data) => ( { type:'if-conditional', 
                                         condition: data[2], then: data[4],                        
                                         else: data[6] } ) %}

matcher         -> expression "match" %lbrace
                   ("case" matchcond %thinarrow expression):+
                   ("else" "->" expression):? %rbrace
                   {% (data) => ( { type:'pattern-match', 
                                         input: data[0], then: data[4],                        
                                         cases: data[3].map (c=>( { match: c[1], result:c[3]}) ),
                                         else: (data[4])==null ? null : data[4][2] } ) %}

matchcond      -> (%word ":"):? literal {% (data) => ( { type:'match-literal', var:(data[0]==null) ? null : data[0][0],
                        litMatch:data[1] } ) %}
                 | %word "if" expression {% (data) => ( { type:'match-if-exp', var:data[0], expMatch:data[2] } ) %}
                 | %word "matches" %regex {% (data) => ( { type:'match-regex', var:data[0], regex:data[2] } ) %}
        #         | operand {% (data) => ( { type:'match-vlaue', valMatch:data[0] } ) %}
                 | (%word):? "is" %word {% (data) => ( { type:'match-type',var:(data[0]==null) ? null : data[0][0],
                        typeName:data[2] } ) %}


result          -> mathresult {% (data) => ( { type:'math-result', value:data[0].value } ) %}
#                 | result dotops operand {% (data) => ( { type:'dot-op', lhs:data[0], op:data[1], rhs:data[2] } ) %}
#math                 | operand {% (data) =>( { type:'some-operand', value: data[0] } ) %}



# operator precedence goes here!

mathresult       -> l1ops                        {% (data) =>( { type:'operand', value : data[0].value } ) %}
l1ops           -> l1ops l8operator l2ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l2ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l2ops           -> l2ops l7operator l3ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l3ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l3ops           -> l3ops l6operator l4ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l4ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l4ops           -> l4ops l5operator l5ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l5ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l5ops           -> l5ops l4operator l6ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l6ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l6ops           -> l6ops l3operator l7ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l7ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l7ops           -> l7ops l2operator l8ops        {% (data) =>( { type:'op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | l8ops                         {% (data) =>( { type:'operand', value : data[0].value } ) %}
l8ops           -> l8ops l1operator operand      {% (data) =>( { type:'dot-op', value: { lhs: data[0].value, op: data[1].value, rhs: data[2].value } } ) %}
                 | operand                       {% (data) =>( { type:'operand', value : data[0].value } ) %}


l1operator      -> dotops     {% (data) =>( { type:'dotop', value: data[0] } ) %}
l2operator      -> "as"     {% (data) =>( { type:'operator', value: data[0] } ) %}
l3operator      -> "*"      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 | "/"      {% (data) =>( { type:'operator', value: data[0] } ) %}
l4operator      -> "+"      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 | "++"     {% (data) =>( { type:'operator', value: data[0] } ) %}
                 | "-"      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 | ">>"     {% (data) =>( { type:'operator', value: data[0] } ) %}
                 | "<<"     {% (data) =>( { type:'operator', value: data[0] } ) %}
l5operator      -> ">"      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"="       {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"<"       {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |">="      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"<="      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"is"      {% (data) =>( { type:'operator', value: data[0] } ) %}
l6operator      -> "!="     {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"~="      {% (data) =>( { type:'operator', value: data[0] } ) %}
                 |"=="      {% (data) =>( { type:'operator', value: data[0] } ) %}
l7operator      -> "and"    {% (data) =>( { type:'operator', value: data[0] } ) %}
l8operator      -> "or"     {% (data) =>( { type:'operator', value: data[0] } ) %}



operand         -> identifier {% (data) => ( { type:'identifier-operand', value: data[0] } ) %}
                 | literal {% (data) => ( { type:'literal-operand', value: data[0] } ) %}
                 | %lparen expression %rparen {% (data) => ( { type:'bracket-operand', value: data[1] } ) %}
#                 | result {% (data) => ( { type:'result-operand', value: data[0] } ) %}

identifier      -> identifier %lparen arglist %rparen {% (data) => ( { type:'fun-call',  fun:data[0], args:data[2] } ) %}

                 | identifier %lsquare expression %rsquare {% (data) => ( { type:'idx-identifier', ident: data[0], idx: data[2] } ) %}

                 | %word {% (data) => ( { type:'identifier', ident: data[0] } ) %}

                 

array           -> %lsquare arglist %rsquare {% (data) => ( { type:'array',  members:data[1] } ) %}

arglist         -> expression:? ( %comma expression ):* {% (data) => ( { type:"arg-list",
                           args: [data[0], ...(data[1].flat().filter(a=>a.type!=='comma') ) ] } ) %}

literal         ->  %sglstring  {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  %dblstring  {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  %bool       {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  %null       {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  %number     {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  %regex      {% (data) => ( { type:'literal', value: data[0] } ) %}
                 |  "-" %number {% (data) => ( { type:'number', value: '-'+data[1] } ) %}

                
dotops          -> %dotbinop        {% (data) => ( { type:'dot', value: data[0] } ) %}
                 | %dotstarbinop    {% (data) => ( { type:'dotstar', value: data[0] } ) %}
                 | %dotdotstarbinop    {% (data) => ( { type:'dotdotstar', value: data[0] } ) %}
                 | %dotdotbinop    {% (data) => ( { type:'dotdot', value: data[0] } ) %}

#ws              -> %WS:* {% (data) => null %}
