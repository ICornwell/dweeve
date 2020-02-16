const core = {}
require('./core').addFunctions(core)

function addFunctions(context) {
    context['isEven'] = isEven
    context['lower'] = lower
    context['upper'] = upper
    context['isBlank'] = isBlank
    context['isDate'] = isDate
    context['isDecimal'] = isDecimal
    context['isEmpty'] = isEmpty
    context['isLeapYear'] = isLeapYear
    context['log'] = log
    context['min'] = min
    context['max'] = max
    context['mod'] = mod
    context['now'] = now
    context['groupBy'] = groupBy
    context['joinBy'] = joinBy
    context['trim'] = trim
    context['to'] = to
}

function isEven(number) {
    return number % 2 ? false: true;
}

function lower(s) {
    return String(s).toLowerCase();
}

function upper(s) {
    return String(s).toUpperCase();
}

function isBlank(s) {
    return String(s).trim===''
}

function isDate(value) {
    switch (typeof value) {
        case 'number':
            return true;
        case 'string':
            return !isNaN(Date.parse(value));
        case 'object':
            if (value instanceof Date) {
                return !isNaN(value.getTime());
            }
        default:
            return false;
    }
}

function isEmpty(v) {
    if (Array.isArray(v) && v.length==0) return true
    if (typeof v === 'object' && Object.keys(v).filter(k=>(!k.startsWith('__')  ))) return true
    if (String(s).trim==='') return true

    return false
}

function isDecimal(num) {
    try {
        const v = parseFloat(num)
        return true
    } catch {
        return false
    }
}

function isInteger(num) {
    try {
        const v = parseInt(num)
        return true
    } catch {
        return false
    }
}

var isLeapYear = require('date-fns/isLeapYear')

function log(message) {
    console.log(message)
}

function min(list) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg;
        list.forEach(m => {
            if (agg==undefined || m < agg)
                agg = m
        });
        return agg
    }
    catch {}
    return 0
}

function max(list) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg;
        list.forEach(m => {
            if (agg==undefined || m > agg)
                agg = m
        });
        return agg
    }
    catch {}
    return 0
}

function mod(dividend, divisor) {
    return dividend % divisor
}

function now() {
    return Date.now()
}

function joinBy(arr,s) {
    return Array.join(arr, s)
}

function groupBy(list, criteria) {
    if (typeof criteria === 'function') {
          const groups = core.distinctByKeys(list, criteria)
        const outObj = {}
        groups.forEach(g=>{
            
            let gItems = []
            if (Array.isArray(list))
                gItems =core.filter(list, (v,k)=> (criteria(v,k)===g))
            else
                gItems =core.filterObject(list, (v,k)=> (criteria(v,k)===g))

            if (Array.isArray(gItems)) {
                let newArr = []
                gItems.forEach(gi=> newArr.push(gi))
                outObj[g] = newArr
            } else
                outObj[g] = gItems
        })
        return outObj
    }
    else {
        return { [criteria] : list }
    }
}

function trim(s) {
    return String(s).trim()
}

function to(start, end) {
    let arr = []
    for (let idx=start; idx <= end; idx++)
        arr.push(idx)

    return arr
}


module.exports = { addFunctions: addFunctions}