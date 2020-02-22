@{%
const moo = require("moo");



const lexer = moo.compile({
            header: /^\%dw [0-9]+\.[0.9]+$/,
            
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
            bang: /!/,
            mimetype:  /(?:application|text)\/\w+/,
            word:  { match : /[A-Za-z$][\w0-9_$]*/, type:moo.keywords({
                keyword: ['case', 'if', 'default', 'matches', 'match', 'var', 'fun', 'else', 'do', 'and', 'or', 'not']
            })},
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

@{%
 if (!Array.prototype.flat)  {
        Object.defineProperty(Array.prototype, 'flat', {
            value: function(depth = 1, stack = []) {
                for (let item of this)
                    if (item instanceof Array && depth > 0)
                        item.flat(depth - 1, stack);
                    else 
                        stack.push(item);
                return stack;
            }
        });
    }
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

object          -> %lbrace objectmember (%comma objectmember):* %rbrace {% (data) => ( { type:"member-list",
                           members: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ] } ) %}
                 | %lbrace %rbrace  {% (data) => ( { type:"member-list", members: [] } ) %}

objectmember    -> keyvaluepair               {% (data) => ( { type: 'member', key: data[0].key, value: data[0].value} ) %}
                 | %lparen expression %rparen {% (data) => ( { type:'bracket-operand', value: data[1] } ) %}

keyvaluepair    -> key %keyvalsep expression %comma:? {% (data) => ( { type: 'member', key: data[0], value: data[2]} ) %}

key             -> %word {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %sglstring {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %dblstring {% (data) => ( { type:'key', value: data[0] } ) %}
                 | %lparen expression %rparen {% (data) => ( { type:'dynamic-key', value: data[1] } ) %}

comment         -> %comment  {% (data) => ( { type:'commemt', value: data[0] } ) %}


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


expression       -> result        {% (data) => ( data[0] ) %} 
                 | ifconditional  {% (data) => ( data[0] ) %}
                 | matcher        {% (data) => ( data[0] ) %}


# operator precedence goes here!

result          -> l01ops                           {% (data) =>( data[0] ) %}
l01ops           -> l01ops %word l05ops             {% (data) =>( { type:'fun-call',  fun: data[1].value, args: [data[0], data[2]]  } ) %}
                 | l05ops                           {% (data) =>( data[0] ) %}
l05ops           -> %word l9operator l07ops         {% (data) =>( { type:'lambda',  args: data[0], expression: data[2]  } ) %}
                 | arglist l9operator l07ops        {% (data) =>( { type:'lambda',  args: data[0].args,  expression: data[2]  } ) %}
                 | l07ops                           {% (data) =>( data[0] ) %}

l07ops           -> l85operator l10ops              {% (data) =>( { type:'un-op',  op: data[0].value, rhs: newOpData(data[1])  } ) %}
                 | l10ops                           {% (data) =>( data[0] ) %}

l10ops           -> l10ops l8operator l20ops        {% (data) =>( { type:'or',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l20ops                           {% (data) =>( data[0] ) %}
l20ops           -> l20ops l7operator l30ops        {% (data) =>( { type:'and',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l30ops                           {% (data) =>( data[0] ) %}
l30ops           -> l30ops l6operator l40ops        {% (data) =>( { type:'relative',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l40ops                           {% (data) =>( data[0] ) %}
l40ops           -> l40ops l5operator l50ops        {% (data) =>( { type:'relative',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l50ops                           {% (data) =>( data[0] ) %}
l50ops           -> l50ops l4operator l60ops        {% (data) =>( { type:'sum',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l60ops                           {% (data) =>( data[0] ) %}
l60ops           -> l60ops l3operator l70ops        {% (data) =>( { type:'product',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l70ops                           {% (data) =>( data[0] ) %}
l70ops           -> l70ops l2operator l75ops        {% (data) =>( { type:data[1].type,  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | l75ops                           {% (data) =>( data[0] ) %}
l75ops           -> l0operator l80ops               {% (data) =>( { type:'un-op',  op: data[0].value, rhs: newOpData(data[1])  } ) %}
                 | l80ops                           {% (data) =>( data[0] ) %}
l80ops           -> l80ops l1operator operand       {% (data) =>( { type:'dot-op',  lhs: newOpData(data[0]), op: data[1].value, rhs: newOpData(data[2])  } ) %}
                 | operand                          {% (data) =>( data[0] ) %}
@{%
function newOpData(oldData) {
    if (oldData.value) return oldData.value
    return oldData;
}

%}
l0operator      -> "!"   {% (data) =>( { type:'dotop', value: data[0] } ) %}

l1operator      -> dotops   {% (data) =>( { type:'dotop', value: data[0] } ) %}
l2operator      -> "as"     {% (data) =>( { type:'as', value: data[0] } ) %}
                 | "default"  {% (data) =>( { type:'default', value: data[0] } ) %}
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
l85operator      -> "not"   {% (data) =>( { type:'dotop', value: data[0] } ) %}
l9operator      -> "->"     {% (data) =>( { type:'lambda', value: data[0] } ) %}



operand         -> identifier {% (data) => ( { type:'identifier-operand', value: data[0] } ) %}
                 | literal {% (data) => ( { type:'literal-operand', value: data[0] } ) %}

                 | %lparen expression %rparen {% (data) => ( { type:'bracket-operand', value: data[1] } ) %}
                 | object {% (data) => ( { type:'expression', value: data[0] } ) %}
                 | keyvaluepair  {% (data) => ( { type:'kvp', value: data[0] } ) %}
#                | defaultexp {% (data) => ( { type:'expression', value: data[0] } ) %}
#                 | %lparen %word:? (%comma %word):* %rparen %thinarrow expression
#                        {% (data) => ( { type:'lambda', value: { 
#                        args: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ],
#
#                        expression: data[5] }} ) %}  
                 
                 | array {% (data) => ( { type:'expression', value: data[0] } ) %}

identifier      -> identifier %lparen explist %rparen {% (data) => ( { type:'fun-call',  fun:data[0], args:data[2].args } ) %}
                 | identifier %lsquare expression %rsquare {% (data) => ( { type:'idx-identifier', ident: data[0], idx: data[2] } ) %}
                 | %word {% (data) => ( { type:'identifier', ident: data[0] } ) %}

array           -> %lsquare explist %rsquare {% (data) => ( { type:'array',  members:data[1] } ) %}

explist         -> expression:? ( %comma expression ):* {% (data) => ( { type:"arg-list",
                           args: [data[0], ...(data[1].flat().filter(a=>a.type!=='comma') ) ] } ) %}

arglist         -> %lparen %word:? (%comma %word):* %rparen {% (data) => ( { type:"arg-list",
                           args: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ] } ) %}

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
