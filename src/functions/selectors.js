function __getIdentifierValue(identifier){
    return identifier;
}

function __doDotOp(lhs, rhs) {
    try {
        
        if ( !Array.isArray(lhs)) {
            if (lhs['__extra-wrapped-list']){
                let r = Object.values(lhs).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs]
                return r;
            } else {
                let r = lhs[rhs]; 
                console.log(r);
                return r;
            }
        } else {
            let r = lhs.filter(m=>m['__extra-wrapped-list'] || m[rhs]!==undefined)
                .map(kvps=> {
                    if (kvps['__extra-wrapped-list']) {
                        return Object.values(kvps).filter(v=>(typeof v === 'object')).find(kvp=>kvp[rhs])[rhs];
                    } else {
                        return kvps[rhs];
                    }
                });
            return r;
        }
     } catch (ex) {
         return null; 
     } 
}

function __doDotStarOp(lhs, rhs) {
    lhs = convertJsonObjsToArray(lhs);
    try {
        let r = lhs.filter(m=>m[rhs]!==undefined)
            .map(kvps=> kvps[rhs]);
        return r;
     } catch (ex) {
         return null; 
     } 
}

function __doDotDotStarOp(lhs,rhs) {
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

function __doDotDotOp(lhs,rhs) {
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

function convertJsonObjsToArray(lhs) {
    if (!Array.isArray(lhs) && lhs['__extra-wrapped-list'])
        lhs = Object.values(lhs);
    else if (!Array.isArray(lhs) && !lhs['__extra-wrapped-list']) {
        arr = [];
        for (let k in lhs)
            arr.push({ [k]: lhs[k] });
        lhs = arr;
    }
    return lhs;
}

module.exports = {
    __doDotOp:  __doDotOp,
    __doDotStarOp: __doDotStarOp,
    __doDotDotStarOp: __doDotDotStarOp,
    __doDotDotOp: __doDotDotOp,
    __getIdentifierValue: __getIdentifierValue}