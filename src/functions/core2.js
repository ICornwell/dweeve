const core = {}
import coref from'./core'
coref.addFunctions(core)
import pluralizer from 'pluralize'

function addFunctions(context) {
    context['isEven'] = isEven
    context['lower'] = lower
    context['upper'] = upper
    context['isBlank'] = isBlank
    context['isDate'] = isDate
    context['isDecimal'] = isDecimal
    context['isEmpty'] = isEmpty
    context['isInteger'] = isInteger
    context['isLeapYear'] = isLeapYear
    context['log'] = log
    context['min'] = min
    context['minBy'] = minBy
    context['match'] = match
    context['matches'] = matches
    context['max'] = max
    context['maxBy'] = maxBy
    context['mod'] = mod
    context['now'] = now
    context['groupBy'] = groupBy
    context['orderBy'] = orderBy
    context['joinBy'] = joinBy
    context['reduce'] = reduce
    context['pluralize'] = pluralize
    context['trim'] = trim
    context['to'] = to
    context['sizeOf'] = sizeOf
    context['keySet'] = keySet
}

function isEven(number) {
    return number % 2 ? false: true
}

function lower(s) {
    return String(s).toLowerCase()
}

function upper(s) {
    return String(s).toUpperCase()
}

function isBlank(s) {
    return String(s).trim===''
}

function isDate(value) {
    switch (typeof value) {
        case 'number':
            return true
        case 'string':
            return !isNaN(Date.parse(value))
        case 'object':
            if (value instanceof Date) {
                return !isNaN(value.getTime())
            }
        default:
            return false
    }
}

function isEmpty(v) {
    if (v==null || v==undefined) return true
    if (Array.isArray(v) && v.length==0) return true
    if (typeof v === 'object' && Object.keys(v).filter(k=>(k!=='__ukey-obj' && k!=='__hasDynamicContent')  ).length==0) return true
    if (String(v).trim()==='') return true

    return false
}

function isDecimal(num) {
    try {
        const v = parseFloat(num)
        return String(v)==num
    } catch (err) {
        return false
    }
}

function isInteger(num) {
    try {
        const v = parseInt(num)
        return String(v)==num
    } catch (err) {
        return false
    }
}

import __isLeapYear from 'date-fns/isLeapYear'

function isLeapYear(date){
    return __isLeapYear.default(date)
}

function log(message) {
    console.log(message)
}

function min(list) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg
        list.forEach(m => {
            if (agg==undefined || m < agg)
                agg = m
        })
        return agg
    }
    catch (err) {}
    return 0
}

function minBy(list, itemFunc) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg
        let out = null
        list.forEach(m => {
            var v = itemFunc(m)
            if (agg==undefined || v < agg) {
                agg = v
                out = m
            }
        })
        return out
    }
    catch (err) {}
    return 0
}

function match(text, matcher) {
    return text.match(matcher)
}

function matches(text, matcher) {
    return text.match(matcher)!=null
}

function max(list) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg
        list.forEach(m => {
            if (agg==undefined || m > agg)
                agg = m
        })
        return agg
    }
    catch (err) {}
    return 0
}

function maxBy(list, itemFunc) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg
        let out = null
        list.forEach(m => {
            var v = itemFunc(m)
            if (agg==undefined || v > agg) {
                agg = v
                out = m
            }
        })
        return out
    }
    catch (err) {}
    return 0
}

function mod(dividend, divisor) {
    return dividend % divisor
}

function now() {
    return Date.now()
}

function joinBy(arr,s) {
    return arr.join(s)
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

function reduce(arr, reduceFunc, init)
{
    let acc = init
    // was there an initialiser for the accumaltor ?
    if (reduceFunc.toString().match(/\([\w]+,\s*[\w]+\s*=/)==null) {
        if (acc==undefined && arr.length>0){
            if (isDecimal(arr[0])) acc = 0; else acc = ''
        }
    } else acc = undefined
    arr.forEach(m=> {
      if (acc==undefined)
        acc=reduceFunc(m)
      else
        acc=reduceFunc(m, acc)
     } )
    return acc
}

function orderBy(arr, orderFunc, isReversed) {
    const compare = (x,y) => {
        if (typeof x == 'object' && Object.keys(x)[0].startsWith('__key')) x=Object.values(x)[0]
        if (typeof y == 'object' && Object.keys(y)[0].startsWith('__key')) x=Object.values(y)[0]
        if (orderFunc(x) > orderFunc(y)) return 1
        if (orderFunc(y) > orderFunc(x)) return -1
        return 0
    }
    let ordered = arr.slice().sort(compare)
    if (isReversed)
        ordered.reverse()

    return ordered
}

function pluralize(s)
{
    return pluralizer(s)
}

function sizeOf(arr){
    if (Array.isArray(arr))
        return arr.length

    return 0
}

function keySet(obj) {
    if (typeof obj !== 'object')
        return []

    if (!obj['__ukey-obj'])
        return Object.keys(obj)

    if (obj['__ukey-obj'])
        return Object.keys(obj).filter(k=>k.startsWith('__key'))
        .map(k=>Object.keys(obj[k])[0])
}


export default { addFunctions: addFunctions}