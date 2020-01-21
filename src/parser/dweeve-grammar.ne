@{%
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
            dotdotstarbinop: /\.\.\*/,
            dotdotbinop: /\.\./,
            dotstarbinop: /\.\*/,
            dotbinop: /[.]/,
            mathbinop: /==|\+\+|<=|>=|\|\||&&|!=|[><\-+/*|&\^]/,
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

h_var_dec       -> "var" %word %assignment h_dec_expression {% (data) => ( { type: 'var-dec', varName: data[1], varVal: data[3]} ) %}

h_fun_dec       -> "fun" %word %lparen %word:? (%comma %word):* %rparen %assignment h_dec_expression {% (data) => ( { 
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
                 | array {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | defaultexp {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | ifconditional {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | matcher {% (data) => ( { type:'expression', value: data[0] } ) %}
                 #| identifier {% (data) => ( { type:'expression', value: data[0] } ) %}
                 #| literal {% (data) => ( { type:'expression', value: data[0] } ) %}
                 
defaultexp      -> expression "default" expression  {% (data) => ( { type:'default-expression', value: data[0], default: data[2] } ) %}

ifconditional   -> "if" %lparen expression %rparen expression "else" expression
                        {% (data) => ( { type:'if-conditional', 
                                         condition: data[2], then: data[4],                        
                                         else: data[6] } ) %}

matcher         -> expression "match" %lbrace
                   ("case" matchcond %matchroute expression):+
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

result          -> result %mathbinop operand {% (data) => ( { type:'bin-op', lhs:data[0], op:data[1], rhs:data[2] } ) %}
                 | result dotops operand {% (data) => ( { type:'dot-op', lhs:data[0], op:data[1], rhs:data[2] } ) %}
                 | operand {% (data) =>( { type:'some-operand', value: data[0] } ) %}


operand         -> identifier {% (data) => ( { type:'identifier-operand', value: data[0] } ) %}
                 | literal {% (data) => ( { type:'literal-operand', value: data[0] } ) %}
                 | %lparen expression %rparen {% (data) => ( { type:'bracket-operand', value: data[1] } ) %}

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
                
dotops          -> %dotbinop        {% (data) => ( { type:'dot', value: data[0] } ) %}
                 | %dotstarbinop    {% (data) => ( { type:'dotstar', value: data[0] } ) %}
                 | %dotdotstarbinop    {% (data) => ( { type:'dotdotstar', value: data[0] } ) %}
                 | %dotdotbinop    {% (data) => ( { type:'dotdot', value: data[0] } ) %}

#ws              -> %WS:* {% (data) => null %}
