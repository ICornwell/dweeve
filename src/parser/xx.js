
xx= 'hi';
yy = xx.match (/[3]/);


weave = (payload) =>( {
    a: ( () => { let $ = (( __getMember( (myInput), ('string')) )); 
    { let str = $;  if (str=="Mariano") { return (str+" de Achaval") } }
    { let str = $;  if (str=="Emiliano") { return (str+" Lesende") } }
    { let myVarOne = $;  if (myVar=="strings") { return ("strings"+"is myVar") } }
    } ) (),
    b: ( () => { let $ = (( __getMember( (myInput), ('number')) )); 
    { let num = $;  if (num==3) { return ("equal"); } }
    { let num = $;  if (num>3) { return ("greater than"); } }
    { let num = $;  if (num<3) { return ("less than"); } }
    { try { let word = $.match (/(hello)sw+/) ;  if (word !==null) { return (word1+" was matched") } } catch {} }
    } ) (),
    }
)