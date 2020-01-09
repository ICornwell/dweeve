var xpath = require('xpath')
  , dom = require('xmldom').DOMParser


function toJsObj(node){
    let nodeType = getNodeType(node);
    console.log(nodeType);
    if (nodeType==='Document') {
        let nl = { };
        for (let idx=0;idx<node.childNodes.length;idx++){
            let ce = node.childNodes.item(idx);
            if (getNodeType(ce)==='Element') {
                nl = toJsObj(ce);
            }
        }
        return nl;
    }
    if (nodeType==='NodeList') {
        let nl = { '__extra-wrapped-list' : true};
        for (let idx=0;idx<node.length;idx++){
            let ce = node.item(idx);
            if (getNodeType(ce)==='Element') {
                let js = toJsObj(ce);
                nl['__key'+idx]=js
            }
        }
        return nl;
    }
    if (isTextOnlyElement(node)) {
        return ( { [node.nodeName]: node.textContent } );
    }
    if (!hasText(node)) {
        return ({ [node.nodeName]: toJsObj(node.childNodes) });
    } else {
        return ({ "__text": node.textContent, [node.nodeName]: toJsObj(node.childNodes) });
    }
}



function getNodeType(node){
    if (node.constructor!=null && (typeof node.constructor.name) === 'string'
        && node.constructor.name.length>1 
        && node.constructor.name!=='Object'){ return node.constructor.name; }
    
    if (node.length && node.item) { return 'NodeList'}
}

function hasText(node) {
    if (node.childNodes===undefined || node.childNodes===null || node.childNodes.length==0) return false;
    for (idx=0;idx<node.childNodes.length;idx++)
        if (node.childNodes.item(idx).constructor.name==="Text"
            && !(node.childNodes.item(idx).textContent.match(/\s*/))) return true;

    return false;
}

function isTextOnlyElement(node){
    return (getNodeType(node)==='Element' && node.childNodes.length==1
     && node.firstChild.constructor.name==='Text');
}


module.exports = {toJsObj: toJsObj}