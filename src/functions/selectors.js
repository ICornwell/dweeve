function addFunctions(context) {
    context['__doDotOp']= __doDotOp
    context['__doDotStarOp']= __doDotStarOp
    context['__doDotDotStarOp']= __doDotDotStarOp
    context['__doDotDotOp']= __doDotDotOp
    context['__getIdentifierValue']= __getIdentifierValue
    context['__flattenDynamicContent']= __flattenDynamicContent
}

function __getIdentifierValue(identifier){
    return identifier;
}

function __doDotOp(lhs, rhs, lhsName, rhsName) {
    if (lhs==undefined)
        throw 'Can not reference member: "' + rhsName + '" as "' + lhsName + '" is not defined / present.'
    try {
        
        if ( !Array.isArray(lhs)) {
            if (lhs['__ukey-obj']){
                let r = Object.values(lhs).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs]
                return r;
            } else {
                let r = lhs[rhs]; 
                if (r==undefined)
                    throw 'undefined'
                return r;
            }
        } else {
            let r = lhs.filter(m=>m['__ukey-obj'] || m[rhs]!==undefined)
                .map(kvps=> {
                    if (kvps['__ukey-obj']) {
                        return Object.values(kvps).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs];
                    } else {
                        return kvps[rhs];
                    }
                });
            return r;
        }
     } catch (ex) {
          return null;
        //  throw 'Can not reference member: "' + rhsName + '" of "' + lhsName + '", it is not defined / present.'; 
     } 
}

function __doDotStarOp(lhs, rhs, lhsName, rhsName) {
    lhs = convertJsonObjsToArray(lhs);
    try {
        let ms = lhs.filter(m=>m[rhs]!==undefined 
               || (m['__ukey-obj'] && Object.values(m).find(o=>Object.keys(o)[0]===rhs)!=undefined))

        let r = ms.map(kvps=> kvps[rhs] ? kvps[rhs] : Object.values(kvps).find(o=>Object.keys(o)[0]===rhs)[rhs]);

            return r;
     } catch (ex) {
         return null; 
     } 
}

function __doDotDotStarOp(lhs,rhs, lhsName, rhsName) {
//    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = getDescendentValues(lhs, rhs)
        return r;
    } catch (ex) {
        return null; 
    } 
}

function getDescendentValues(obj, key){
    let vs = []
    if (typeof obj !== 'object') return []
    // two loops to go down before in, to match dataweave 2.0 ordering
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        if (kvp.key === key) 
            vs.push(kvp.val)
    }
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        vs = vs.concat(getDescendentValues(kvp.val, key))
    }
    return vs
}

function __doDotDotOp(lhs,rhs, lhsName, rhsName) {
//    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = getFirstDescendentValue(lhs, rhs)
        return r;
    } catch (ex) {
        return null; 
    }     
}

function getFirstDescendentValue(obj, key){
    let vs = []
    if (typeof obj !== 'object') return []
    
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        if (kvp.key === key) {
            vs.push(kvp.val)
            break;
        }
    }
    for (let k in obj) {
        let kvp = dewrapKeyedObj(obj, k)
        vs = vs.concat(getFirstDescendentValue(kvp.val, key))
    }
    return vs
}

function dewrapKeyedObj(obj, key) {
    if (!key.startsWith('__key'))
        return {key: key, val: obj[key]}
    else
        return {key : Object.keys(obj[key])[0], val:Object.values(obj[key])[0]}
}

function __flattenDynamicContent(obj) {
    if (!obj['__hasDynamicContent']) return obj
    const newObj = { "__ukey-obj" : true}
    let idx = 0
    Object.keys(obj).forEach(k => {
        if (k.startsWith('__key')) {
            newObj['__key'+idx++]=obj[k]
        } else if (k.startsWith('__dkey')) {
            if (Array.isArray(obj[k])) {
                (obj[k]).forEach(m=> {
                    newObj['__key'+idx++]=m
                })
            } else {
                Object.keys(obj[k]).forEach(dk =>{
                    if (dk.startsWith('__key')) {
                        newObj['__key'+idx++]=obj[k][dk]
                    } else {
                        newObj['__key'+idx++]={ [dk]: obj[k][dk] }
                    }
                })
            }
        } else if (!k.startsWith('__')){
            newObj['__key'+idx++] = { [k]: obj[k]}
        }
    })
        
    return newObj
}

function convertJsonObjsToArray(lhs) {
    if (!Array.isArray(lhs) && lhs['__ukey-obj'])
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__ukey-obj']) {
        arr = [];
        for (let k in lhs)
            arr.push({ [k]: lhs[k] });
        lhs = arr;
    }
    return lhs;
}

module.exports = { addFunctions: addFunctions }