const moo = require('moo')
 
    let lexer = moo.compile({
            header: /^\%dw [0-9]+\.[0.9]+$/,
            WS:      /[ \t]+/,
            comment: /\/\/.*?$/,
            number:  /0|[1-9][0-9]*\.?[0-9]*/,
            keydef:     /\w+:/,
            dblstring:  { match : /["](?:\\["\\]|[^\n"\\])*["]/,},
            sglstring:  { match : /['](?:\\["\\]|[^\n"\\])*[']/,},
            keyvalsep: /:/,
            comma: /,/,
            mimetype:  /(?:application|text)\/\w+/,
            word:  { match : /\w+/},
            headerend : '---',
            lparen:  '(',
            rparen:  ')',
            lbrace:  '{',
            rbrace:  '}',
            lsquare:  '[',
            rsquare:  ']',
            NL:      { match: /\n/, lineBreaks: true },
        
    })

    function test() {
        lexer.reset(`%dw 2.0
        output application/xml
        ---
        {
            user: 'me'
        }`);

        let tokens = Array.from(lexer);

    
    }

    test();