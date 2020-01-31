
function addFunctions(context) {
    context['isOdd'] = isOdd
    context['concat'] = concat
    context['abs'] = abs
    context['avg'] = avg
    context['ceil'] = ceil
    context['contains'] = contains
    context['daysBetween'] = daysBetween
    context['distinctBy'] = distinctBy
    context['endsWith'] = endsWith
    context['filter'] = filter
    context['filterObject'] = filterObject
    context['startsWith'] = startsWith
    context['map'] = map
    context['mapObject'] = mapObject
}

function isOdd(number) {
    return number % 2 ? true: false;
}

function concat(a,b) {
    return a+b;
}

function abs(num) {
    return Math.abs(num)
}

function avg(list) {
    if (!Array.isArray(list))
        return 0
    try{
        let agg=0;
        list.forEach(m => {
            agg+=m
        });
        return agg/list.length;
    }
    catch {}
    return 0;
}

function ceil(num) {
    return Math.ceil(num)
}

function contains(arr, item) {
    return arr.includes(item)
}

function daysBetween(d1, d2){
    try {
        let time = Date.parse(d2) - Date.parse(d1)
        return time / (1000 * 60 * 60 * 24)
    }
    catch (err) {
        throw "Could not process dates for daysBetween:"+ err.message
    }
}

function distinctBy(items, criteria) {
    let out = []
    let distinctList =[]
    let ewl = (items['__extra-wrapped-list'])
    for(let key in items) {
        if (key!=='__extra-wrapped-list') {
            let k = items
            let v = items[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            let candidate = JSON.stringify(criteria(v,k))
            if (!distinctList.includes(candidate)) {
                distinctList.push(candidate)
                out.push(v);
            }
        }
    }

    return out;
}

function endsWith(s1,s2) {
    return String(s1).endsWith(s2)
}

function filter(arr, criteria) {
    let out = []
    let ewl = (arr['__extra-wrapped-list'])
    for(let key in arr) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = arr[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            if (criteria(v,k))
                out.push(v);
        }
    }

    return out;
}

function filterObject(source, criteria){
    let out = {'__extra-wrapped-list': true};
    let ewl = (source['__extra-wrapped-list'])
    let idx=0;
    for(let key in source) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = source[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            if (criteria(v,k))
            out['__key'+idx++]=({[k]:v});
        }
    }

    return out;
}

function startsWith(s1,s2) {
    return String(s1).startsWith(s2)
}

function map(source, mapFunc){
    let out = []
    let ewl = (source['__extra-wrapped-list'])
    for(let key in source) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = source[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            out.push(mapFunc(v, k));
        }
    }

    return out;
}

function mapObject(source, mapFunc){
    let out = {'__extra-wrapped-list': true};
    let ewl = (source['__extra-wrapped-list'])
    let idx=0;
    for(let key in source) {
        if (key!=='__extra-wrapped-list') {
            let k = key
            let v = source[key]
            if (ewl) {
                k = Object.keys(v)[0]
                v = Object.values(v)[0]
            }

            k = isNaN(parseInt(k)) ? k : parseInt(k)
            out['__key'+idx++]=(mapFunc(v, k));
        }
    }

    return out;
}

module.exports = {addFunctions : addFunctions}