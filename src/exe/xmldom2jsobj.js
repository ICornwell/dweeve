function toJsObj(node){
    let nodeType = getNodeType(node)
    console.log(nodeType)
    if (nodeType==='Document') {
        let nl = { }
        for (let idx=0;idx<node.childNodes.length;idx++){
            let ce = node.childNodes.item(idx)
            if (getNodeType(ce)==='Element') {
                nl = toJsObj(ce)
            }
        }
        return nl
    }
    if (nodeType==='NodeList') {
        let nl = { '__ukey-obj' : true}
        for (let idx=0;idx<node.length;idx++){
            let ce = node.item(idx)
            if (getNodeType(ce)==='Element') {
                let js = toJsObj(ce)
                nl['__key'+idx]=js
            }
        }
        return nl
    }
    if (isTextOnlyElement(node)) {
        return ( { [node.nodeName]: numberIfPossible(node.textContent) } )
    }
    if (!hasText(node)) {
        return ({ [node.nodeName]: toJsObj(node.childNodes) })
    } else {
        let inner = toJsObj(node.childNodes)
        let ewl = { '__ukey-obj' : true}
        ewl["__key0"]= { "__text" : nodeOwnText(node) }; 
        for (let idx=1;idx<=Object.values(inner).length;idx++)
            if (Object.keys(inner)[idx-1].startsWith('__key'))
                ewl['__key'+idx]=Object.values(inner)[idx-1]; 
        
            return { [node.nodeName]: ewl }
    }
}

function numberIfPossible(text){
    if (!isNaN(parseFloat(text))) return parseFloat(text)
    if (text==='true') return true
    if (text==='false') return false

    return text
}


function getNodeType(node){
    if (node.constructor!=null && (typeof node.constructor.name) === 'string'
        && node.constructor.name.length>1 
        && node.constructor.name!=='Object'){ return node.constructor.name; }
    
    if (node.length && node.item) { return 'NodeList'}
}

function hasText(node) {
    if (node.childNodes===undefined || node.childNodes===null || node.childNodes.length==0) return false
    for (let idx=0;idx<node.childNodes.length;idx++)
        if (node.childNodes.item(idx).constructor.name==="Text"
            && !(/^\s*$/.test(node.childNodes.item(idx).textContent))) return true

    return false
}

function nodeOwnText(node) {
    if (node.childNodes===undefined || node.childNodes===null || node.childNodes.length==0) return ""
    for (let idx=0;idx<node.childNodes.length;idx++)
        if (node.childNodes.item(idx).constructor.name==="Text"
            && !(/^\s*$/.test(node.childNodes.item(idx).textContent)))
             return node.childNodes.item(idx).textContent

    return ""
}

function isTextOnlyElement(node){
    return (getNodeType(node)==='Element' && node.childNodes.length==1
     && node.firstChild.constructor.name==='Text')
}


export default {toJsObj: toJsObj}