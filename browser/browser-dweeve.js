(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dwBundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
var indexOf = function (xs, item) {
    if (xs.indexOf) return xs.indexOf(item);
    else for (var i = 0; i < xs.length; i++) {
        if (xs[i] === item) return i;
    }
    return -1;
};
var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    if (context) {
        forEach(Object_keys(ctx), function (key) {
            context[key] = ctx[key];
        });
    }

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.isContext = function (context) {
    return context instanceof Context;
};

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{}],5:[function(require,module,exports){
(function (process){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Author: Henry Price
 * Website: Phanxgames.com
 * ---------------------------------
 * Dictionary
 */
class Dictionary {
    constructor(initial = null, options = null) {
        /**
         * @internal
         */
        this[Symbol.iterator] = function* () {
            let keys = this.getKeys(); //Object.keys(this);
            for (let key of keys) {
                yield this[key];
            }
        };
        if (initial != null) {
            this._copyValues(initial);
        }
        options = options || { cacheKeys: false };
        //Make the internal data non enumerable.
        Object.defineProperty(this, "__private__", {
            value: {},
            enumerable: false
        });
        this.__private__.cacheKeys = options.cacheKeys;
        this.__private__.invalidateKeys = true;
        this.__private__.keys = null;
    }
    /**
     * Use to loop through key, value pairs.
     * <pre>
     *     for (let [key,value] of dict.entries()) {
     *          //...
     *     }
     * </pre>
     * @returns Iterator
     */
    entries() {
        let self = this;
        return { "alert": "exposes Symbol.iterator, use with (for ... of) loop",
            [Symbol.iterator]: function* () {
                let keys = self.getKeys(); //Object.keys(this);
                for (let key of keys) {
                    yield [key, self[key]];
                }
            }
        };
    }
    /**
     * Checks if collection has this key.
     * @param {TKey} key
     * @returns {boolean}
     */
    has(key) {
        if (key == null)
            return false;
        if (typeof key == "string" && key.indexOf("__private__") >= 0)
            return false;
        return this.hasOwnProperty(key);
    }
    /**
     * Checks if the value is within the Dictionary.
     * @param {TValue} value
     * @returns {boolean}
     */
    contains(value) {
        if (value == null)
            return false;
        let values = Object.values(this);
        return values.indexOf(value) >= 0;
    }
    /**
     * Returns number of items in collection.
     * @returns {number} c
     */
    size() {
        return this.getKeys().length;
    }
    /**
     * Returns number of items in collection.
     * @returns {number} c
     */
    get length() {
        return this.size();
    }
    /**
     * Invalidates keys to recalculate.
     */
    invalidate() {
        this.__private__.invalidateKeys = true;
    }
    /**
     * @ignore
     * @alias getKeys()
     */
    keys() {
        return this.getKeys();
    }
    /**
     * Return array of keys
     * @returns {Array<any>} array of keys
     */
    getKeys() {
        if (!this.__private__.cacheKeys)
            return Object.keys(this);
        if (this.__private__.invalidateKeys ||
            this.__private__.keys == null) {
            this.__private__.invalidateKeys = false;
            this.__private__.keys = Object.keys(this);
        }
        return this.__private__.keys;
    }
    /**
     * Returns values within collection
     * @returns {Array<TValue>}
     */
    values() {
        return Object.values(this);
    }
    /**
     * Remove the key from collection.
     * @param {TKey} key
     */
    remove(key) {
        this.invalidate();
        delete this[key];
    }
    /**
     * Store value at the key.  The key has been tested with strings,
     *   but may support other types.
     * Value may be any data type.
     * @param {TKey} key - key of the key/value pair
     * @param {TValue} value - value of the key/value pair
     */
    set(key, value) {
        this.invalidate();
        this[key] = value;
    }
    /**
     * Returns the value
     * @param {TKey} key
     * @returns {TValue} the value
     */
    get(key) {
        return this[key];
    }
    /**
     * Returns the default value if key is not found or is null.
     * @param {TKey} key - key to lookup
     * @param defaultValue - the default value
     * @returns value of key or default value
     */
    getDefault(key, defaultValue) {
        if (this.has(key)) {
            return this[key];
        }
        else {
            return defaultValue;
        }
    }
    /**
     * Removes all keys from collection.
     * This is blocking.
     */
    empty() {
        this.forEach((key, value) => {
            this.remove(key);
        });
    }
    /**
     * @alias empty()
     */
    clear() {
        this.empty();
    }
    /**
     * Non-blocking method to remove all keys from collection.
     * @param {Function} cbComplete - cbComplete()
     */
    async asyncEmpty(cbComplete = null) {
        await this.asyncForEach((key, value, next) => {
            this.remove(key);
            next();
        });
        if (cbComplete != null)
            cbComplete();
    }
    /**
     * @ignore
     * @alias each
     */
    forEach(cb) {
        this.each(cb);
    }
    /**
     * Blocking loop helper method.
     * @param {Function} cbEach - cbEach(key:any,value:any)
     */
    each(cbEach) {
        for (let key in this) {
            if (this.has(key)) {
                if (cbEach(key, this[key]) === false)
                    break;
            }
        }
    }
    /**
     * Non-blocking loop helper method.
     * Must call cbNext within cbIterator to move to the next item in the collection.
     * Example:
     * <pre>
     *     await collection.asyncForEach(
     *        (key:any,value:any,cbNext:Function) => {
     *          console.log(key,value);
     * 	       	cbNext();
     *        });
     * </pre>
     * @param {Function} cbIterator - cbIterator(key:any,value:any,cbNext:Function)
     * @param {Function} cbComplete - Optional - cbComplete()
     * @returns {Promise<null>}
     */
    asyncForEach(cbIterator, cbComplete = null) {
        return new Promise((resolve) => {
            let keys = this.getKeys();
            let counter = 0;
            let len = keys.length;
            let next = () => {
                if (counter < len) {
                    process.nextTick(step);
                    //setTimeout(step,100);
                }
                else {
                    if (cbComplete != null)
                        cbComplete();
                    else
                        resolve();
                    return;
                }
            };
            let step = () => {
                if (counter < len) {
                    let key = keys[counter++];
                    if (cbIterator(key, this[key], next) == false) {
                        if (cbComplete != null)
                            cbComplete();
                        else
                            resolve();
                        return;
                    }
                }
                else {
                    if (cbComplete != null)
                        cbComplete();
                    else
                        resolve();
                    return;
                }
            };
            step();
        });
    }
    _copyValues(initial) {
        for (let prop in initial) {
            if (initial.hasOwnProperty(prop))
                this[prop] = initial[prop];
        }
    }
}
exports.Dictionary = Dictionary;

}).call(this,require('_process'))
},{"_process":3}],6:[function(require,module,exports){
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory) /* global define */
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.moo = factory()
  }
}(this, function() {
  'use strict';

  var hasOwnProperty = Object.prototype.hasOwnProperty
  var toString = Object.prototype.toString
  var hasSticky = typeof new RegExp().sticky === 'boolean'

  /***************************************************************************/

  function isRegExp(o) { return o && toString.call(o) === '[object RegExp]' }
  function isObject(o) { return o && typeof o === 'object' && !isRegExp(o) && !Array.isArray(o) }

  function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
  function reGroups(s) {
    var re = new RegExp('|' + s)
    return re.exec('').length - 1
  }
  function reCapture(s) {
    return '(' + s + ')'
  }
  function reUnion(regexps) {
    if (!regexps.length) return '(?!)'
    var source =  regexps.map(function(s) {
      return "(?:" + s + ")"
    }).join('|')
    return "(?:" + source + ")"
  }

  function regexpOrLiteral(obj) {
    if (typeof obj === 'string') {
      return '(?:' + reEscape(obj) + ')'

    } else if (isRegExp(obj)) {
      // TODO: consider /u support
      if (obj.ignoreCase) throw new Error('RegExp /i flag not allowed')
      if (obj.global) throw new Error('RegExp /g flag is implied')
      if (obj.sticky) throw new Error('RegExp /y flag is implied')
      if (obj.multiline) throw new Error('RegExp /m flag is implied')
      return obj.source

    } else {
      throw new Error('Not a pattern: ' + obj)
    }
  }

  function objectToRules(object) {
    var keys = Object.getOwnPropertyNames(object)
    var result = []
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var thing = object[key]
      var rules = [].concat(thing)
      if (key === 'include') {
        for (var j = 0; j < rules.length; j++) {
          result.push({include: rules[j]})
        }
        continue
      }
      var match = []
      rules.forEach(function(rule) {
        if (isObject(rule)) {
          if (match.length) result.push(ruleOptions(key, match))
          result.push(ruleOptions(key, rule))
          match = []
        } else {
          match.push(rule)
        }
      })
      if (match.length) result.push(ruleOptions(key, match))
    }
    return result
  }

  function arrayToRules(array) {
    var result = []
    for (var i = 0; i < array.length; i++) {
      var obj = array[i]
      if (obj.include) {
        var include = [].concat(obj.include)
        for (var j = 0; j < include.length; j++) {
          result.push({include: include[j]})
        }
        continue
      }
      if (!obj.type) {
        throw new Error('Rule has no type: ' + JSON.stringify(obj))
      }
      result.push(ruleOptions(obj.type, obj))
    }
    return result
  }

  function ruleOptions(type, obj) {
    if (!isObject(obj)) {
      obj = { match: obj }
    }
    if (obj.include) {
      throw new Error('Matching rules cannot also include states')
    }

    // nb. error and fallback imply lineBreaks
    var options = {
      defaultType: type,
      lineBreaks: !!obj.error || !!obj.fallback,
      pop: false,
      next: null,
      push: null,
      error: false,
      fallback: false,
      value: null,
      type: null,
      shouldThrow: false,
    }

    // Avoid Object.assign(), so we support IE9+
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        options[key] = obj[key]
      }
    }

    // type transform cannot be a string
    if (typeof options.type === 'string' && type !== options.type) {
      throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
    }

    // convert to array
    var match = options.match
    options.match = Array.isArray(match) ? match : match ? [match] : []
    options.match.sort(function(a, b) {
      return isRegExp(a) && isRegExp(b) ? 0
           : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
    })
    return options
  }

  function toRules(spec) {
    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
  }

  var defaultErrorRule = ruleOptions('error', {lineBreaks: true, shouldThrow: true})
  function compileRules(rules, hasStates) {
    var errorRule = null
    var fast = Object.create(null)
    var fastAllowed = true
    var unicodeFlag = null
    var groups = []
    var parts = []

    // If there is a fallback rule, then disable fast matching
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].fallback) {
        fastAllowed = false
      }
    }

    for (var i = 0; i < rules.length; i++) {
      var options = rules[i]

      if (options.include) {
        // all valid inclusions are removed by states() preprocessor
        throw new Error('Inheritance is not allowed in stateless lexers')
      }

      if (options.error || options.fallback) {
        // errorRule can only be set once
        if (errorRule) {
          if (!options.fallback === !errorRule.fallback) {
            throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
          } else {
            throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
          }
        }
        errorRule = options
      }

      var match = options.match.slice()
      if (fastAllowed) {
        while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
          var word = match.shift()
          fast[word.charCodeAt(0)] = options
        }
      }

      // Warn about inappropriate state-switching options
      if (options.pop || options.push || options.next) {
        if (!hasStates) {
          throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
        }
        if (options.fallback) {
          throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
        }
      }

      // Only rules with a .match are included in the RegExp
      if (match.length === 0) {
        continue
      }
      fastAllowed = false

      groups.push(options)

      // Check unicode flag is used everywhere or nowhere
      for (var j = 0; j < match.length; j++) {
        var obj = match[j]
        if (!isRegExp(obj)) {
          continue
        }

        if (unicodeFlag === null) {
          unicodeFlag = obj.unicode
        } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
          throw new Error('If one rule is /u then all must be')
        }
      }

      // convert to RegExp
      var pat = reUnion(match.map(regexpOrLiteral))

      // validate
      var regexp = new RegExp(pat)
      if (regexp.test("")) {
        throw new Error("RegExp matches empty string: " + regexp)
      }
      var groupCount = reGroups(pat)
      if (groupCount > 0) {
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
      }

      // try and detect rules matching newlines
      if (!options.lineBreaks && regexp.test('\n')) {
        throw new Error('Rule should declare lineBreaks: ' + regexp)
      }

      // store regex
      parts.push(reCapture(pat))
    }


    // If there's no fallback rule, use the sticky flag so we only look for
    // matches at the current index.
    //
    // If we don't support the sticky flag, then fake it using an irrefutable
    // match (i.e. an empty pattern).
    var fallbackRule = errorRule && errorRule.fallback
    var flags = hasSticky && !fallbackRule ? 'ym' : 'gm'
    var suffix = hasSticky || fallbackRule ? '' : '|'

    if (unicodeFlag === true) flags += "u"
    var combined = new RegExp(reUnion(parts) + suffix, flags)
    return {regexp: combined, groups: groups, fast: fast, error: errorRule || defaultErrorRule}
  }

  function compile(rules) {
    var result = compileRules(toRules(rules))
    return new Lexer({start: result}, 'start')
  }

  function checkStateGroup(g, name, map) {
    var state = g && (g.push || g.next)
    if (state && !map[state]) {
      throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
    }
    if (g && g.pop && +g.pop !== 1) {
      throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
    }
  }
  function compileStates(states, start) {
    var all = states.$all ? toRules(states.$all) : []
    delete states.$all

    var keys = Object.getOwnPropertyNames(states)
    if (!start) start = keys[0]

    var ruleMap = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      ruleMap[key] = toRules(states[key]).concat(all)
    }
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var rules = ruleMap[key]
      var included = Object.create(null)
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j]
        if (!rule.include) continue
        var splice = [j, 1]
        if (rule.include !== key && !included[rule.include]) {
          included[rule.include] = true
          var newRules = ruleMap[rule.include]
          if (!newRules) {
            throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
          }
          for (var k = 0; k < newRules.length; k++) {
            var newRule = newRules[k]
            if (rules.indexOf(newRule) !== -1) continue
            splice.push(newRule)
          }
        }
        rules.splice.apply(rules, splice)
        j--
      }
    }

    var map = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      map[key] = compileRules(ruleMap[key], true)
    }

    for (var i = 0; i < keys.length; i++) {
      var name = keys[i]
      var state = map[name]
      var groups = state.groups
      for (var j = 0; j < groups.length; j++) {
        checkStateGroup(groups[j], name, map)
      }
      var fastKeys = Object.getOwnPropertyNames(state.fast)
      for (var j = 0; j < fastKeys.length; j++) {
        checkStateGroup(state.fast[fastKeys[j]], name, map)
      }
    }

    return new Lexer(map, start)
  }

  function keywordTransform(map) {
    var reverseMap = Object.create(null)
    var byLength = Object.create(null)
    var types = Object.getOwnPropertyNames(map)
    for (var i = 0; i < types.length; i++) {
      var tokenType = types[i]
      var item = map[tokenType]
      var keywordList = Array.isArray(item) ? item : [item]
      keywordList.forEach(function(keyword) {
        (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword)
        if (typeof keyword !== 'string') {
          throw new Error("keyword must be string (in keyword '" + tokenType + "')")
        }
        reverseMap[keyword] = tokenType
      })
    }

    // fast string lookup
    // https://jsperf.com/string-lookups
    function str(x) { return JSON.stringify(x) }
    var source = ''
    source += 'switch (value.length) {\n'
    for (var length in byLength) {
      var keywords = byLength[length]
      source += 'case ' + length + ':\n'
      source += 'switch (value) {\n'
      keywords.forEach(function(keyword) {
        var tokenType = reverseMap[keyword]
        source += 'case ' + str(keyword) + ': return ' + str(tokenType) + '\n'
      })
      source += '}\n'
    }
    source += '}\n'
    return Function('value', source) // type
  }

  /***************************************************************************/

  var Lexer = function(states, state) {
    this.startState = state
    this.states = states
    this.buffer = ''
    this.stack = []
    this.reset()
  }

  Lexer.prototype.reset = function(data, info) {
    this.buffer = data || ''
    this.index = 0
    this.line = info ? info.line : 1
    this.col = info ? info.col : 1
    this.queuedToken = info ? info.queuedToken : null
    this.queuedThrow = info ? info.queuedThrow : null
    this.setState(info ? info.state : this.startState)
    this.stack = info && info.stack ? info.stack.slice() : []
    return this
  }

  Lexer.prototype.save = function() {
    return {
      line: this.line,
      col: this.col,
      state: this.state,
      stack: this.stack.slice(),
      queuedToken: this.queuedToken,
      queuedThrow: this.queuedThrow,
    }
  }

  Lexer.prototype.setState = function(state) {
    if (!state || this.state === state) return
    this.state = state
    var info = this.states[state]
    this.groups = info.groups
    this.error = info.error
    this.re = info.regexp
    this.fast = info.fast
  }

  Lexer.prototype.popState = function() {
    this.setState(this.stack.pop())
  }

  Lexer.prototype.pushState = function(state) {
    this.stack.push(this.state)
    this.setState(state)
  }

  var eat = hasSticky ? function(re, buffer) { // assume re is /y
    return re.exec(buffer)
  } : function(re, buffer) { // assume re is /g
    var match = re.exec(buffer)
    // will always match, since we used the |(?:) trick
    if (match[0].length === 0) {
      return null
    }
    return match
  }

  Lexer.prototype._getGroup = function(match) {
    var groupCount = this.groups.length
    for (var i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return this.groups[i]
      }
    }
    throw new Error('Cannot find token type for matched text')
  }

  function tokenToString() {
    return this.value
  }

  Lexer.prototype.next = function() {
    var index = this.index

    // If a fallback token matched, we don't need to re-run the RegExp
    if (this.queuedGroup) {
      var token = this._token(this.queuedGroup, this.queuedText, index)
      this.queuedGroup = null
      this.queuedText = ""
      return token
    }

    var buffer = this.buffer
    if (index === buffer.length) {
      return // EOF
    }

    // Fast matching for single characters
    var group = this.fast[buffer.charCodeAt(index)]
    if (group) {
      return this._token(group, buffer.charAt(index), index)
    }

    // Execute RegExp
    var re = this.re
    re.lastIndex = index
    var match = eat(re, buffer)

    // Error tokens match the remaining buffer
    var error = this.error
    if (match == null) {
      return this._token(error, buffer.slice(index, buffer.length), index)
    }

    var group = this._getGroup(match)
    var text = match[0]

    if (error.fallback && match.index !== index) {
      this.queuedGroup = group
      this.queuedText = text

      // Fallback tokens contain the unmatched portion of the buffer
      return this._token(error, buffer.slice(index, match.index), index)
    }

    return this._token(group, text, index)
  }

  Lexer.prototype._token = function(group, text, offset) {
    // count line breaks
    var lineBreaks = 0
    if (group.lineBreaks) {
      var matchNL = /\n/g
      var nl = 1
      if (text === '\n') {
        lineBreaks = 1
      } else {
        while (matchNL.exec(text)) { lineBreaks++; nl = matchNL.lastIndex }
      }
    }

    var token = {
      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
      value: typeof group.value === 'function' ? group.value(text) : text,
      text: text,
      toString: tokenToString,
      offset: offset,
      lineBreaks: lineBreaks,
      line: this.line,
      col: this.col,
    }
    // nb. adding more props to token object will make V8 sad!

    var size = text.length
    this.index += size
    this.line += lineBreaks
    if (lineBreaks !== 0) {
      this.col = size - nl + 1
    } else {
      this.col += size
    }

    // throw, if no rule with {error: true}
    if (group.shouldThrow) {
      throw new Error(this.formatError(token, "invalid syntax"))
    }

    if (group.pop) this.popState()
    else if (group.push) this.pushState(group.push)
    else if (group.next) this.setState(group.next)

    return token
  }

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    var LexerIterator = function(lexer) {
      this.lexer = lexer
    }

    LexerIterator.prototype.next = function() {
      var token = this.lexer.next()
      return {value: token, done: !token}
    }

    LexerIterator.prototype[Symbol.iterator] = function() {
      return this
    }

    Lexer.prototype[Symbol.iterator] = function() {
      return new LexerIterator(this)
    }
  }

  Lexer.prototype.formatError = function(token, message) {
    if (token == null) {
      // An undefined token indicates EOF
      var text = this.buffer.slice(this.index)
      var token = {
        text: text,
        offset: this.index,
        lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
        line: this.line,
        col: this.col,
      }
    }
    var start = Math.max(0, token.offset - token.col + 1)
    var eol = token.lineBreaks ? token.text.indexOf('\n') : token.text.length
    var firstLine = this.buffer.substring(start, token.offset + eol)
    message += " at line " + token.line + " col " + token.col + ":\n\n"
    message += "  " + firstLine + "\n"
    message += "  " + Array(token.col).join(" ") + "^"
    return message
  }

  Lexer.prototype.clone = function() {
    return new Lexer(this.states, this.state)
  }

  Lexer.prototype.has = function(tokenType) {
    return true
  }


  return {
    compile: compile,
    states: compileStates,
    error: Object.freeze({error: true}),
    fallback: Object.freeze({fallback: true}),
    keywords: keywordTransform,
  }

}));

},{}],7:[function(require,module,exports){
(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.nearley = factory();
    }
}(this, function() {

    function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols;        // a list of literal | regex class | nonterminal
        this.postprocess = postprocess;
        return this;
    }
    Rule.highestId = 0;

    Rule.prototype.toString = function(withCursorAt) {
        function stringifySymbolSequence (e) {
            return e.literal ? JSON.stringify(e.literal) :
                   e.type ? '%' + e.type : e.toString();
        }
        var symbolSequence = (typeof withCursorAt === "undefined")
                             ? this.symbols.map(stringifySymbolSequence).join(' ')
                             : (   this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ')
                                 + " ● "
                                 + this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ')     );
        return this.name + " → " + symbolSequence;
    }


    // a State is a rule at a position from a given starting point in the input stream (reference)
    function State(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
    }

    State.prototype.toString = function() {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
    };

    State.prototype.nextState = function(child) {
        var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
            state.data = state.build();
        }
        return state;
    };

    State.prototype.build = function() {
        var children = [];
        var node = this;
        do {
            children.push(node.right.data);
            node = node.left;
        } while (node.left);
        children.reverse();
        return children;
    };

    State.prototype.finish = function() {
        if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
    };


    function Column(grammar, index) {
        this.grammar = grammar;
        this.index = index;
        this.states = [];
        this.wants = {}; // states indexed by the non-terminal they expect
        this.scannable = []; // list of states that expect a token
        this.completed = {}; // states that are nullable
    }


    Column.prototype.process = function(nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;

        for (var w = 0; w < states.length; w++) { // nb. we push() during iteration
            var state = states[w];

            if (state.isComplete) {
                state.finish();
                if (state.data !== Parser.fail) {
                    // complete
                    var wantedBy = state.wantedBy;
                    for (var i = wantedBy.length; i--; ) { // this line is hot
                        var left = wantedBy[i];
                        this.complete(left, state);
                    }

                    // special-case nullables
                    if (state.reference === this.index) {
                        // make sure future predictors of this rule get completed.
                        var exp = state.rule.name;
                        (this.completed[exp] = this.completed[exp] || []).push(state);
                    }
                }

            } else {
                // queue scannable states
                var exp = state.rule.symbols[state.dot];
                if (typeof exp !== 'string') {
                    this.scannable.push(state);
                    continue;
                }

                // predict
                if (wants[exp]) {
                    wants[exp].push(state);

                    if (completed.hasOwnProperty(exp)) {
                        var nulls = completed[exp];
                        for (var i = 0; i < nulls.length; i++) {
                            var right = nulls[i];
                            this.complete(state, right);
                        }
                    }
                } else {
                    wants[exp] = [state];
                    this.predict(exp);
                }
            }
        }
    }

    Column.prototype.predict = function(exp) {
        var rules = this.grammar.byName[exp] || [];

        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var wantedBy = this.wants[exp];
            var s = new State(r, 0, this.index, wantedBy);
            this.states.push(s);
        }
    }

    Column.prototype.complete = function(left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
    }


    function Grammar(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function(rule) {
            if (!byName.hasOwnProperty(rule.name)) {
                byName[rule.name] = [];
            }
            byName[rule.name].push(rule);
        });
    }

    // So we can allow passing (rules, start) directly to Parser for backwards compatibility
    Grammar.fromCompiled = function(rules, start) {
        var lexer = rules.Lexer;
        if (rules.ParserStart) {
          start = rules.ParserStart;
          rules = rules.ParserRules;
        }
        var rules = rules.map(function (r) { return (new Rule(r.name, r.symbols, r.postprocess)); });
        var g = new Grammar(rules, start);
        g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable
        return g;
    }


    function StreamLexer() {
      this.reset("");
    }

    StreamLexer.prototype.reset = function(data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
    }

    StreamLexer.prototype.next = function() {
        if (this.index < this.buffer.length) {
            var ch = this.buffer[this.index++];
            if (ch === '\n') {
              this.line += 1;
              this.lastLineBreak = this.index;
            }
            return {value: ch};
        }
    }

    StreamLexer.prototype.save = function() {
      return {
        line: this.line,
        col: this.index - this.lastLineBreak,
      }
    }

    StreamLexer.prototype.formatError = function(token, message) {
        // nb. this gets called after consuming the offending token,
        // so the culprit is index-1
        var buffer = this.buffer;
        if (typeof buffer === 'string') {
            var nextLineBreak = buffer.indexOf('\n', this.index);
            if (nextLineBreak === -1) nextLineBreak = buffer.length;
            var line = buffer.substring(this.lastLineBreak, nextLineBreak)
            var col = this.index - this.lastLineBreak;
            message += " at line " + this.line + " col " + col + ":\n\n";
            message += "  " + line + "\n"
            message += "  " + Array(col).join(" ") + "^"
            return message;
        } else {
            return message + " at index " + (this.index - 1);
        }
    }


    function Parser(rules, start, options) {
        if (rules instanceof Grammar) {
            var grammar = rules;
            var options = start;
        } else {
            var grammar = Grammar.fromCompiled(rules, start);
        }
        this.grammar = grammar;

        // Read options
        this.options = {
            keepHistory: false,
            lexer: grammar.lexer || new StreamLexer,
        };
        for (var key in (options || {})) {
            this.options[key] = options[key];
        }

        // Setup lexer
        this.lexer = this.options.lexer;
        this.lexerState = undefined;

        // Setup a table
        var column = new Column(grammar, 0);
        var table = this.table = [column];

        // I could be expecting anything.
        column.wants[grammar.start] = [];
        column.predict(grammar.start);
        // TODO what if start rule is nullable?
        column.process();
        this.current = 0; // token index
    }

    // create a reserved token for indicating a parse fail
    Parser.fail = {};

    Parser.prototype.feed = function(chunk) {
        var lexer = this.lexer;
        lexer.reset(chunk, this.lexerState);

        var token;
        while (token = lexer.next()) {
            // We add new states to table[current+1]
            var column = this.table[this.current];

            // GC unused states
            if (!this.options.keepHistory) {
                delete this.table[this.current - 1];
            }

            var n = this.current + 1;
            var nextColumn = new Column(this.grammar, n);
            this.table.push(nextColumn);

            // Advance all tokens that expect the symbol
            var literal = token.text !== undefined ? token.text : token.value;
            var value = lexer.constructor === StreamLexer ? token.value : token;
            var scannable = column.scannable;
            for (var w = scannable.length; w--; ) {
                var state = scannable[w];
                var expect = state.rule.symbols[state.dot];
                // Try to consume the token
                // either regex or literal
                if (expect.test ? expect.test(value) :
                    expect.type ? expect.type === token.type
                                : expect.literal === literal) {
                    // Add it
                    var next = state.nextState({data: value, token: token, isToken: true, reference: n - 1});
                    nextColumn.states.push(next);
                }
            }

            // Next, for each of the rules, we either
            // (a) complete it, and try to see if the reference row expected that
            //     rule
            // (b) predict the next nonterminal it expects by adding that
            //     nonterminal's start state
            // To prevent duplication, we also keep track of rules we have already
            // added

            nextColumn.process();

            // If needed, throw an error:
            if (nextColumn.states.length === 0) {
                // No states at all! This is not good.
                var err = new Error(this.reportError(token));
                err.offset = this.current;
                err.token = token;
                throw err;
            }

            // maybe save lexer state
            if (this.options.keepHistory) {
              column.lexerState = lexer.save()
            }

            this.current++;
        }
        if (column) {
          this.lexerState = lexer.save()
        }

        // Incrementally keep track of results
        this.results = this.finish();

        // Allow chaining, for whatever it's worth
        return this;
    };

    Parser.prototype.reportError = function(token) {
        var lines = [];
        var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
        lines.push(this.lexer.formatError(token, "Syntax error"));
        lines.push('Unexpected ' + tokenDisplay + '. Instead, I was expecting to see one of the following:\n');
        var lastColumnIndex = this.table.length - 2;
        var lastColumn = this.table[lastColumnIndex];
        var expectantStates = lastColumn.states
            .filter(function(state) {
                var nextSymbol = state.rule.symbols[state.dot];
                return nextSymbol && typeof nextSymbol !== "string";
            });
        
        // Display a "state stack" for each expectant state
        // - which shows you how this state came to be, step by step. 
        // If there is more than one derivation, we only display the first one.
        var stateStacks = expectantStates
            .map(function(state) {
                var stacks = this.buildStateStacks(state, []);
                return stacks[0];
            }, this);
        // Display each state that is expecting a terminal symbol next.
        stateStacks.forEach(function(stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];
            var symbolDisplay = this.getSymbolDisplay(nextSymbol);
            lines.push('A ' + symbolDisplay + ' based on:');
            this.displayStateStack(stateStack, lines);
        }, this);
            
        lines.push("");
        return lines.join("\n");
    };

    Parser.prototype.displayStateStack = function(stateStack, lines) {
        var lastDisplay;
        var sameDisplayCount = 0;
        for (var j = 0; j < stateStack.length; j++) {
            var state = stateStack[j];
            var display = state.rule.toString(state.dot);
            if (display === lastDisplay) {
                sameDisplayCount++;
            } else {
                if (sameDisplayCount > 0) {
                    lines.push('    ⬆ ︎' + sameDisplayCount + ' more lines identical to this');
                }
                sameDisplayCount = 0;
                lines.push('    ' + display);
            }
            lastDisplay = display;
        }
    };

    Parser.prototype.getSymbolDisplay = function(symbol) {
        var type = typeof symbol;
        if (type === "string") {
            return symbol;
        } else if (type === "object" && symbol.literal) {
            return JSON.stringify(symbol.literal);
        } else if (type === "object" && symbol instanceof RegExp) {
            return 'character matching ' + symbol;
        } else if (type === "object" && symbol.type) {
            return symbol.type + ' token';
        } else {
            throw new Error('Unknown symbol type: ' + symbol);
        }
    };

    /*
    Builds a number of "state stacks". You can think of a state stack as the call stack
    of the recursive-descent parser which the Nearley parse algorithm simulates.
    A state stack is represented as an array of state objects. Within a 
    state stack, the first item of the array will be the starting
    state, with each successive item in the array going further back into history.
    
    This function needs to be given a starting state and an empty array representing
    the visited states, and it returns an array of state stacks. 
    
    */
    Parser.prototype.buildStateStacks = function(state, visited) {
        if (visited.indexOf(state) !== -1) {
            // Found cycle, return empty array (meaning no stacks)
            // to eliminate this path from the results, because
            // we don't know how to display it meaningfully
            return [];
        }
        if (state.wantedBy.length === 0) {
            return [[state]];
        }
        var that = this;

        return state.wantedBy.reduce(function(stacks, prevState) {
            return stacks.concat(that.buildStateStacks(
                prevState,
                [state].concat(visited))
                .map(function(stack) {
                    return [state].concat(stack);
                }));
        }, []);
    };

    Parser.prototype.save = function() {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
    };

    Parser.prototype.restore = function(column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;

        // Incrementally keep track of results
        this.results = this.finish();
    };

    // nb. deprecated: use save/restore instead!
    Parser.prototype.rewind = function(index) {
        if (!this.options.keepHistory) {
            throw new Error('set option `keepHistory` to enable rewinding')
        }
        // nb. recall column (table) indicies fall between token indicies.
        //        col 0   --   token 0   --   col 1
        this.restore(this.table[index]);
    };

    Parser.prototype.finish = function() {
        // Return the possible parsings
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1]
        column.states.forEach(function (t) {
            if (t.rule.name === start
                    && t.dot === t.rule.symbols.length
                    && t.reference === 0
                    && t.data !== Parser.fail) {
                considerations.push(t);
            }
        });
        return considerations.map(function(c) {return c.data; });
    };

    return {
        Parser: Parser,
        Grammar: Grammar,
        Rule: Rule,
    };

}));

},{}],8:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
class ArraySet {
  constructor() {
    this._array = [];
    this._set = new Map();
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  static fromArray(aArray, aAllowDuplicates) {
    const set = new ArraySet();
    for (let i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  }

  /**
   * Return how many unique items are in this ArraySet. If duplicates have been
   * added, than those do not count towards the size.
   *
   * @returns Number
   */
  size() {
    return this._set.size;
  }

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  add(aStr, aAllowDuplicates) {
    const isDuplicate = this.has(aStr);
    const idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set.set(aStr, idx);
    }
  }

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  has(aStr) {
      return this._set.has(aStr);
  }

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  indexOf(aStr) {
    const idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
    throw new Error('"' + aStr + '" is not in the set.');
  }

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error("No element indexed by " + aIdx);
  }

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  toArray() {
    return this._array.slice();
  }
}
exports.ArraySet = ArraySet;

},{}],9:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const base64 = require("./base64");

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

const VLQ_BASE_SHIFT = 5;

// binary: 100000
const VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
const VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
const VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
// eslint-disable-next-line no-unused-vars
function fromVLQSigned(aValue) {
  const isNegative = (aValue & 1) === 1;
  const shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  let encoded = "";
  let digit;

  let vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

},{"./base64":10}],10:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function(number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

},{}],11:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  const mid = Math.floor((aHigh - aLow) / 2) + aLow;
  const cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  } else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    }
    return mid;
  }

  // Our needle is less than aHaystack[mid].
  if (mid - aLow > 1) {
    // The element is in the lower half.
    return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
  }

  // we are in termination case (3) or (2) and return the appropriate thing.
  if (aBias == exports.LEAST_UPPER_BOUND) {
    return mid;
  }
  return aLow < 0 ? -1 : aLow;
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  let index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],12:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const util = require("./util");

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  const lineA = mappingA.generatedLine;
  const lineB = mappingB.generatedLine;
  const columnA = mappingA.generatedColumn;
  const columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a negligible overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
class MappingList {
  constructor() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  unsortedForEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  }

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  add(aMapping) {
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  }

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositionsInflated);
      this._sorted = true;
    }
    return this._array;
  }
}

exports.MappingList = MappingList;

},{"./util":17}],13:[function(require,module,exports){
(function (__dirname){
if (typeof fetch === "function") {
  // Web version of reading a wasm file into an array buffer.

  let mappingsWasmUrl = null;

  module.exports = function readWasm() {
    if (typeof mappingsWasmUrl !== "string") {
      throw new Error("You must provide the URL of lib/mappings.wasm by calling " +
                      "SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) " +
                      "before using SourceMapConsumer");
    }

    return fetch(mappingsWasmUrl)
      .then(response => response.arrayBuffer());
  };

  module.exports.initialize = url => mappingsWasmUrl = url;
} else {
  // Node version of reading a wasm file into an array buffer.
  const fs = require("fs");
  const path = require("path");

  module.exports = function readWasm() {
    return new Promise((resolve, reject) => {
      const wasmPath = path.join(__dirname, "mappings.wasm");
      fs.readFile(wasmPath, null, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(data.buffer);
      });
    });
  };

  module.exports.initialize = _ => {
    console.debug("SourceMapConsumer.initialize is a no-op when running in node.js");
  };
}

}).call(this,"/../../node_modules/source-map/lib")
},{"fs":1,"path":2}],14:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const util = require("./util");
const binarySearch = require("./binary-search");
const ArraySet = require("./array-set").ArraySet;
const base64VLQ = require("./base64-vlq"); // eslint-disable-line no-unused-vars
const readWasm = require("../lib/read-wasm");
const wasm = require("./wasm");

const INTERNAL = Symbol("smcInternal");

class SourceMapConsumer {
  constructor(aSourceMap, aSourceMapURL) {
    // If the constructor was called by super(), just return Promise<this>.
    // Yes, this is a hack to retain the pre-existing API of the base-class
    // constructor also being an async factory function.
    if (aSourceMap == INTERNAL) {
      return Promise.resolve(this);
    }

    return _factory(aSourceMap, aSourceMapURL);
  }

  static initialize(opts) {
    readWasm.initialize(opts["lib/mappings.wasm"]);
  }

  static fromSourceMap(aSourceMap, aSourceMapURL) {
    return _factoryBSM(aSourceMap, aSourceMapURL);
  }

  /**
   * Construct a new `SourceMapConsumer` from `rawSourceMap` and `sourceMapUrl`
   * (see the `SourceMapConsumer` constructor for details. Then, invoke the `async
   * function f(SourceMapConsumer) -> T` with the newly constructed consumer, wait
   * for `f` to complete, call `destroy` on the consumer, and return `f`'s return
   * value.
   *
   * You must not use the consumer after `f` completes!
   *
   * By using `with`, you do not have to remember to manually call `destroy` on
   * the consumer, since it will be called automatically once `f` completes.
   *
   * ```js
   * const xSquared = await SourceMapConsumer.with(
   *   myRawSourceMap,
   *   null,
   *   async function (consumer) {
   *     // Use `consumer` inside here and don't worry about remembering
   *     // to call `destroy`.
   *
   *     const x = await whatever(consumer);
   *     return x * x;
   *   }
   * );
   *
   * // You may not use that `consumer` anymore out here; it has
   * // been destroyed. But you can use `xSquared`.
   * console.log(xSquared);
   * ```
   */
  static with(rawSourceMap, sourceMapUrl, f) {
    // Note: The `acorn` version that `webpack` currently depends on doesn't
    // support `async` functions, and the nodes that we support don't all have
    // `.finally`. Therefore, this is written a bit more convolutedly than it
    // should really be.

    let consumer = null;
    const promise = new SourceMapConsumer(rawSourceMap, sourceMapUrl);
    return promise
      .then(c => {
        consumer = c;
        return f(c);
      })
      .then(x => {
        if (consumer) {
          consumer.destroy();
        }
        return x;
      }, e => {
        if (consumer) {
          consumer.destroy();
        }
        throw e;
      });
  }

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  _parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  }

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  eachMapping(aCallback, aContext, aOrder) {
    throw new Error("Subclasses must implement eachMapping");
  }

  /**
   * Returns all generated line and column information for the original source,
   * line, and column provided. If no column is provided, returns all mappings
   * corresponding to a either the line we are searching for or the next
   * closest line that has any mappings. Otherwise, returns all mappings
   * corresponding to the given line and either the column we are searching for
   * or the next closest column that has any offsets.
   *
   * The only argument is an object with the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number is 1-based.
   *   - column: Optional. the column number in the original source.
   *    The column number is 0-based.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *    line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *    The column number is 0-based.
   */
  allGeneratedPositionsFor(aArgs) {
    throw new Error("Subclasses must implement allGeneratedPositionsFor");
  }

  destroy() {
    throw new Error("Subclasses must implement destroy");
  }
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;
SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
class BasicSourceMapConsumer extends SourceMapConsumer {
  constructor(aSourceMap, aSourceMapURL) {
    return super(INTERNAL).then(that => {
      let sourceMap = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap = util.parseSourceMapInput(aSourceMap);
      }

      const version = util.getArg(sourceMap, "version");
      let sources = util.getArg(sourceMap, "sources");
      // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
      // requires the array) to play nice here.
      const names = util.getArg(sourceMap, "names", []);
      let sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
      const sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
      const mappings = util.getArg(sourceMap, "mappings");
      const file = util.getArg(sourceMap, "file", null);

      // Once again, Sass deviates from the spec and supplies the version as a
      // string rather than a number, so we use loose equality checking here.
      if (version != that._version) {
        throw new Error("Unsupported version: " + version);
      }

      if (sourceRoot) {
        sourceRoot = util.normalize(sourceRoot);
      }

      sources = sources
        .map(String)
        // Some source maps produce relative source paths like "./foo.js" instead of
        // "foo.js".  Normalize these first so that future comparisons will succeed.
        // See bugzil.la/1090768.
        .map(util.normalize)
        // Always ensure that absolute sources are internally stored relative to
        // the source root, if the source root is absolute. Not doing this would
        // be particularly problematic when the source root is a prefix of the
        // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
        .map(function(source) {
          return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
            ? util.relative(sourceRoot, source)
            : source;
        });

      // Pass `true` below to allow duplicate names and sources. While source maps
      // are intended to be compressed and deduplicated, the TypeScript compiler
      // sometimes generates source maps with duplicates in them. See Github issue
      // #72 and bugzil.la/889492.
      that._names = ArraySet.fromArray(names.map(String), true);
      that._sources = ArraySet.fromArray(sources, true);

      that._absoluteSources = that._sources.toArray().map(function(s) {
        return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
      });

      that.sourceRoot = sourceRoot;
      that.sourcesContent = sourcesContent;
      that._mappings = mappings;
      that._sourceMapURL = aSourceMapURL;
      that.file = file;

      that._computedColumnSpans = false;
      that._mappingsPtr = 0;
      that._wasm = null;

      return wasm().then(w => {
        that._wasm = w;
        return that;
      });
    });
  }

  /**
   * Utility function to find the index of a source.  Returns -1 if not
   * found.
   */
  _findSourceIndex(aSource) {
    let relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    if (this._sources.has(relativeSource)) {
      return this._sources.indexOf(relativeSource);
    }

    // Maybe aSource is an absolute URL as returned by |sources|.  In
    // this case we can't simply undo the transform.
    for (let i = 0; i < this._absoluteSources.length; ++i) {
      if (this._absoluteSources[i] == aSource) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Create a BasicSourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @param String aSourceMapURL
   *        The URL at which the source map can be found (optional)
   * @returns BasicSourceMapConsumer
   */
  static fromSourceMap(aSourceMap, aSourceMapURL) {
    return new BasicSourceMapConsumer(aSourceMap.toString());
  }

  get sources() {
    return this._absoluteSources.slice();
  }

  _getMappingsPtr() {
    if (this._mappingsPtr === 0) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this._mappingsPtr;
  }

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  _parseMappings(aStr, aSourceRoot) {
    const size = aStr.length;

    const mappingsBufPtr = this._wasm.exports.allocate_mappings(size);
    const mappingsBuf = new Uint8Array(this._wasm.exports.memory.buffer, mappingsBufPtr, size);
    for (let i = 0; i < size; i++) {
      mappingsBuf[i] = aStr.charCodeAt(i);
    }

    const mappingsPtr = this._wasm.exports.parse_mappings(mappingsBufPtr);

    if (!mappingsPtr) {
      const error = this._wasm.exports.get_last_error();
      let msg = `Error parsing mappings (code ${error}): `;

      // XXX: keep these error codes in sync with `fitzgen/source-map-mappings`.
      switch (error) {
        case 1:
          msg += "the mappings contained a negative line, column, source index, or name index";
          break;
        case 2:
          msg += "the mappings contained a number larger than 2**32";
          break;
        case 3:
          msg += "reached EOF while in the middle of parsing a VLQ";
          break;
        case 4:
          msg += "invalid base 64 character while parsing a VLQ";
          break;
        default:
          msg += "unknown error code";
          break;
      }

      throw new Error(msg);
    }

    this._mappingsPtr = mappingsPtr;
  }

  eachMapping(aCallback, aContext, aOrder) {
    const context = aContext || null;
    const order = aOrder || SourceMapConsumer.GENERATED_ORDER;
    const sourceRoot = this.sourceRoot;

    this._wasm.withMappingCallback(
      mapping => {
        if (mapping.source !== null) {
          mapping.source = this._sources.at(mapping.source);
          mapping.source = util.computeSourceURL(sourceRoot, mapping.source, this._sourceMapURL);

          if (mapping.name !== null) {
            mapping.name = this._names.at(mapping.name);
          }
        }

        aCallback.call(context, mapping);
      },
      () => {
        switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          this._wasm.exports.by_generated_location(this._getMappingsPtr());
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          this._wasm.exports.by_original_location(this._getMappingsPtr());
          break;
        default:
          throw new Error("Unknown order of iteration.");
        }
      }
    );
  }

  allGeneratedPositionsFor(aArgs) {
    let source = util.getArg(aArgs, "source");
    const originalLine = util.getArg(aArgs, "line");
    const originalColumn = aArgs.column || 0;

    source = this._findSourceIndex(source);
    if (source < 0) {
      return [];
    }

    if (originalLine < 1) {
      throw new Error("Line numbers must be >= 1");
    }

    if (originalColumn < 0) {
      throw new Error("Column numbers must be >= 0");
    }

    const mappings = [];

    this._wasm.withMappingCallback(
      m => {
        let lastColumn = m.lastGeneratedColumn;
        if (this._computedColumnSpans && lastColumn === null) {
          lastColumn = Infinity;
        }
        mappings.push({
          line: m.generatedLine,
          column: m.generatedColumn,
          lastColumn,
        });
      }, () => {
        this._wasm.exports.all_generated_locations_for(
          this._getMappingsPtr(),
          source,
          originalLine - 1,
          "column" in aArgs,
          originalColumn
        );
      }
    );

    return mappings;
  }

  destroy() {
    if (this._mappingsPtr !== 0) {
      this._wasm.exports.free_mappings(this._mappingsPtr);
      this._mappingsPtr = 0;
    }
  }

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  computeColumnSpans() {
    if (this._computedColumnSpans) {
      return;
    }

    this._wasm.exports.compute_column_spans(this._getMappingsPtr());
    this._computedColumnSpans = true;
  }

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.  The line number
   *     is 1-based.
   *   - column: The column number in the generated source.  The column
   *     number is 0-based.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the original source, or null.  The
   *     column number is 0-based.
   *   - name: The original identifier, or null.
   */
  originalPositionFor(aArgs) {
    const needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };

    if (needle.generatedLine < 1) {
      throw new Error("Line numbers must be >= 1");
    }

    if (needle.generatedColumn < 0) {
      throw new Error("Column numbers must be >= 0");
    }

    let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
    if (bias == null) {
      bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
    }

    let mapping;
    this._wasm.withMappingCallback(m => mapping = m, () => {
      this._wasm.exports.original_location_for(
        this._getMappingsPtr(),
        needle.generatedLine - 1,
        needle.generatedColumn,
        bias
      );
    });

    if (mapping) {
      if (mapping.generatedLine === needle.generatedLine) {
        let source = util.getArg(mapping, "source", null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }

        let name = util.getArg(mapping, "name", null);
        if (name !== null) {
          name = this._names.at(name);
        }

        return {
          source,
          line: util.getArg(mapping, "originalLine", null),
          column: util.getArg(mapping, "originalColumn", null),
          name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  }

  /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */
  hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function(sc) { return sc == null; });
  }

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */
  sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    const index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    let relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    let url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      const fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }

    throw new Error('"' + relativeSource + '" is not in the SourceMap.');
  }

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number
   *     is 1-based.
   *   - column: The column number in the original source.  The column
   *     number is 0-based.
   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
   *     closest element that is smaller than or greater than the one we are
   *     searching for, respectively, if the exact element cannot be found.
   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *     The column number is 0-based.
   */
  generatedPositionFor(aArgs) {
    let source = util.getArg(aArgs, "source");
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    const needle = {
      source,
      originalLine: util.getArg(aArgs, "line"),
      originalColumn: util.getArg(aArgs, "column")
    };

    if (needle.originalLine < 1) {
      throw new Error("Line numbers must be >= 1");
    }

    if (needle.originalColumn < 0) {
      throw new Error("Column numbers must be >= 0");
    }

    let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
    if (bias == null) {
      bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
    }

    let mapping;
    this._wasm.withMappingCallback(m => mapping = m, () => {
      this._wasm.exports.generated_location_for(
        this._getMappingsPtr(),
        needle.source,
        needle.originalLine - 1,
        needle.originalColumn,
        bias
      );
    });

    if (mapping) {
      if (mapping.source === needle.source) {
        let lastColumn = mapping.lastGeneratedColumn;
        if (this._computedColumnSpans && lastColumn === null) {
          lastColumn = Infinity;
        }
        return {
          line: util.getArg(mapping, "generatedLine", null),
          column: util.getArg(mapping, "generatedColumn", null),
          lastColumn,
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  }
}

BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
class IndexedSourceMapConsumer extends SourceMapConsumer {
  constructor(aSourceMap, aSourceMapURL) {
    return super(INTERNAL).then(that => {
      let sourceMap = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap = util.parseSourceMapInput(aSourceMap);
      }

      const version = util.getArg(sourceMap, "version");
      const sections = util.getArg(sourceMap, "sections");

      if (version != that._version) {
        throw new Error("Unsupported version: " + version);
      }

      that._sources = new ArraySet();
      that._names = new ArraySet();
      that.__generatedMappings = null;
      that.__originalMappings = null;
      that.__generatedMappingsUnsorted = null;
      that.__originalMappingsUnsorted = null;

      let lastOffset = {
        line: -1,
        column: 0
      };
      return Promise.all(sections.map(s => {
        if (s.url) {
          // The url field will require support for asynchronicity.
          // See https://github.com/mozilla/source-map/issues/16
          throw new Error("Support for url field in sections not implemented.");
        }
        const offset = util.getArg(s, "offset");
        const offsetLine = util.getArg(offset, "line");
        const offsetColumn = util.getArg(offset, "column");

        if (offsetLine < lastOffset.line ||
            (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
          throw new Error("Section offsets must be ordered and non-overlapping.");
        }
        lastOffset = offset;

        const cons = new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL);
        return cons.then(consumer => {
          return {
            generatedOffset: {
              // The offset fields are 0-based, but we use 1-based indices when
              // encoding/decoding from VLQ.
              generatedLine: offsetLine + 1,
              generatedColumn: offsetColumn + 1
            },
            consumer
          };
        });
      })).then(s => {
        that._sections = s;
        return that;
      });
    });
  }

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.
  get _generatedMappings() {
    if (!this.__generatedMappings) {
      this._sortGeneratedMappings();
    }

    return this.__generatedMappings;
  }

  get _originalMappings() {
    if (!this.__originalMappings) {
      this._sortOriginalMappings();
    }

    return this.__originalMappings;
  }

  get _generatedMappingsUnsorted() {
    if (!this.__generatedMappingsUnsorted) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappingsUnsorted;
  }

  get _originalMappingsUnsorted() {
    if (!this.__originalMappingsUnsorted) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappingsUnsorted;
  }

  _sortGeneratedMappings() {
    const mappings = this._generatedMappingsUnsorted;
    mappings.sort(util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = mappings;
  }

  _sortOriginalMappings() {
    const mappings = this._originalMappingsUnsorted;
    mappings.sort(util.compareByOriginalPositions);
    this.__originalMappings = mappings;
  }

  /**
   * The list of original sources.
   */
  get sources() {
    const sources = [];
    for (let i = 0; i < this._sections.length; i++) {
      for (let j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.  The line number
   *     is 1-based.
   *   - column: The column number in the generated source.  The column
   *     number is 0-based.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the original source, or null.  The
   *     column number is 0-based.
   *   - name: The original identifier, or null.
   */
  originalPositionFor(aArgs) {
    const needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column")
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    const sectionIndex = binarySearch.search(needle, this._sections,
      function(aNeedle, section) {
        const cmp = aNeedle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (aNeedle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    const section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  }

  /**
   * Return true if we have the source content for every source in the source
   * map, false otherwise.
   */
  hasContentsOfAllSources() {
    return this._sections.every(function(s) {
      return s.consumer.hasContentsOfAllSources();
    });
  }

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * available.
   */
  sourceContentFor(aSource, nullOnMissing) {
    for (let i = 0; i < this._sections.length; i++) {
      const section = this._sections[i];

      const content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    throw new Error('"' + aSource + '" is not in the SourceMap.');
  }

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.  The line number
   *     is 1-based.
   *   - column: The column number in the original source.  The column
   *     number is 0-based.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.  The
   *     line number is 1-based.
   *   - column: The column number in the generated source, or null.
   *     The column number is 0-based.
   */
  generatedPositionFor(aArgs) {
    for (let i = 0; i < this._sections.length; i++) {
      const section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
        continue;
      }
      const generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        const ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  }

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  _parseMappings(aStr, aSourceRoot) {
    const generatedMappings = this.__generatedMappingsUnsorted = [];
    const originalMappings = this.__originalMappingsUnsorted = [];
    for (let i = 0; i < this._sections.length; i++) {
      const section = this._sections[i];

      const sectionMappings = [];
      section.consumer.eachMapping(m => sectionMappings.push(m));

      for (let j = 0; j < sectionMappings.length; j++) {
        const mapping = sectionMappings[j];

        // TODO: test if null is correct here.  The original code used
        // `source`, which would actually have gotten used as null because
        // var's get hoisted.
        // See: https://github.com/mozilla/source-map/issues/333
        let source = util.computeSourceURL(section.consumer.sourceRoot, null, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        let name = null;
        if (mapping.name) {
          this._names.add(mapping.name);
          name = this._names.indexOf(mapping.name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        const adjustedMapping = {
          source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name
        };

        generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === "number") {
          originalMappings.push(adjustedMapping);
        }
      }
    }
  }

  eachMapping(aCallback, aContext, aOrder) {
    const context = aContext || null;
    const order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    let mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    const sourceRoot = this.sourceRoot;
    mappings.map(function(mapping) {
      let source = null;
      if (mapping.source !== null) {
        source = this._sources.at(mapping.source);
        source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      }
      return {
        source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  }

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  _findMapping(aNeedle, aMappings, aLineName,
              aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError("Line must be greater than or equal to 1, got "
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError("Column must be greater than or equal to 0, got "
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  }

  allGeneratedPositionsFor(aArgs) {
    const line = util.getArg(aArgs, "line");

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    const needle = {
      source: util.getArg(aArgs, "source"),
      originalLine: line,
      originalColumn: util.getArg(aArgs, "column", 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    if (needle.originalLine < 1) {
      throw new Error("Line numbers must be >= 1");
    }

    if (needle.originalColumn < 0) {
      throw new Error("Column numbers must be >= 0");
    }

    const mappings = [];

    let index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      let mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        const originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          let lastColumn = mapping.lastGeneratedColumn;
          if (this._computedColumnSpans && lastColumn === null) {
            lastColumn = Infinity;
          }
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn,
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        const originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          let lastColumn = mapping.lastGeneratedColumn;
          if (this._computedColumnSpans && lastColumn === null) {
            lastColumn = Infinity;
          }
          mappings.push({
            line: util.getArg(mapping, "generatedLine", null),
            column: util.getArg(mapping, "generatedColumn", null),
            lastColumn,
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  }

  destroy() {
    for (let i = 0; i < this._sections.length; i++) {
      this._sections[i].consumer.destroy();
    }
  }
}
exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

/*
 * Cheat to get around inter-twingled classes.  `factory()` can be at the end
 * where it has access to non-hoisted classes, but it gets hoisted itself.
 */
function _factory(aSourceMap, aSourceMapURL) {
  let sourceMap = aSourceMap;
  if (typeof aSourceMap === "string") {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  const consumer = sourceMap.sections != null
      ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
      : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
  return Promise.resolve(consumer);
}

function _factoryBSM(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
}

},{"../lib/read-wasm":13,"./array-set":8,"./base64-vlq":9,"./binary-search":11,"./util":17,"./wasm":18}],15:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const base64VLQ = require("./base64-vlq");
const util = require("./util");
const ArraySet = require("./array-set").ArraySet;
const MappingList = require("./mapping-list").MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
class SourceMapGenerator {
  constructor(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, "file", null);
    this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
    this._skipValidation = util.getArg(aArgs, "skipValidation", false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  static fromSourceMap(aSourceMapConsumer) {
    const sourceRoot = aSourceMapConsumer.sourceRoot;
    const generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot
    });
    aSourceMapConsumer.eachMapping(function(mapping) {
      const newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      let sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      const content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  }

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  addMapping(aArgs) {
    const generated = util.getArg(aArgs, "generated");
    const original = util.getArg(aArgs, "original", null);
    let source = util.getArg(aArgs, "source", null);
    let name = util.getArg(aArgs, "name", null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source,
      name
    });
  }

  /**
   * Set the source content for a source file.
   */
  setSourceContent(aSourceFile, aSourceContent) {
    let source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  }

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    let sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          "SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, " +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    const sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    const newSources = this._mappings.toArray().length > 0
      ? new ArraySet()
      : this._sources;
    const newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function(mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        const original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      const source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      const name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function(srcFile) {
      const content = aSourceMapConsumer.sourceContentFor(srcFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          srcFile = util.join(aSourceMapPath, srcFile);
        }
        if (sourceRoot != null) {
          srcFile = util.relative(sourceRoot, srcFile);
        }
        this.setSourceContent(srcFile, content);
      }
    }, this);
  }

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  _validateMapping(aGenerated, aOriginal, aSource, aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
        throw new Error(
            "original.line and original.column are not numbers -- you probably meant to omit " +
            "the original mapping entirely and only map the generated position. If so, pass " +
            "null for the original mapping instead of an object with empty or null values."
        );
    }

    if (aGenerated && "line" in aGenerated && "column" in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.

    } else if (aGenerated && "line" in aGenerated && "column" in aGenerated
             && aOriginal && "line" in aOriginal && "column" in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.

    } else {
      throw new Error("Invalid mapping: " + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  }

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  _serializeMappings() {
    let previousGeneratedColumn = 0;
    let previousGeneratedLine = 1;
    let previousOriginalColumn = 0;
    let previousOriginalLine = 0;
    let previousName = 0;
    let previousSource = 0;
    let result = "";
    let next;
    let mapping;
    let nameIdx;
    let sourceIdx;

    const mappings = this._mappings.toArray();
    for (let i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = "";

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ";";
          previousGeneratedLine++;
        }
      } else if (i > 0) {
        if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
          continue;
        }
        next += ",";
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  }

  _generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function(source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      const key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  }

  /**
   * Externalize the source map.
   */
  toJSON() {
    const map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  }

  /**
   * Render the source map being generated to a string.
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }
}

SourceMapGenerator.prototype._version = 3;
exports.SourceMapGenerator = SourceMapGenerator;

},{"./array-set":8,"./base64-vlq":9,"./mapping-list":12,"./util":17}],16:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const SourceMapGenerator = require("./source-map-generator").SourceMapGenerator;
const util = require("./util");

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
const REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
const NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
const isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
class SourceNode {
  constructor(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  static fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    const node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    const remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    let remainingLinesIndex = 0;
    const shiftNextLine = function() {
      const lineContents = getNextLine();
      // The last line of a file might not have a newline.
      const newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    let lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    let lastMapping = null;
    let nextLine;

    aSourceMapConsumer.eachMapping(function(mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          nextLine = remainingLines[remainingLinesIndex] || "";
          const code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        nextLine = remainingLines[remainingLinesIndex] || "";
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function(sourceFile) {
      const content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        const source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  }

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function(chunk) {
        this.add(chunk);
      }, this);
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    } else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  }

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (let i = aChunk.length - 1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    } else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  }

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  walk(aFn) {
    let chunk;
    for (let i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      } else if (chunk !== "") {
        aFn(chunk, { source: this.source,
                      line: this.line,
                      column: this.column,
                      name: this.name });
      }
    }
  }

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  join(aSep) {
    let newChildren;
    let i;
    const len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len - 1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  }

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  replaceRight(aPattern, aReplacement) {
    const lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    } else if (typeof lastChild === "string") {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    } else {
      this.children.push("".replace(aPattern, aReplacement));
    }
    return this;
  }

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  }

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  walkSourceContents(aFn) {
    for (let i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    const sources = Object.keys(this.sourceContents);
    for (let i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  }

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  toString() {
    let str = "";
    this.walk(function(chunk) {
      str += chunk;
    });
    return str;
  }

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  toStringWithSourceMap(aArgs) {
    const generated = {
      code: "",
      line: 1,
      column: 0
    };
    const map = new SourceMapGenerator(aArgs);
    let sourceMappingActive = false;
    let lastOriginalSource = null;
    let lastOriginalLine = null;
    let lastOriginalColumn = null;
    let lastOriginalName = null;
    this.walk(function(chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if (lastOriginalSource !== original.source
          || lastOriginalLine !== original.line
          || lastOriginalColumn !== original.column
          || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (let idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function(sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map };
  }
}

exports.SourceNode = SourceNode;

},{"./source-map-generator":15,"./util":17}],17:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  }
    throw new Error('"' + aName + '" is a required argument.');

}
exports.getArg = getArg;

const urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
const dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  const match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  let url = "";
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ":";
  }
  url += "//";
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + "@";
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

const MAX_CACHED_INPUTS = 32;

/**
 * Takes some function `f(input) -> result` and returns a memoized version of
 * `f`.
 *
 * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
 * memoization is a dumb-simple, linear least-recently-used cache.
 */
function lruMemoize(f) {
  const cache = [];

  return function(input) {
    for (let i = 0; i < cache.length; i++) {
      if (cache[i].input === input) {
        const temp = cache[0];
        cache[0] = cache[i];
        cache[i] = temp;
        return cache[0].result;
      }
    }

    const result = f(input);

    cache.unshift({
      input,
      result,
    });

    if (cache.length > MAX_CACHED_INPUTS) {
      cache.pop();
    }

    return result;
  };
}

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
const normalize = lruMemoize(function normalize(aPath) {
  let path = aPath;
  const url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  const isAbsolute = exports.isAbsolute(path);

  // Split the path into parts between `/` characters. This is much faster than
  // using `.split(/\/+/g)`.
  const parts = [];
  let start = 0;
  let i = 0;
  while (true) {
    start = i;
    i = path.indexOf("/", start);
    if (i === -1) {
      parts.push(path.slice(start));
      break;
    } else {
      parts.push(path.slice(start, i));
      while (i < path.length && path[i] === "/") {
        i++;
      }
    }
  }

  let up = 0;
  for (i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part === ".") {
      parts.splice(i, 1);
    } else if (part === "..") {
      up++;
    } else if (up > 0) {
      if (part === "") {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join("/");

  if (path === "") {
    path = isAbsolute ? "/" : ".";
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
});
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  const aPathUrl = urlParse(aPath);
  const aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || "/";
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  const joined = aPath.charAt(0) === "/"
    ? aPath
    : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function(aPath) {
  return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, "");

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  let level = 0;
  while (aPath.indexOf(aRoot + "/") !== 0) {
    const index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

const supportsNullProto = (function() {
  const obj = Object.create(null);
  return !("__proto__" in obj);
}());

function identity(s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return "$" + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  const length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  /* eslint-disable no-multi-spaces */
  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }
  /* eslint-enable no-multi-spaces */

  for (let i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  let cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  let cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  let cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || "";

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
      sourceRoot += "/";
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    const parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      const index = parsed.path.lastIndexOf("/");
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;

},{}],18:[function(require,module,exports){
const readWasm = require("../lib/read-wasm");

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.lastGeneratedColumn = null;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

let cachedWasm = null;

module.exports = function wasm() {
  if (cachedWasm) {
    return cachedWasm;
  }

  const callbackStack = [];

  cachedWasm = readWasm().then(buffer => {
      return WebAssembly.instantiate(buffer, {
        env: {
          mapping_callback(
            generatedLine,
            generatedColumn,

            hasLastGeneratedColumn,
            lastGeneratedColumn,

            hasOriginal,
            source,
            originalLine,
            originalColumn,

            hasName,
            name
          ) {
            const mapping = new Mapping();
            // JS uses 1-based line numbers, wasm uses 0-based.
            mapping.generatedLine = generatedLine + 1;
            mapping.generatedColumn = generatedColumn;

            if (hasLastGeneratedColumn) {
              // JS uses inclusive last generated column, wasm uses exclusive.
              mapping.lastGeneratedColumn = lastGeneratedColumn - 1;
            }

            if (hasOriginal) {
              mapping.source = source;
              // JS uses 1-based line numbers, wasm uses 0-based.
              mapping.originalLine = originalLine + 1;
              mapping.originalColumn = originalColumn;

              if (hasName) {
                mapping.name = name;
              }
            }

            callbackStack[callbackStack.length - 1](mapping);
          },

          start_all_generated_locations_for() { console.time("all_generated_locations_for"); },
          end_all_generated_locations_for() { console.timeEnd("all_generated_locations_for"); },

          start_compute_column_spans() { console.time("compute_column_spans"); },
          end_compute_column_spans() { console.timeEnd("compute_column_spans"); },

          start_generated_location_for() { console.time("generated_location_for"); },
          end_generated_location_for() { console.timeEnd("generated_location_for"); },

          start_original_location_for() { console.time("original_location_for"); },
          end_original_location_for() { console.timeEnd("original_location_for"); },

          start_parse_mappings() { console.time("parse_mappings"); },
          end_parse_mappings() { console.timeEnd("parse_mappings"); },

          start_sort_by_generated_location() { console.time("sort_by_generated_location"); },
          end_sort_by_generated_location() { console.timeEnd("sort_by_generated_location"); },

          start_sort_by_original_location() { console.time("sort_by_original_location"); },
          end_sort_by_original_location() { console.timeEnd("sort_by_original_location"); },
        }
      });
  }).then(Wasm => {
    return {
      exports: Wasm.instance.exports,
      withMappingCallback: (mappingCallback, f) => {
        callbackStack.push(mappingCallback);
        try {
          f();
        } finally {
          callbackStack.pop();
        }
      }
    };
  }).then(null, e => {
    cachedWasm = null;
    throw e;
  });

  return cachedWasm;
};

},{"../lib/read-wasm":13}],19:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require("./lib/source-map-generator").SourceMapGenerator;
exports.SourceMapConsumer = require("./lib/source-map-consumer").SourceMapConsumer;
exports.SourceNode = require("./lib/source-node").SourceNode;

},{"./lib/source-map-consumer":14,"./lib/source-map-generator":15,"./lib/source-node":16}],20:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}

DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
  	var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(isHTML){
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
var htmlEntity = require('./entities');
var XMLReader = require('./sax').XMLReader;
var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
exports.XMLSerializer = require('./dom').XMLSerializer ;
exports.DOMParser = DOMParser;
//}

},{"./dom":21,"./entities":22,"./sax":23}],21:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9 && this.documentElement || this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],22:[function(require,module,exports){
exports.entityMap = {
       lt: '<',
       gt: '>',
       amp: '&',
       quot: '"',
       apos: "'",
       Agrave: "À",
       Aacute: "Á",
       Acirc: "Â",
       Atilde: "Ã",
       Auml: "Ä",
       Aring: "Å",
       AElig: "Æ",
       Ccedil: "Ç",
       Egrave: "È",
       Eacute: "É",
       Ecirc: "Ê",
       Euml: "Ë",
       Igrave: "Ì",
       Iacute: "Í",
       Icirc: "Î",
       Iuml: "Ï",
       ETH: "Ð",
       Ntilde: "Ñ",
       Ograve: "Ò",
       Oacute: "Ó",
       Ocirc: "Ô",
       Otilde: "Õ",
       Ouml: "Ö",
       Oslash: "Ø",
       Ugrave: "Ù",
       Uacute: "Ú",
       Ucirc: "Û",
       Uuml: "Ü",
       Yacute: "Ý",
       THORN: "Þ",
       szlig: "ß",
       agrave: "à",
       aacute: "á",
       acirc: "â",
       atilde: "ã",
       auml: "ä",
       aring: "å",
       aelig: "æ",
       ccedil: "ç",
       egrave: "è",
       eacute: "é",
       ecirc: "ê",
       euml: "ë",
       igrave: "ì",
       iacute: "í",
       icirc: "î",
       iuml: "ï",
       eth: "ð",
       ntilde: "ñ",
       ograve: "ò",
       oacute: "ó",
       ocirc: "ô",
       otilde: "õ",
       ouml: "ö",
       oslash: "ø",
       ugrave: "ù",
       uacute: "ú",
       ucirc: "û",
       uuml: "ü",
       yacute: "ý",
       thorn: "þ",
       yuml: "ÿ",
       nbsp: " ",
       iexcl: "¡",
       cent: "¢",
       pound: "£",
       curren: "¤",
       yen: "¥",
       brvbar: "¦",
       sect: "§",
       uml: "¨",
       copy: "©",
       ordf: "ª",
       laquo: "«",
       not: "¬",
       shy: "­­",
       reg: "®",
       macr: "¯",
       deg: "°",
       plusmn: "±",
       sup2: "²",
       sup3: "³",
       acute: "´",
       micro: "µ",
       para: "¶",
       middot: "·",
       cedil: "¸",
       sup1: "¹",
       ordm: "º",
       raquo: "»",
       frac14: "¼",
       frac12: "½",
       frac34: "¾",
       iquest: "¿",
       times: "×",
       divide: "÷",
       forall: "∀",
       part: "∂",
       exist: "∃",
       empty: "∅",
       nabla: "∇",
       isin: "∈",
       notin: "∉",
       ni: "∋",
       prod: "∏",
       sum: "∑",
       minus: "−",
       lowast: "∗",
       radic: "√",
       prop: "∝",
       infin: "∞",
       ang: "∠",
       and: "∧",
       or: "∨",
       cap: "∩",
       cup: "∪",
       'int': "∫",
       there4: "∴",
       sim: "∼",
       cong: "≅",
       asymp: "≈",
       ne: "≠",
       equiv: "≡",
       le: "≤",
       ge: "≥",
       sub: "⊂",
       sup: "⊃",
       nsub: "⊄",
       sube: "⊆",
       supe: "⊇",
       oplus: "⊕",
       otimes: "⊗",
       perp: "⊥",
       sdot: "⋅",
       Alpha: "Α",
       Beta: "Β",
       Gamma: "Γ",
       Delta: "Δ",
       Epsilon: "Ε",
       Zeta: "Ζ",
       Eta: "Η",
       Theta: "Θ",
       Iota: "Ι",
       Kappa: "Κ",
       Lambda: "Λ",
       Mu: "Μ",
       Nu: "Ν",
       Xi: "Ξ",
       Omicron: "Ο",
       Pi: "Π",
       Rho: "Ρ",
       Sigma: "Σ",
       Tau: "Τ",
       Upsilon: "Υ",
       Phi: "Φ",
       Chi: "Χ",
       Psi: "Ψ",
       Omega: "Ω",
       alpha: "α",
       beta: "β",
       gamma: "γ",
       delta: "δ",
       epsilon: "ε",
       zeta: "ζ",
       eta: "η",
       theta: "θ",
       iota: "ι",
       kappa: "κ",
       lambda: "λ",
       mu: "μ",
       nu: "ν",
       xi: "ξ",
       omicron: "ο",
       pi: "π",
       rho: "ρ",
       sigmaf: "ς",
       sigma: "σ",
       tau: "τ",
       upsilon: "υ",
       phi: "φ",
       chi: "χ",
       psi: "ψ",
       omega: "ω",
       thetasym: "ϑ",
       upsih: "ϒ",
       piv: "ϖ",
       OElig: "Œ",
       oelig: "œ",
       Scaron: "Š",
       scaron: "š",
       Yuml: "Ÿ",
       fnof: "ƒ",
       circ: "ˆ",
       tilde: "˜",
       ensp: " ",
       emsp: " ",
       thinsp: " ",
       zwnj: "‌",
       zwj: "‍",
       lrm: "‎",
       rlm: "‏",
       ndash: "–",
       mdash: "—",
       lsquo: "‘",
       rsquo: "’",
       sbquo: "‚",
       ldquo: "“",
       rdquo: "”",
       bdquo: "„",
       dagger: "†",
       Dagger: "‡",
       bull: "•",
       hellip: "…",
       permil: "‰",
       prime: "′",
       Prime: "″",
       lsaquo: "‹",
       rsaquo: "›",
       oline: "‾",
       euro: "€",
       trade: "™",
       larr: "←",
       uarr: "↑",
       rarr: "→",
       darr: "↓",
       harr: "↔",
       crarr: "↵",
       lceil: "⌈",
       rceil: "⌉",
       lfloor: "⌊",
       rfloor: "⌋",
       loz: "◊",
       spades: "♠",
       clubs: "♣",
       hearts: "♥",
       diams: "♦"
};
//for(var  n in exports.entityMap){console.log(exports.entityMap[n].charCodeAt())}
},{}],23:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}



function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],24:[function(require,module,exports){
/*
 * xpath.js
 *
 * An XPath 1.0 library for JavaScript.
 *
 * Cameron McCormack <cam (at) mcc.id.au>
 *
 * This work is licensed under the MIT License.
 *
 * Revision 20: April 26, 2011
 *   Fixed a typo resulting in FIRST_ORDERED_NODE_TYPE results being wrong,
 *   thanks to <shi_a009 (at) hotmail.com>.
 *
 * Revision 19: November 29, 2005
 *   Nodesets now store their nodes in a height balanced tree, increasing
 *   performance for the common case of selecting nodes in document order,
 *   thanks to S閎astien Cramatte <contact (at) zeninteractif.com>.
 *   AVL tree code adapted from Raimund Neumann <rnova (at) gmx.net>.
 *
 * Revision 18: October 27, 2005
 *   DOM 3 XPath support.  Caveats:
 *     - namespace prefixes aren't resolved in XPathEvaluator.createExpression,
 *       but in XPathExpression.evaluate.
 *     - XPathResult.invalidIteratorState is not implemented.
 *
 * Revision 17: October 25, 2005
 *   Some core XPath function fixes and a patch to avoid crashing certain
 *   versions of MSXML in PathExpr.prototype.getOwnerElement, thanks to
 *   S閎astien Cramatte <contact (at) zeninteractif.com>.
 *
 * Revision 16: September 22, 2005
 *   Workarounds for some IE 5.5 deficiencies.
 *   Fixed problem with prefix node tests on attribute nodes.
 *
 * Revision 15: May 21, 2005
 *   Fixed problem with QName node tests on elements with an xmlns="...".
 *
 * Revision 14: May 19, 2005
 *   Fixed QName node tests on attribute node regression.
 *
 * Revision 13: May 3, 2005
 *   Node tests are case insensitive now if working in an HTML DOM.
 *
 * Revision 12: April 26, 2005
 *   Updated licence.  Slight code changes to enable use of Dean
 *   Edwards' script compression, http://dean.edwards.name/packer/ .
 *
 * Revision 11: April 23, 2005
 *   Fixed bug with 'and' and 'or' operators, fix thanks to
 *   Sandy McArthur <sandy (at) mcarthur.org>.
 *
 * Revision 10: April 15, 2005
 *   Added support for a virtual root node, supposedly helpful for
 *   implementing XForms.  Fixed problem with QName node tests and
 *   the parent axis.
 *
 * Revision 9: March 17, 2005
 *   Namespace resolver tweaked so using the document node as the context
 *   for namespace lookups is equivalent to using the document element.
 *
 * Revision 8: February 13, 2005
 *   Handle implicit declaration of 'xmlns' namespace prefix.
 *   Fixed bug when comparing nodesets.
 *   Instance data can now be associated with a FunctionResolver, and
 *     workaround for MSXML not supporting 'localName' and 'getElementById',
 *     thanks to Grant Gongaware.
 *   Fix a few problems when the context node is the root node.
 *
 * Revision 7: February 11, 2005
 *   Default namespace resolver fix from Grant Gongaware
 *   <grant (at) gongaware.com>.
 *
 * Revision 6: February 10, 2005
 *   Fixed bug in 'number' function.
 *
 * Revision 5: February 9, 2005
 *   Fixed bug where text nodes not getting converted to string values.
 *
 * Revision 4: January 21, 2005
 *   Bug in 'name' function, fix thanks to Bill Edney.
 *   Fixed incorrect processing of namespace nodes.
 *   Fixed NamespaceResolver to resolve 'xml' namespace.
 *   Implemented union '|' operator.
 *
 * Revision 3: January 14, 2005
 *   Fixed bug with nodeset comparisons, bug lexing < and >.
 *
 * Revision 2: October 26, 2004
 *   QName node test namespace handling fixed.  Few other bug fixes.
 *
 * Revision 1: August 13, 2004
 *   Bug fixes from William J. Edney <bedney (at) technicalpursuit.com>.
 *   Added minimal licence.
 *
 * Initial version: June 14, 2004
 */

// non-node wrapper
var xpath = (typeof exports === 'undefined') ? {} : exports;

(function(exports) {
"use strict";

// functional helpers
function curry( func ) {
    var slice = Array.prototype.slice,
        totalargs = func.length,
        partial = function( args, fn ) {
            return function( ) {
                return fn.apply( this, args.concat( slice.call( arguments ) ) );
            }
        },
        fn = function( ) {
            var args = slice.call( arguments );
            return ( args.length < totalargs ) ?
                partial( args, fn ) :
                func.apply( this, slice.apply( arguments, [ 0, totalargs ] ) );
        };
    return fn;
}

var forEach = curry(function (f, xs) {
	for (var i = 0; i < xs.length; i += 1) {
		f(xs[i], i, xs);
	}
});

var reduce = curry(function (f, seed, xs) {
	var acc = seed;

	forEach(function (x, i) { acc = f(acc, x, i); }, xs);

	return acc;
});

var map = curry(function (f, xs) { 
	var mapped = new Array(xs.length);
	
	forEach(function (x, i) { mapped[i] = f(x); }, xs);

	return mapped;
});

var filter = curry(function (f, xs) {
	var filtered = [];
	
	forEach(function (x, i) { if(f(x, i)) { filtered.push(x); } }, xs);
	
	return filtered;
});

function compose() {
    if (arguments.length === 0) { throw new Error('compose requires at least one argument'); }

    var funcs = Array.prototype.slice.call(arguments).reverse();
	
    var f0 = funcs[0];
    var fRem = funcs.slice(1);

    return function () {
        return reduce(function (acc, next) {
            return next(acc);
        }, f0.apply(null, arguments), fRem);
    };
}

var includes = curry(function (values, value) {
	for (var i = 0; i < values.length; i += 1) {
		if (values[i] === value){
			return true;
		}
	}
	
	return false;
});

function always(value) { return function () { return value ;} }

var prop = curry(function (name, obj) { return obj[name]; });

function toString (x) { return x.toString(); }
var join = curry(function (s, xs) { return xs.join(s); });
var wrap = curry(function (pref, suf, str) { return pref + str + suf; });

function assign(target) { // .length of function is 2
    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }

    return to;
}

// XPathParser ///////////////////////////////////////////////////////////////

XPathParser.prototype = new Object();
XPathParser.prototype.constructor = XPathParser;
XPathParser.superclass = Object.prototype;

function XPathParser() {
	this.init();
}

XPathParser.prototype.init = function() {
	this.reduceActions = [];

	this.reduceActions[3] = function(rhs) {
		return new OrOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[5] = function(rhs) {
		return new AndOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[7] = function(rhs) {
		return new EqualsOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[8] = function(rhs) {
		return new NotEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[10] = function(rhs) {
		return new LessThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[11] = function(rhs) {
		return new GreaterThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[12] = function(rhs) {
		return new LessThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[13] = function(rhs) {
		return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[15] = function(rhs) {
		return new PlusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[16] = function(rhs) {
		return new MinusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[18] = function(rhs) {
		return new MultiplyOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[19] = function(rhs) {
		return new DivOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[20] = function(rhs) {
		return new ModOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[22] = function(rhs) {
		return new UnaryMinusOperation(rhs[1]);
	};
	this.reduceActions[24] = function(rhs) {
		return new BarOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[25] = function(rhs) {
		return new PathExpr(undefined, undefined, rhs[0]);
	};
	this.reduceActions[27] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		return rhs[0];
	};
	this.reduceActions[28] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
		return rhs[0];
	};
	this.reduceActions[29] = function(rhs) {
		return new PathExpr(rhs[0], [], undefined);
	};
	this.reduceActions[30] = function(rhs) {
		if (Utilities.instance_of(rhs[0], PathExpr)) {
			if (rhs[0].filterPredicates == undefined) {
				rhs[0].filterPredicates = [];
			}
			rhs[0].filterPredicates.push(rhs[1]);
			return rhs[0];
		} else {
			return new PathExpr(rhs[0], [rhs[1]], undefined);
		}
	};
	this.reduceActions[32] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[33] = function(rhs) {
		return new XString(rhs[0]);
	};
	this.reduceActions[34] = function(rhs) {
		return new XNumber(rhs[0]);
	};
	this.reduceActions[36] = function(rhs) {
		return new FunctionCall(rhs[0], []);
	};
	this.reduceActions[37] = function(rhs) {
		return new FunctionCall(rhs[0], rhs[2]);
	};
	this.reduceActions[38] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[39] = function(rhs) {
		rhs[2].unshift(rhs[0]);
		return rhs[2];
	};
	this.reduceActions[43] = function(rhs) {
		return new LocationPath(true, []);
	};
	this.reduceActions[44] = function(rhs) {
		rhs[1].absolute = true;
		return rhs[1];
	};
	this.reduceActions[46] = function(rhs) {
		return new LocationPath(false, [ rhs[0] ]);
	};
	this.reduceActions[47] = function(rhs) {
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[49] = function(rhs) {
		return new Step(rhs[0], rhs[1], []);
	};
	this.reduceActions[50] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], []);
	};
	this.reduceActions[51] = function(rhs) {
		return new Step(rhs[0], rhs[1], rhs[2]);
	};
	this.reduceActions[52] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], rhs[1]);
	};
	this.reduceActions[54] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[55] = function(rhs) {
		rhs[1].unshift(rhs[0]);
		return rhs[1];
	};
	this.reduceActions[56] = function(rhs) {
		if (rhs[0] == "ancestor") {
			return Step.ANCESTOR;
		} else if (rhs[0] == "ancestor-or-self") {
			return Step.ANCESTORORSELF;
		} else if (rhs[0] == "attribute") {
			return Step.ATTRIBUTE;
		} else if (rhs[0] == "child") {
			return Step.CHILD;
		} else if (rhs[0] == "descendant") {
			return Step.DESCENDANT;
		} else if (rhs[0] == "descendant-or-self") {
			return Step.DESCENDANTORSELF;
		} else if (rhs[0] == "following") {
			return Step.FOLLOWING;
		} else if (rhs[0] == "following-sibling") {
			return Step.FOLLOWINGSIBLING;
		} else if (rhs[0] == "namespace") {
			return Step.NAMESPACE;
		} else if (rhs[0] == "parent") {
			return Step.PARENT;
		} else if (rhs[0] == "preceding") {
			return Step.PRECEDING;
		} else if (rhs[0] == "preceding-sibling") {
			return Step.PRECEDINGSIBLING;
		} else if (rhs[0] == "self") {
			return Step.SELF;
		}
		return -1;
	};
	this.reduceActions[57] = function(rhs) {
		return Step.ATTRIBUTE;
	};
	this.reduceActions[59] = function(rhs) {
		if (rhs[0] == "comment") {
			return NodeTest.commentTest;
		} else if (rhs[0] == "text") {
			return NodeTest.textTest;
		} else if (rhs[0] == "processing-instruction") {
			return NodeTest.anyPiTest;
		} else if (rhs[0] == "node") {
			return NodeTest.nodeTest;
		}
		return new NodeTest(-1, undefined);
	};
	this.reduceActions[60] = function(rhs) {
		return new NodeTest.PITest(rhs[2]);
	};
	this.reduceActions[61] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[63] = function(rhs) {
		rhs[1].absolute = true;
		rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
		return rhs[1];
	};
	this.reduceActions[64] = function(rhs) {
		rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, NodeTest.nodeTest, []));
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[65] = function(rhs) {
		return new Step(Step.SELF, NodeTest.nodeTest, []);
	};
	this.reduceActions[66] = function(rhs) {
		return new Step(Step.PARENT, NodeTest.nodeTest, []);
	};
	this.reduceActions[67] = function(rhs) {
		return new VariableReference(rhs[1]);
	};
	this.reduceActions[68] = function(rhs) {
		return NodeTest.nameTestAny;
	};
	this.reduceActions[69] = function(rhs) {
		return new NodeTest.NameTestPrefixAny(rhs[0].split(':')[0]);
	};
	this.reduceActions[70] = function(rhs) {
		return new NodeTest.NameTestQName(rhs[0]);
	};
};

XPathParser.actionTable = [
	" s s        sssssssss    s ss  s  ss",
	"                 s                  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                rrrrr               ",
	" s s        sssssssss    s ss  s  ss",
	"rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
	" s s        sssssssss    s ss  s  ss",
	"                            s       ",
	"                            s       ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"  s                                 ",
	"                            s       ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"a                                   ",
	"r       s                    rr  r  ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrs  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr sr  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                sssss               ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"              s                     ",
	"                             s      ",
	"                rrrrr               ",
	" s s        sssssssss    s sss s  ss",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss      ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             rr     ",
	"                             s      ",
	"                             rs     ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"                                 r  ",
	"                                 s  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s s        sssssssss    s ss  s  ss",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             r      "
];

XPathParser.actionTableNumber = [
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                 J                  ",
	"a  aaaaaaaaa         aaaaaaa aa  a  ",
	"                YYYYY               ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"K1  KKKKKKKK .  +*)('KKKKKK  KK# K\" ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                            N       ",
	"                            O       ",
	"e  eeeeeeeee         eeeeeee ee ee  ",
	"f  fffffffff         fffffff ff ff  ",
	"d  ddddddddd         ddddddd dd dd  ",
	"B  BBBBBBBBB         BBBBBBB BB BB  ",
	"A  AAAAAAAAA         AAAAAAA AA AA  ",
	"  P                                 ",
	"                            Q       ",
	" 1           .  +*)('          #  \" ",
	"b  bbbbbbbbb         bbbbbbb bb  b  ",
	"                                    ",
	"!       S                    !!  !  ",
	"\"      T\"                    \"\"  \"  ",
	"$   V  $$            U       $$  $  ",
	"&   &ZY&&            &XW     &&  &  ",
	")   )))))            )))\\[   ))  )  ",
	".   ....._^]         .....   ..  .  ",
	"1   11111111         11111   11  1  ",
	"5   55555555         55555`  55  5  ",
	"7   77777777         777777  77  7  ",
	"9   99999999         999999  99  9  ",
	":  c::::::::         ::::::b :: a:  ",
	"I  fIIIIIIII         IIIIIIe II  I  ",
	"=  =========         ======= == ==  ",
	"?  ?????????         ??????? ?? ??  ",
	"C  CCCCCCCCC         CCCCCCC CC CC  ",
	"J   JJJJJJJJ         JJJJJJ  JJ  J  ",
	"M   MMMMMMMM         MMMMMM  MM  M  ",
	"N  NNNNNNNNN         NNNNNNN NN  N  ",
	"P  PPPPPPPPP         PPPPPPP PP  P  ",
	"                +*)('               ",
	"R  RRRRRRRRR         RRRRRRR RR aR  ",
	"U  UUUUUUUUU         UUUUUUU UU  U  ",
	"Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
	"c  ccccccccc         ccccccc cc cc  ",
	"                             j      ",
	"L  fLLLLLLLL         LLLLLLe LL  L  ",
	"6   66666666         66666   66  6  ",
	"              k                     ",
	"                             l      ",
	"                XXXXX               ",
	" 1 0        /.-,+*)('    & %$m #  \"!",
	"_  f________         ______e __  _  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('      %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	">  >>>>>>>>>         >>>>>>> >> >>  ",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	"Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
	"V  VVVVVVVVV         VVVVVVV VV aV  ",
	"T  TTTTTTTTT         TTTTTTT TT  T  ",
	"@  @@@@@@@@@         @@@@@@@ @@ @@  ",
	"                             \x87      ",
	"[  [[[[[[[[[         [[[[[[[ [[ [[  ",
	"D  DDDDDDDDD         DDDDDDD DD DD  ",
	"                             HH     ",
	"                             \x88      ",
	"                             F\x89     ",
	"#      T#                    ##  #  ",
	"%   V  %%            U       %%  %  ",
	"'   'ZY''            'XW     ''  '  ",
	"(   (ZY((            (XW     ((  (  ",
	"+   +++++            +++\\[   ++  +  ",
	"*   *****            ***\\[   **  *  ",
	"-   -----            ---\\[   --  -  ",
	",   ,,,,,            ,,,\\[   ,,  ,  ",
	"0   00000_^]         00000   00  0  ",
	"/   /////_^]         /////   //  /  ",
	"2   22222222         22222   22  2  ",
	"3   33333333         33333   33  3  ",
	"4   44444444         44444   44  4  ",
	"8   88888888         888888  88  8  ",
	"                                 ^  ",
	"                                 \x8a  ",
	";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
	"<  f<<<<<<<<         <<<<<<e <<  <  ",
	"O  OOOOOOOOO         OOOOOOO OO  O  ",
	"`  `````````         ``````` ``  `  ",
	"S  SSSSSSSSS         SSSSSSS SS  S  ",
	"W  WWWWWWWWW         WWWWWWW WW  W  ",
	"\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
	"E  EEEEEEEEE         EEEEEEE EE EE  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
	"                             G      "
];

XPathParser.gotoTable = [
	"3456789:;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"L456789:;<=>?@ AB  CDEFGH IJ ",
	"            M        EFGH IJ ",
	"       N;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"            S        EFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"              e              ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                        h  J ",
	"              i          j   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ ABpqCDEFGH IJ ",
	"                             ",
	"  r6789:;<=>?@ AB  CDEFGH IJ ",
	"   s789:;<=>?@ AB  CDEFGH IJ ",
	"    t89:;<=>?@ AB  CDEFGH IJ ",
	"    u89:;<=>?@ AB  CDEFGH IJ ",
	"     v9:;<=>?@ AB  CDEFGH IJ ",
	"     w9:;<=>?@ AB  CDEFGH IJ ",
	"     x9:;<=>?@ AB  CDEFGH IJ ",
	"     y9:;<=>?@ AB  CDEFGH IJ ",
	"      z:;<=>?@ AB  CDEFGH IJ ",
	"      {:;<=>?@ AB  CDEFGH IJ ",
	"       |;<=>?@ AB  CDEFGH IJ ",
	"       };<=>?@ AB  CDEFGH IJ ",
	"       ~;<=>?@ AB  CDEFGH IJ ",
	"         \x7f=>?@ AB  CDEFGH IJ ",
	"\x80456789:;<=>?@ AB  CDEFGH IJ\x81",
	"            \x82        EFGH IJ ",
	"            \x83        EFGH IJ ",
	"                             ",
	"                     \x84 GH IJ ",
	"                     \x85 GH IJ ",
	"              i          \x86   ",
	"              i          \x87   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ AB\x8cqCDEFGH IJ ",
	"                             ",
	"                             "
];

XPathParser.productions = [
	[1, 1, 2],
	[2, 1, 3],
	[3, 1, 4],
	[3, 3, 3, -9, 4],
	[4, 1, 5],
	[4, 3, 4, -8, 5],
	[5, 1, 6],
	[5, 3, 5, -22, 6],
	[5, 3, 5, -5, 6],
	[6, 1, 7],
	[6, 3, 6, -23, 7],
	[6, 3, 6, -24, 7],
	[6, 3, 6, -6, 7],
	[6, 3, 6, -7, 7],
	[7, 1, 8],
	[7, 3, 7, -25, 8],
	[7, 3, 7, -26, 8],
	[8, 1, 9],
	[8, 3, 8, -12, 9],
	[8, 3, 8, -11, 9],
	[8, 3, 8, -10, 9],
	[9, 1, 10],
	[9, 2, -26, 9],
	[10, 1, 11],
	[10, 3, 10, -27, 11],
	[11, 1, 12],
	[11, 1, 13],
	[11, 3, 13, -28, 14],
	[11, 3, 13, -4, 14],
	[13, 1, 15],
	[13, 2, 13, 16],
	[15, 1, 17],
	[15, 3, -29, 2, -30],
	[15, 1, -15],
	[15, 1, -16],
	[15, 1, 18],
	[18, 3, -13, -29, -30],
	[18, 4, -13, -29, 19, -30],
	[19, 1, 20],
	[19, 3, 20, -31, 19],
	[20, 1, 2],
	[12, 1, 14],
	[12, 1, 21],
	[21, 1, -28],
	[21, 2, -28, 14],
	[21, 1, 22],
	[14, 1, 23],
	[14, 3, 14, -28, 23],
	[14, 1, 24],
	[23, 2, 25, 26],
	[23, 1, 26],
	[23, 3, 25, 26, 27],
	[23, 2, 26, 27],
	[23, 1, 28],
	[27, 1, 16],
	[27, 2, 16, 27],
	[25, 2, -14, -3],
	[25, 1, -32],
	[26, 1, 29],
	[26, 3, -20, -29, -30],
	[26, 4, -21, -29, -15, -30],
	[16, 3, -33, 30, -34],
	[30, 1, 2],
	[22, 2, -4, 14],
	[24, 3, 14, -4, 23],
	[28, 1, -35],
	[28, 1, -2],
	[17, 2, -36, -18],
	[29, 1, -17],
	[29, 1, -19],
	[29, 1, -18]
];

XPathParser.DOUBLEDOT = 2;
XPathParser.DOUBLECOLON = 3;
XPathParser.DOUBLESLASH = 4;
XPathParser.NOTEQUAL = 5;
XPathParser.LESSTHANOREQUAL = 6;
XPathParser.GREATERTHANOREQUAL = 7;
XPathParser.AND = 8;
XPathParser.OR = 9;
XPathParser.MOD = 10;
XPathParser.DIV = 11;
XPathParser.MULTIPLYOPERATOR = 12;
XPathParser.FUNCTIONNAME = 13;
XPathParser.AXISNAME = 14;
XPathParser.LITERAL = 15;
XPathParser.NUMBER = 16;
XPathParser.ASTERISKNAMETEST = 17;
XPathParser.QNAME = 18;
XPathParser.NCNAMECOLONASTERISK = 19;
XPathParser.NODETYPE = 20;
XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
XPathParser.EQUALS = 22;
XPathParser.LESSTHAN = 23;
XPathParser.GREATERTHAN = 24;
XPathParser.PLUS = 25;
XPathParser.MINUS = 26;
XPathParser.BAR = 27;
XPathParser.SLASH = 28;
XPathParser.LEFTPARENTHESIS = 29;
XPathParser.RIGHTPARENTHESIS = 30;
XPathParser.COMMA = 31;
XPathParser.AT = 32;
XPathParser.LEFTBRACKET = 33;
XPathParser.RIGHTBRACKET = 34;
XPathParser.DOT = 35;
XPathParser.DOLLAR = 36;

XPathParser.prototype.tokenize = function(s1) {
	var types = [];
	var values = [];
	var s = s1 + '\0';

	var pos = 0;
	var c = s.charAt(pos++);
	while (1) {
		while (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
			c = s.charAt(pos++);
		}
		if (c == '\0' || pos >= s.length) {
			break;
		}

		if (c == '(') {
			types.push(XPathParser.LEFTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ')') {
			types.push(XPathParser.RIGHTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '[') {
			types.push(XPathParser.LEFTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ']') {
			types.push(XPathParser.RIGHTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '@') {
			types.push(XPathParser.AT);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ',') {
			types.push(XPathParser.COMMA);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '|') {
			types.push(XPathParser.BAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '+') {
			types.push(XPathParser.PLUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '-') {
			types.push(XPathParser.MINUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '=') {
			types.push(XPathParser.EQUALS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '$') {
			types.push(XPathParser.DOLLAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == '.') {
			c = s.charAt(pos++);
			if (c == '.') {
				types.push(XPathParser.DOUBLEDOT);
				values.push("..");
				c = s.charAt(pos++);
				continue;
			}
			if (c >= '0' && c <= '9') {
				var number = "." + c;
				c = s.charAt(pos++);
				while (c >= '0' && c <= '9') {
					number += c;
					c = s.charAt(pos++);
				}
				types.push(XPathParser.NUMBER);
				values.push(number);
				continue;
			}
			types.push(XPathParser.DOT);
			values.push('.');
			continue;
		}

		if (c == '\'' || c == '"') {
			var delimiter = c;
			var literal = "";
			while (pos < s.length && (c = s.charAt(pos)) !== delimiter) {
				literal += c;
                pos += 1;
			}
            if (c !== delimiter) {
                throw XPathException.fromMessage("Unterminated string literal: " + delimiter + literal);
            }
            pos += 1;
			types.push(XPathParser.LITERAL);
			values.push(literal);
			c = s.charAt(pos++);
			continue;
		}

		if (c >= '0' && c <= '9') {
			var number = c;
			c = s.charAt(pos++);
			while (c >= '0' && c <= '9') {
				number += c;
				c = s.charAt(pos++);
			}
			if (c == '.') {
				if (s.charAt(pos) >= '0' && s.charAt(pos) <= '9') {
					number += c;
					number += s.charAt(pos++);
					c = s.charAt(pos++);
					while (c >= '0' && c <= '9') {
						number += c;
						c = s.charAt(pos++);
					}
				}
			}
			types.push(XPathParser.NUMBER);
			values.push(number);
			continue;
		}

		if (c == '*') {
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					types.push(XPathParser.MULTIPLYOPERATOR);
					values.push(c);
					c = s.charAt(pos++);
					continue;
				}
			}
			types.push(XPathParser.ASTERISKNAMETEST);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == ':') {
			if (s.charAt(pos) == ':') {
				types.push(XPathParser.DOUBLECOLON);
				values.push("::");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '/') {
			c = s.charAt(pos++);
			if (c == '/') {
				types.push(XPathParser.DOUBLESLASH);
				values.push("//");
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.SLASH);
			values.push('/');
			continue;
		}

		if (c == '!') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.NOTEQUAL);
				values.push("!=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '<') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.LESSTHANOREQUAL);
				values.push("<=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.LESSTHAN);
			values.push('<');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '>') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.GREATERTHANOREQUAL);
				values.push(">=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.GREATERTHAN);
			values.push('>');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '_' || Utilities.isLetter(c.charCodeAt(0))) {
			var name = c;
			c = s.charAt(pos++);
			while (Utilities.isNCNameChar(c.charCodeAt(0))) {
				name += c;
				c = s.charAt(pos++);
			}
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					if (name == "and") {
						types.push(XPathParser.AND);
						values.push(name);
						continue;
					}
					if (name == "or") {
						types.push(XPathParser.OR);
						values.push(name);
						continue;
					}
					if (name == "mod") {
						types.push(XPathParser.MOD);
						values.push(name);
						continue;
					}
					if (name == "div") {
						types.push(XPathParser.DIV);
						values.push(name);
						continue;
					}
				}
			}
			if (c == ':') {
				if (s.charAt(pos) == '*') {
					types.push(XPathParser.NCNAMECOLONASTERISK);
					values.push(name + ":*");
					pos++;
					c = s.charAt(pos++);
					continue;
				}
				if (s.charAt(pos) == '_' || Utilities.isLetter(s.charCodeAt(pos))) {
					name += ':';
					c = s.charAt(pos++);
					while (Utilities.isNCNameChar(c.charCodeAt(0))) {
						name += c;
						c = s.charAt(pos++);
					}
					if (c == '(') {
						types.push(XPathParser.FUNCTIONNAME);
						values.push(name);
						continue;
					}
					types.push(XPathParser.QNAME);
					values.push(name);
					continue;
				}
				if (s.charAt(pos) == ':') {
					types.push(XPathParser.AXISNAME);
					values.push(name);
					continue;
				}
			}
			if (c == '(') {
				if (name == "comment" || name == "text" || name == "node") {
					types.push(XPathParser.NODETYPE);
					values.push(name);
					continue;
				}
				if (name == "processing-instruction") {
					if (s.charAt(pos) == ')') {
						types.push(XPathParser.NODETYPE);
					} else {
						types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
					}
					values.push(name);
					continue;
				}
				types.push(XPathParser.FUNCTIONNAME);
				values.push(name);
				continue;
			}
			types.push(XPathParser.QNAME);
			values.push(name);
			continue;
		}

		throw new Error("Unexpected character " + c);
	}
	types.push(1);
	values.push("[EOF]");
	return [types, values];
};

XPathParser.SHIFT = 's';
XPathParser.REDUCE = 'r';
XPathParser.ACCEPT = 'a';

XPathParser.prototype.parse = function(s) {
	var types;
	var values;
	var res = this.tokenize(s);
	if (res == undefined) {
		return undefined;
	}
	types = res[0];
	values = res[1];
	var tokenPos = 0;
	var state = [];
	var tokenType = [];
	var tokenValue = [];
	var s;
	var a;
	var t;

	state.push(0);
	tokenType.push(1);
	tokenValue.push("_S");

	a = types[tokenPos];
	t = values[tokenPos++];
	while (1) {
		s = state[state.length - 1];
		switch (XPathParser.actionTable[s].charAt(a - 1)) {
			case XPathParser.SHIFT:
				tokenType.push(-a);
				tokenValue.push(t);
				state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
				a = types[tokenPos];
				t = values[tokenPos++];
				break;
			case XPathParser.REDUCE:
				var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
				var rhs = [];
				for (var i = 0; i < num; i++) {
					tokenType.pop();
					rhs.unshift(tokenValue.pop());
					state.pop();
				}
				var s_ = state[state.length - 1];
				tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
				if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == undefined) {
					tokenValue.push(rhs[0]);
				} else {
					tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
				}
				state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
				break;
			case XPathParser.ACCEPT:
				return new XPath(tokenValue.pop());
			default:
				throw new Error("XPath parse error");
		}
	}
};

// XPath /////////////////////////////////////////////////////////////////////

XPath.prototype = new Object();
XPath.prototype.constructor = XPath;
XPath.superclass = Object.prototype;

function XPath(e) {
	this.expression = e;
}

XPath.prototype.toString = function() {
	return this.expression.toString();
};

function setIfUnset(obj, prop, value) {
	if (!(prop in obj)) {
		obj[prop] = value;
	}
}

XPath.prototype.evaluate = function(c) {
	c.contextNode = c.expressionContextNode;
	c.contextSize = 1;
	c.contextPosition = 1;

	// [2017-11-25] Removed usage of .implementation.hasFeature() since it does
	//              not reliably detect HTML DOMs (always returns false in xmldom and true in browsers)
	if (c.isHtml) {
		setIfUnset(c, 'caseInsensitive', true);
		setIfUnset(c, 'allowAnyNamespaceForNoPrefix', true);
	}
	
    setIfUnset(c, 'caseInsensitive', false);

	return this.expression.evaluate(c);
};

XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";

// Expression ////////////////////////////////////////////////////////////////

Expression.prototype = new Object();
Expression.prototype.constructor = Expression;
Expression.superclass = Object.prototype;

function Expression() {
}

Expression.prototype.init = function() {
};

Expression.prototype.toString = function() {
	return "<Expression>";
};

Expression.prototype.evaluate = function(c) {
	throw new Error("Could not evaluate expression.");
};

// UnaryOperation ////////////////////////////////////////////////////////////

UnaryOperation.prototype = new Expression();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.superclass = Expression.prototype;

function UnaryOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryOperation.prototype.init = function(rhs) {
	this.rhs = rhs;
};

// UnaryMinusOperation ///////////////////////////////////////////////////////

UnaryMinusOperation.prototype = new UnaryOperation();
UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
UnaryMinusOperation.superclass = UnaryOperation.prototype;

function UnaryMinusOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryMinusOperation.prototype.init = function(rhs) {
	UnaryMinusOperation.superclass.init.call(this, rhs);
};

UnaryMinusOperation.prototype.evaluate = function(c) {
	return this.rhs.evaluate(c).number().negate();
};

UnaryMinusOperation.prototype.toString = function() {
	return "-" + this.rhs.toString();
};

// BinaryOperation ///////////////////////////////////////////////////////////

BinaryOperation.prototype = new Expression();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.superclass = Expression.prototype;

function BinaryOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BinaryOperation.prototype.init = function(lhs, rhs) {
	this.lhs = lhs;
	this.rhs = rhs;
};

// OrOperation ///////////////////////////////////////////////////////////////

OrOperation.prototype = new BinaryOperation();
OrOperation.prototype.constructor = OrOperation;
OrOperation.superclass = BinaryOperation.prototype;

function OrOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

OrOperation.prototype.init = function(lhs, rhs) {
	OrOperation.superclass.init.call(this, lhs, rhs);
};

OrOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
};

OrOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// AndOperation //////////////////////////////////////////////////////////////

AndOperation.prototype = new BinaryOperation();
AndOperation.prototype.constructor = AndOperation;
AndOperation.superclass = BinaryOperation.prototype;

function AndOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

AndOperation.prototype.init = function(lhs, rhs) {
	AndOperation.superclass.init.call(this, lhs, rhs);
};

AndOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
};

AndOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (!b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// EqualsOperation ///////////////////////////////////////////////////////////

EqualsOperation.prototype = new BinaryOperation();
EqualsOperation.prototype.constructor = EqualsOperation;
EqualsOperation.superclass = BinaryOperation.prototype;

function EqualsOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

EqualsOperation.prototype.init = function(lhs, rhs) {
	EqualsOperation.superclass.init.call(this, lhs, rhs);
};

EqualsOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
};

EqualsOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
};

// NotEqualOperation /////////////////////////////////////////////////////////

NotEqualOperation.prototype = new BinaryOperation();
NotEqualOperation.prototype.constructor = NotEqualOperation;
NotEqualOperation.superclass = BinaryOperation.prototype;

function NotEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

NotEqualOperation.prototype.init = function(lhs, rhs) {
	NotEqualOperation.superclass.init.call(this, lhs, rhs);
};

NotEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
};

NotEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
};

// LessThanOperation /////////////////////////////////////////////////////////

LessThanOperation.prototype = new BinaryOperation();
LessThanOperation.prototype.constructor = LessThanOperation;
LessThanOperation.superclass = BinaryOperation.prototype;

function LessThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOperation.prototype.init = function(lhs, rhs) {
	LessThanOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
};

LessThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
};

// GreaterThanOperation //////////////////////////////////////////////////////

GreaterThanOperation.prototype = new BinaryOperation();
GreaterThanOperation.prototype.constructor = GreaterThanOperation;
GreaterThanOperation.superclass = BinaryOperation.prototype;

function GreaterThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
};

GreaterThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
};

// LessThanOrEqualOperation //////////////////////////////////////////////////

LessThanOrEqualOperation.prototype = new BinaryOperation();
LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
LessThanOrEqualOperation.superclass = BinaryOperation.prototype;

function LessThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
};

LessThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
};

// GreaterThanOrEqualOperation ///////////////////////////////////////////////

GreaterThanOrEqualOperation.prototype = new BinaryOperation();
GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;

function GreaterThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
};

GreaterThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
};

// PlusOperation /////////////////////////////////////////////////////////////

PlusOperation.prototype = new BinaryOperation();
PlusOperation.prototype.constructor = PlusOperation;
PlusOperation.superclass = BinaryOperation.prototype;

function PlusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

PlusOperation.prototype.init = function(lhs, rhs) {
	PlusOperation.superclass.init.call(this, lhs, rhs);
};

PlusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
};

PlusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
};

// MinusOperation ////////////////////////////////////////////////////////////

MinusOperation.prototype = new BinaryOperation();
MinusOperation.prototype.constructor = MinusOperation;
MinusOperation.superclass = BinaryOperation.prototype;

function MinusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MinusOperation.prototype.init = function(lhs, rhs) {
	MinusOperation.superclass.init.call(this, lhs, rhs);
};

MinusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
};

MinusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
};

// MultiplyOperation /////////////////////////////////////////////////////////

MultiplyOperation.prototype = new BinaryOperation();
MultiplyOperation.prototype.constructor = MultiplyOperation;
MultiplyOperation.superclass = BinaryOperation.prototype;

function MultiplyOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MultiplyOperation.prototype.init = function(lhs, rhs) {
	MultiplyOperation.superclass.init.call(this, lhs, rhs);
};

MultiplyOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
};

MultiplyOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
};

// DivOperation //////////////////////////////////////////////////////////////

DivOperation.prototype = new BinaryOperation();
DivOperation.prototype.constructor = DivOperation;
DivOperation.superclass = BinaryOperation.prototype;

function DivOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

DivOperation.prototype.init = function(lhs, rhs) {
	DivOperation.superclass.init.call(this, lhs, rhs);
};

DivOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
};

DivOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
};

// ModOperation //////////////////////////////////////////////////////////////

ModOperation.prototype = new BinaryOperation();
ModOperation.prototype.constructor = ModOperation;
ModOperation.superclass = BinaryOperation.prototype;

function ModOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

ModOperation.prototype.init = function(lhs, rhs) {
	ModOperation.superclass.init.call(this, lhs, rhs);
};

ModOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
};

ModOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
};

// BarOperation //////////////////////////////////////////////////////////////

BarOperation.prototype = new BinaryOperation();
BarOperation.prototype.constructor = BarOperation;
BarOperation.superclass = BinaryOperation.prototype;

function BarOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BarOperation.prototype.init = function(lhs, rhs) {
	BarOperation.superclass.init.call(this, lhs, rhs);
};

BarOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
};

BarOperation.prototype.toString = function() {
	return map(toString, [this.lhs, this.rhs]).join(' | ');
};

// PathExpr //////////////////////////////////////////////////////////////////

PathExpr.prototype = new Expression();
PathExpr.prototype.constructor = PathExpr;
PathExpr.superclass = Expression.prototype;

function PathExpr(filter, filterPreds, locpath) {
	if (arguments.length > 0) {
		this.init(filter, filterPreds, locpath);
	}
}

PathExpr.prototype.init = function(filter, filterPreds, locpath) {
	PathExpr.superclass.init.call(this);
	this.filter = filter;
	this.filterPredicates = filterPreds;
	this.locationPath = locpath;
};

/**
 * Returns the topmost node of the tree containing node
 */
function findRoot(node) {
    while (node && node.parentNode) {
        node = node.parentNode;
    }

    return node;
}

PathExpr.applyPredicates = function (predicates, c, nodes) {
	return reduce(function (inNodes, pred) {
		var ctx = c.extend({ contextSize: inNodes.length });
		
		return filter(function (node, i) {
			return PathExpr.predicateMatches(pred, ctx.extend({ contextNode: node, contextPosition: i + 1 }));
		}, inNodes);
	}, nodes, predicates);
};

PathExpr.getRoot = function (xpc, nodes) {
	var firstNode = nodes[0];
	
    if (firstNode.nodeType === 9 /*Node.DOCUMENT_NODE*/) {
		return firstNode;
	}
	
    if (xpc.virtualRoot) {
    	return xpc.virtualRoot;
    }
		
	var ownerDoc = firstNode.ownerDocument;
	
	if (ownerDoc) {
		return ownerDoc;
	}
			
    // IE 5.5 doesn't have ownerDocument?
    var n = firstNode;
    while (n.parentNode != null) {
    	n = n.parentNode;
    }
    return n;
}

PathExpr.applyStep = function (step, xpc, node) {
	var self = this;
	var newNodes = [];
    xpc.contextNode = node;
    
    switch (step.axis) {
    	case Step.ANCESTOR:
    		// look at all the ancestor nodes
    		if (xpc.contextNode === xpc.virtualRoot) {
    			break;
    		}
    		var m;
    		if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
    			m = PathExpr.getOwnerElement(xpc.contextNode);
    		} else {
    			m = xpc.contextNode.parentNode;
    		}
    		while (m != null) {
    			if (step.nodeTest.matches(m, xpc)) {
    				newNodes.push(m);
    			}
    			if (m === xpc.virtualRoot) {
    				break;
    			}
    			m = m.parentNode;
    		}
    		break;
    
    	case Step.ANCESTORORSELF:
    		// look at all the ancestor nodes and the current node
    		for (var m = xpc.contextNode; m != null; m = m.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ ? PathExpr.getOwnerElement(m) : m.parentNode) {
    			if (step.nodeTest.matches(m, xpc)) {
    				newNodes.push(m);
    			}
    			if (m === xpc.virtualRoot) {
    				break;
    			}
    		}
    		break;
    
    	case Step.ATTRIBUTE:
    		// look at the attributes
    		var nnm = xpc.contextNode.attributes;
    		if (nnm != null) {
    			for (var k = 0; k < nnm.length; k++) {
    				var m = nnm.item(k);
    				if (step.nodeTest.matches(m, xpc)) {
    					newNodes.push(m);
    				}
    			}
    		}
    		break;
    
    	case Step.CHILD:
    		// look at all child elements
    		for (var m = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
    			if (step.nodeTest.matches(m, xpc)) {
    				newNodes.push(m);
    			}
    		}
    		break;
    
    	case Step.DESCENDANT:
    		// look at all descendant nodes
    		var st = [ xpc.contextNode.firstChild ];
    		while (st.length > 0) {
    			for (var m = st.pop(); m != null; ) {
    				if (step.nodeTest.matches(m, xpc)) {
    					newNodes.push(m);
    				}
    				if (m.firstChild != null) {
    					st.push(m.nextSibling);
    					m = m.firstChild;
    				} else {
    					m = m.nextSibling;
    				}
    			}
    		}
    		break;
    
    	case Step.DESCENDANTORSELF:
    		// look at self
    		if (step.nodeTest.matches(xpc.contextNode, xpc)) {
    			newNodes.push(xpc.contextNode);
    		}
    		// look at all descendant nodes
    		var st = [ xpc.contextNode.firstChild ];
    		while (st.length > 0) {
    			for (var m = st.pop(); m != null; ) {
    				if (step.nodeTest.matches(m, xpc)) {
    					newNodes.push(m);
    				}
    				if (m.firstChild != null) {
    					st.push(m.nextSibling);
    					m = m.firstChild;
    				} else {
    					m = m.nextSibling;
    				}
    			}
    		}
    		break;
    
    	case Step.FOLLOWING:
    		if (xpc.contextNode === xpc.virtualRoot) {
    			break;
    		}
    		var st = [];
    		if (xpc.contextNode.firstChild != null) {
    			st.unshift(xpc.contextNode.firstChild);
    		} else {
    			st.unshift(xpc.contextNode.nextSibling);
    		}
    		for (var m = xpc.contextNode.parentNode; m != null && m.nodeType != 9 /*Node.DOCUMENT_NODE*/ && m !== xpc.virtualRoot; m = m.parentNode) {
    			st.unshift(m.nextSibling);
    		}
    		do {
    			for (var m = st.pop(); m != null; ) {
    				if (step.nodeTest.matches(m, xpc)) {
    					newNodes.push(m);
    				}
    				if (m.firstChild != null) {
    					st.push(m.nextSibling);
    					m = m.firstChild;
    				} else {
    					m = m.nextSibling;
    				}
    			}
    		} while (st.length > 0);
    		break;
    
    	case Step.FOLLOWINGSIBLING:
    		if (xpc.contextNode === xpc.virtualRoot) {
    			break;
    		}
    		for (var m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
    			if (step.nodeTest.matches(m, xpc)) {
    				newNodes.push(m);
    			}
    		}
    		break;
    
    	case Step.NAMESPACE:
    		var n = {};
    		if (xpc.contextNode.nodeType == 1 /*Node.ELEMENT_NODE*/) {
    			n["xml"] = XPath.XML_NAMESPACE_URI;
    			n["xmlns"] = XPath.XMLNS_NAMESPACE_URI;
    			for (var m = xpc.contextNode; m != null && m.nodeType == 1 /*Node.ELEMENT_NODE*/; m = m.parentNode) {
    				for (var k = 0; k < m.attributes.length; k++) {
    					var attr = m.attributes.item(k);
    					var nm = String(attr.name);
    					if (nm == "xmlns") {
    						if (n[""] == undefined) {
    							n[""] = attr.value;
    						}
    					} else if (nm.length > 6 && nm.substring(0, 6) == "xmlns:") {
    						var pre = nm.substring(6, nm.length);
    						if (n[pre] == undefined) {
    							n[pre] = attr.value;
    						}
    					}
    				}
    			}
    			for (var pre in n) {
    				var nsn = new XPathNamespace(pre, n[pre], xpc.contextNode);
    				if (step.nodeTest.matches(nsn, xpc)) {
    					newNodes.push(nsn);
    				}
    			}
    		}
    		break;
    
    	case Step.PARENT:
    		m = null;
    		if (xpc.contextNode !== xpc.virtualRoot) {
    			if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
    				m = PathExpr.getOwnerElement(xpc.contextNode);
    			} else {
    				m = xpc.contextNode.parentNode;
    			}
    		}
    		if (m != null && step.nodeTest.matches(m, xpc)) {
    			newNodes.push(m);
    		}
    		break;
    
    	case Step.PRECEDING:
    		var st;
    		if (xpc.virtualRoot != null) {
    			st = [ xpc.virtualRoot ];
    		} else {
                // cannot rely on .ownerDocument because the node may be in a document fragment
                st = [findRoot(xpc.contextNode)];
    		}
    		outer: while (st.length > 0) {
    			for (var m = st.pop(); m != null; ) {
    				if (m == xpc.contextNode) {
    					break outer;
    				}
    				if (step.nodeTest.matches(m, xpc)) {
    					newNodes.unshift(m);
    				}
    				if (m.firstChild != null) {
    					st.push(m.nextSibling);
    					m = m.firstChild;
    				} else {
    					m = m.nextSibling;
    				}
    			}
    		}
    		break;
    
    	case Step.PRECEDINGSIBLING:
    		if (xpc.contextNode === xpc.virtualRoot) {
    			break;
    		}
    		for (var m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
    			if (step.nodeTest.matches(m, xpc)) {
    				newNodes.push(m);
    			}
    		}
    		break;
    
    	case Step.SELF:
    		if (step.nodeTest.matches(xpc.contextNode, xpc)) {
    			newNodes.push(xpc.contextNode);
    		}
    		break;
    
    	default:
    }
	
	return newNodes;
};

PathExpr.applySteps = function (steps, xpc, nodes) {
	return reduce(function (inNodes, step) {
		return [].concat.apply([], map(function (node) {
			return PathExpr.applyPredicates(step.predicates, xpc, PathExpr.applyStep(step, xpc, node));
		}, inNodes));
	}, nodes, steps);
}

PathExpr.prototype.applyFilter = function(c, xpc) {
	if (!this.filter) {
		return { nodes: [ c.contextNode ] };
	}
	
	var ns = this.filter.evaluate(c);

	if (!Utilities.instance_of(ns, XNodeSet)) {
        if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
		    throw new Error("Path expression filter must evaluate to a nodeset if predicates or location path are used");
		}

		return { nonNodes: ns };
	}
	
	return { 
	    nodes: PathExpr.applyPredicates(this.filterPredicates || [], xpc, ns.toUnsortedArray())
	};
};

PathExpr.applyLocationPath = function (locationPath, xpc, nodes) {
	if (!locationPath) {
		return nodes;
	}
	
	var startNodes = locationPath.absolute ? [ PathExpr.getRoot(xpc, nodes) ] : nodes;
		
    return PathExpr.applySteps(locationPath.steps, xpc, startNodes);
};

PathExpr.prototype.evaluate = function(c) {
	var xpc = assign(new XPathContext(), c);
	
    var filterResult = this.applyFilter(c, xpc);
	
	if ('nonNodes' in filterResult) {
		return filterResult.nonNodes;
	}	
	
	var ns = new XNodeSet();
	ns.addArray(PathExpr.applyLocationPath(this.locationPath, xpc, filterResult.nodes));
	return ns;
};

PathExpr.predicateMatches = function(pred, c) {
	var res = pred.evaluate(c);
	
	return Utilities.instance_of(res, XNumber)
		? c.contextPosition == res.numberValue()
		: res.booleanValue();
};

PathExpr.predicateString = compose(wrap('[', ']'), toString);
PathExpr.predicatesString = compose(join(''), map(PathExpr.predicateString));

PathExpr.prototype.toString = function() {
	if (this.filter != undefined) {
		var filterStr = toString(this.filter);

		if (Utilities.instance_of(this.filter, XString)) {
			return wrap("'", "'", filterStr);
		}
		if (this.filterPredicates != undefined && this.filterPredicates.length) {
			return wrap('(', ')', filterStr) + 
			    PathExpr.predicatesString(this.filterPredicates);
		}
		if (this.locationPath != undefined) {
			return filterStr + 
			    (this.locationPath.absolute ? '' : '/') +
				toString(this.locationPath);
		}

		return filterStr;
	}

	return toString(this.locationPath);
};

PathExpr.getOwnerElement = function(n) {
	// DOM 2 has ownerElement
	if (n.ownerElement) {
		return n.ownerElement;
	}
	// DOM 1 Internet Explorer can use selectSingleNode (ironically)
	try {
		if (n.selectSingleNode) {
			return n.selectSingleNode("..");
		}
	} catch (e) {
	}
	// Other DOM 1 implementations must use this egregious search
	var doc = n.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? n
			: n.ownerDocument;
	var elts = doc.getElementsByTagName("*");
	for (var i = 0; i < elts.length; i++) {
		var elt = elts.item(i);
		var nnm = elt.attributes;
		for (var j = 0; j < nnm.length; j++) {
			var an = nnm.item(j);
			if (an === n) {
				return elt;
			}
		}
	}
	return null;
};

// LocationPath //////////////////////////////////////////////////////////////

LocationPath.prototype = new Object();
LocationPath.prototype.constructor = LocationPath;
LocationPath.superclass = Object.prototype;

function LocationPath(abs, steps) {
	if (arguments.length > 0) {
		this.init(abs, steps);
	}
}

LocationPath.prototype.init = function(abs, steps) {
	this.absolute = abs;
	this.steps = steps;
};

LocationPath.prototype.toString = function() {
	return (
	    (this.absolute ? '/' : '') +
		map(toString, this.steps).join('/')
    );
};

// Step //////////////////////////////////////////////////////////////////////

Step.prototype = new Object();
Step.prototype.constructor = Step;
Step.superclass = Object.prototype;

function Step(axis, nodetest, preds) {
	if (arguments.length > 0) {
		this.init(axis, nodetest, preds);
	}
}

Step.prototype.init = function(axis, nodetest, preds) {
	this.axis = axis;
	this.nodeTest = nodetest;
	this.predicates = preds;
};

Step.prototype.toString = function() {
	return Step.STEPNAMES[this.axis] +
        "::" +
        this.nodeTest.toString() +
	    PathExpr.predicatesString(this.predicates);
};


Step.ANCESTOR = 0;
Step.ANCESTORORSELF = 1;
Step.ATTRIBUTE = 2;
Step.CHILD = 3;
Step.DESCENDANT = 4;
Step.DESCENDANTORSELF = 5;
Step.FOLLOWING = 6;
Step.FOLLOWINGSIBLING = 7;
Step.NAMESPACE = 8;
Step.PARENT = 9;
Step.PRECEDING = 10;
Step.PRECEDINGSIBLING = 11;
Step.SELF = 12;

Step.STEPNAMES = reduce(function (acc, x) { return acc[x[0]] = x[1], acc; }, {}, [
	[Step.ANCESTOR, 'ancestor'],
	[Step.ANCESTORORSELF, 'ancestor-or-self'],
	[Step.ATTRIBUTE, 'attribute'],
	[Step.CHILD, 'child'],
	[Step.DESCENDANT, 'descendant'],
	[Step.DESCENDANTORSELF, 'descendant-or-self'],
	[Step.FOLLOWING, 'following'],
	[Step.FOLLOWINGSIBLING, 'following-sibling'],
	[Step.NAMESPACE, 'namespace'],
	[Step.PARENT, 'parent'],
	[Step.PRECEDING, 'preceding'],
	[Step.PRECEDINGSIBLING, 'preceding-sibling'],
	[Step.SELF, 'self']
  ]);
  
// NodeTest //////////////////////////////////////////////////////////////////

NodeTest.prototype = new Object();
NodeTest.prototype.constructor = NodeTest;
NodeTest.superclass = Object.prototype;

function NodeTest(type, value) {
	if (arguments.length > 0) {
		this.init(type, value);
	}
}

NodeTest.prototype.init = function(type, value) {
	this.type = type;
	this.value = value;
};

NodeTest.prototype.toString = function() {
	return "<unknown nodetest type>";
};

NodeTest.prototype.matches = function (n, xpc) {
    console.warn('unknown node test type');
};

NodeTest.NAMETESTANY = 0;
NodeTest.NAMETESTPREFIXANY = 1;
NodeTest.NAMETESTQNAME = 2;
NodeTest.COMMENT = 3;
NodeTest.TEXT = 4;
NodeTest.PI = 5;
NodeTest.NODE = 6;

NodeTest.isNodeType = function (types){
	return compose(includes(types), prop('nodeType'));
};

NodeTest.makeNodeTestType = function (type, members, ctor) {
	var newType = ctor || function () {};
	
	newType.prototype = new NodeTest(members.type);
	newType.prototype.constructor = type;
	
	for (var key in members) {
		newType.prototype[key] = members[key];
	}
	
	return newType;
};
// create invariant node test for certain node types
NodeTest.makeNodeTypeTest = function (type, nodeTypes, stringVal) {
	return new (NodeTest.makeNodeTestType(type, {
		matches: NodeTest.isNodeType(nodeTypes),
		toString: always(stringVal)
	}))();
};

NodeTest.hasPrefix = function (node) {
	return node.prefix || (node.nodeName || node.tagName).indexOf(':') !== -1;
};

NodeTest.isElementOrAttribute = NodeTest.isNodeType([1, 2]);
NodeTest.nameSpaceMatches = function (prefix, xpc, n) {
	var nNamespace = (n.namespaceURI || '');
	
	if (!prefix) { 
	    return !nNamespace || (xpc.allowAnyNamespaceForNoPrefix && !NodeTest.hasPrefix(n)); 
	}
	
    var ns = xpc.namespaceResolver.getNamespace(prefix, xpc.expressionContextNode);

	if (ns == null) {
        throw new Error("Cannot resolve QName " + prefix);
    }

    return ns === nNamespace;
};
NodeTest.localNameMatches = function (localName, xpc, n) {
	var nLocalName = (n.localName || n.nodeName);
	
	return xpc.caseInsensitive
	    ? localName.toLowerCase() === nLocalName.toLowerCase()
		: localName === nLocalName;
};

NodeTest.NameTestPrefixAny = NodeTest.makeNodeTestType(NodeTest.NAMETESTPREFIXANY, {
	matches: function (n, xpc){
        return NodeTest.isElementOrAttribute(n) && 
		    NodeTest.nameSpaceMatches(this.prefix, xpc, n);
	},
	toString: function () {
		return this.prefix + ":*";
	}
}, function (prefix) { this.prefix = prefix; });

NodeTest.NameTestQName = NodeTest.makeNodeTestType(NodeTest.NAMETESTQNAME, {
	matches: function (n, xpc) {
		return NodeTest.isNodeType([1, 2, XPathNamespace.XPATH_NAMESPACE_NODE])(n) &&
		    NodeTest.nameSpaceMatches(this.prefix, xpc, n) &&
            NodeTest.localNameMatches(this.localName, xpc, n);
	},
	toString: function () {
        return this.name;
	}
}, function (name) { 
    var nameParts = name.split(':');
	
	this.name = name;
	this.prefix = nameParts.length > 1 ? nameParts[0] : null;
	this.localName = nameParts[nameParts.length > 1 ? 1 : 0];
});

NodeTest.PITest = NodeTest.makeNodeTestType(NodeTest.PI, {
	matches: function (n, xpc) {
		return NodeTest.isNodeType([7])(n) && (n.target || n.nodeName) === this.name;
	},
	toString: function () {
        return wrap('processing-instruction("', '")', this.name);
	}
}, function (name) { this.name = name; })

// singletons

// elements, attributes, namespaces
NodeTest.nameTestAny = NodeTest.makeNodeTypeTest(NodeTest.NAMETESTANY, [1, 2, XPathNamespace.XPATH_NAMESPACE_NODE], '*');
// text, cdata
NodeTest.textTest = NodeTest.makeNodeTypeTest(NodeTest.TEXT, [3, 4], 'text()');
NodeTest.commentTest = NodeTest.makeNodeTypeTest(NodeTest.COMMENT, [8], 'comment()');
// elements, attributes, text, cdata, PIs, comments, document nodes
NodeTest.nodeTest = NodeTest.makeNodeTypeTest(NodeTest.NODE, [1, 2, 3, 4, 7, 8, 9], 'node()');
NodeTest.anyPiTest = NodeTest.makeNodeTypeTest(NodeTest.PI, [7], 'processing-instruction()');

// VariableReference /////////////////////////////////////////////////////////

VariableReference.prototype = new Expression();
VariableReference.prototype.constructor = VariableReference;
VariableReference.superclass = Expression.prototype;

function VariableReference(v) {
	if (arguments.length > 0) {
		this.init(v);
	}
}

VariableReference.prototype.init = function(v) {
	this.variable = v;
};

VariableReference.prototype.toString = function() {
	return "$" + this.variable;
};

VariableReference.prototype.evaluate = function(c) {
    var parts = Utilities.resolveQName(this.variable, c.namespaceResolver, c.contextNode, false);

    if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
    }
	var result = c.variableResolver.getVariable(parts[1], parts[0]);
    if (!result) {
        throw XPathException.fromMessage("Undeclared variable: " + this.toString());
    }
    return result;
};

// FunctionCall //////////////////////////////////////////////////////////////

FunctionCall.prototype = new Expression();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.superclass = Expression.prototype;

function FunctionCall(fn, args) {
	if (arguments.length > 0) {
		this.init(fn, args);
	}
}

FunctionCall.prototype.init = function(fn, args) {
	this.functionName = fn;
	this.arguments = args;
};

FunctionCall.prototype.toString = function() {
	var s = this.functionName + "(";
	for (var i = 0; i < this.arguments.length; i++) {
		if (i > 0) {
			s += ", ";
		}
		s += this.arguments[i].toString();
	}
	return s + ")";
};

FunctionCall.prototype.evaluate = function(c) {
    var f = FunctionResolver.getFunctionFromContext(this.functionName, c);

    if (!f) {
		throw new Error("Unknown function " + this.functionName);
	}

    var a = [c].concat(this.arguments);
	return f.apply(c.functionResolver.thisArg, a);
};

// Operators /////////////////////////////////////////////////////////////////

var Operators = new Object();

Operators.equals = function(l, r) {
	return l.equals(r);
};

Operators.notequal = function(l, r) {
	return l.notequal(r);
};

Operators.lessthan = function(l, r) {
	return l.lessthan(r);
};

Operators.greaterthan = function(l, r) {
	return l.greaterthan(r);
};

Operators.lessthanorequal = function(l, r) {
	return l.lessthanorequal(r);
};

Operators.greaterthanorequal = function(l, r) {
	return l.greaterthanorequal(r);
};

// XString ///////////////////////////////////////////////////////////////////

XString.prototype = new Expression();
XString.prototype.constructor = XString;
XString.superclass = Expression.prototype;

function XString(s) {
	if (arguments.length > 0) {
		this.init(s);
	}
}

XString.prototype.init = function(s) {
	this.str = String(s);
};

XString.prototype.toString = function() {
	return this.str;
};

XString.prototype.evaluate = function(c) {
	return this;
};

XString.prototype.string = function() {
	return this;
};

XString.prototype.number = function() {
	return new XNumber(this.str);
};

XString.prototype.bool = function() {
	return new XBoolean(this.str);
};

XString.prototype.nodeset = function() {
	throw new Error("Cannot convert string to nodeset");
};

XString.prototype.stringValue = function() {
	return this.str;
};

XString.prototype.numberValue = function() {
	return this.number().numberValue();
};

XString.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XString.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().equals(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.equals);
	}
	return new XBoolean(this.str == r.str);
};

XString.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().notequal(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.notequal);
	}
	return new XBoolean(this.str != r.str);
};

XString.prototype.lessthan = function(r) {
	return this.number().lessthan(r);
};

XString.prototype.greaterthan = function(r) {
	return this.number().greaterthan(r);
};

XString.prototype.lessthanorequal = function(r) {
	return this.number().lessthanorequal(r);
};

XString.prototype.greaterthanorequal = function(r) {
	return this.number().greaterthanorequal(r);
};

// XNumber ///////////////////////////////////////////////////////////////////

XNumber.prototype = new Expression();
XNumber.prototype.constructor = XNumber;
XNumber.superclass = Expression.prototype;

function XNumber(n) {
	if (arguments.length > 0) {
		this.init(n);
	}
}

XNumber.prototype.init = function(n) {
	this.num = typeof n === "string" ? this.parse(n) : Number(n);
};

XNumber.prototype.numberFormat = /^\s*-?[0-9]*\.?[0-9]+\s*$/;

XNumber.prototype.parse = function(s) {
    // XPath representation of numbers is more restrictive than what Number() or parseFloat() allow
    return this.numberFormat.test(s) ? parseFloat(s) : Number.NaN;
};

function padSmallNumber(numberStr) {
	var parts = numberStr.split('e-');
	var base = parts[0].replace('.', '');
	var exponent = Number(parts[1]);
	
	for (var i = 0; i < exponent - 1; i += 1) {
		base = '0' + base;
	}
	
	return '0.' + base;
}

function padLargeNumber(numberStr) {
	var parts = numberStr.split('e');
	var base = parts[0].replace('.', '');
	var exponent = Number(parts[1]);
	var zerosToAppend = exponent + 1 - base.length;
	
	for (var i = 0; i < zerosToAppend; i += 1){
		base += '0';
	}
	
	return base;
}

XNumber.prototype.toString = function() {
	var strValue = this.num.toString();

	if (strValue.indexOf('e-') !== -1) {
		return padSmallNumber(strValue);
	}
    
	if (strValue.indexOf('e') !== -1) {
		return padLargeNumber(strValue);
	}
	
	return strValue;
};

XNumber.prototype.evaluate = function(c) {
	return this;
};

XNumber.prototype.string = function() {
	
	
	return new XString(this.toString());
};

XNumber.prototype.number = function() {
	return this;
};

XNumber.prototype.bool = function() {
	return new XBoolean(this.num);
};

XNumber.prototype.nodeset = function() {
	throw new Error("Cannot convert number to nodeset");
};

XNumber.prototype.stringValue = function() {
	return this.string().stringValue();
};

XNumber.prototype.numberValue = function() {
	return this.num;
};

XNumber.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XNumber.prototype.negate = function() {
	return new XNumber(-this.num);
};

XNumber.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.equals(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.equals);
	}
	return new XBoolean(this.num == r.num);
};

XNumber.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.notequal(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.notequal);
	}
	return new XBoolean(this.num != r.num);
};

XNumber.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthan(r.number());
	}
	return new XBoolean(this.num < r.num);
};

XNumber.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthan(r.number());
	}
	return new XBoolean(this.num > r.num);
};

XNumber.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthanorequal(r.number());
	}
	return new XBoolean(this.num <= r.num);
};

XNumber.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthanorequal(r.number());
	}
	return new XBoolean(this.num >= r.num);
};

XNumber.prototype.plus = function(r) {
	return new XNumber(this.num + r.num);
};

XNumber.prototype.minus = function(r) {
	return new XNumber(this.num - r.num);
};

XNumber.prototype.multiply = function(r) {
	return new XNumber(this.num * r.num);
};

XNumber.prototype.div = function(r) {
	return new XNumber(this.num / r.num);
};

XNumber.prototype.mod = function(r) {
	return new XNumber(this.num % r.num);
};

// XBoolean //////////////////////////////////////////////////////////////////

XBoolean.prototype = new Expression();
XBoolean.prototype.constructor = XBoolean;
XBoolean.superclass = Expression.prototype;

function XBoolean(b) {
	if (arguments.length > 0) {
		this.init(b);
	}
}

XBoolean.prototype.init = function(b) {
	this.b = Boolean(b);
};

XBoolean.prototype.toString = function() {
	return this.b.toString();
};

XBoolean.prototype.evaluate = function(c) {
	return this;
};

XBoolean.prototype.string = function() {
	return new XString(this.b);
};

XBoolean.prototype.number = function() {
	return new XNumber(this.b);
};

XBoolean.prototype.bool = function() {
	return this;
};

XBoolean.prototype.nodeset = function() {
	throw new Error("Cannot convert boolean to nodeset");
};

XBoolean.prototype.stringValue = function() {
	return this.string().stringValue();
};

XBoolean.prototype.numberValue = function() {
	return this.number().numberValue();
};

XBoolean.prototype.booleanValue = function() {
	return this.b;
};

XBoolean.prototype.not = function() {
	return new XBoolean(!this.b);
};

XBoolean.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.equals(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.equals);
	}
	return new XBoolean(this.b == r.b);
};

XBoolean.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.notequal(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.notequal);
	}
	return new XBoolean(this.b != r.b);
};

XBoolean.prototype.lessthan = function(r) {
	return this.number().lessthan(r);
};

XBoolean.prototype.greaterthan = function(r) {
	return this.number().greaterthan(r);
};

XBoolean.prototype.lessthanorequal = function(r) {
	return this.number().lessthanorequal(r);
};

XBoolean.prototype.greaterthanorequal = function(r) {
	return this.number().greaterthanorequal(r);
};

XBoolean.true_ = new XBoolean(true);
XBoolean.false_ = new XBoolean(false);

// AVLTree ///////////////////////////////////////////////////////////////////

AVLTree.prototype = new Object();
AVLTree.prototype.constructor = AVLTree;
AVLTree.superclass = Object.prototype;

function AVLTree(n) {
	this.init(n);
}

AVLTree.prototype.init = function(n) {
	this.left = null;
    this.right = null;
	this.node = n;
	this.depth = 1;
};

AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? 0 : this.left.depth;
    var rdepth = this.right == null ? 0 : this.right.depth;

	if (ldepth > rdepth + 1) {
        // LR or LL rotation
        var lldepth = this.left.left  == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;

        if (lldepth < lrdepth) {
            // LR rotation consists of a RR rotation of the left child
            this.left.rotateRR();
            // plus a LL rotation of this node, which happens anyway
        }
        this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
        // RR or RL rorarion
		var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
		var rldepth = this.right.left  == null ? 0 : this.right.left.depth;

        if (rldepth > rrdepth) {
            // RR rotation consists of a LL rotation of the right child
            this.right.rotateLL();
            // plus a RR rotation of this node, which happens anyway
        }
        this.rotateRR();
    }
};

AVLTree.prototype.rotateLL = function() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    var nodeBefore = this.node;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.rotateRR = function() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    var nodeBefore = this.node;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.updateInNewLocation = function() {
    this.getDepthFromChildren();
};

AVLTree.prototype.getDepthFromChildren = function() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
};

function nodeOrder(n1, n2) {
	if (n1 === n2) {
		return 0;
	}

	if (n1.compareDocumentPosition) {
	    var cpos = n1.compareDocumentPosition(n2);

        if (cpos & 0x01) {
            // not in the same document; return an arbitrary result (is there a better way to do this)
            return 1;
        }
        if (cpos & 0x0A) {
            // n2 precedes or contains n1
            return 1;
        }
        if (cpos & 0x14) {
            // n2 follows or is contained by n1
            return -1;
        }

	    return 0;
	}

	var d1 = 0,
	    d2 = 0;
	for (var m1 = n1; m1 != null; m1 = m1.parentNode || m1.ownerElement) {
		d1++;
	}
	for (var m2 = n2; m2 != null; m2 = m2.parentNode || m2.ownerElement) {
		d2++;
	}

    // step up to same depth
	if (d1 > d2) {
		while (d1 > d2) {
			n1 = n1.parentNode || n1.ownerElement;
			d1--;
		}
		if (n1 === n2) {
			return 1;
		}
	} else if (d2 > d1) {
		while (d2 > d1) {
			n2 = n2.parentNode || n2.ownerElement;
			d2--;
		}
		if (n1 === n2) {
			return -1;
		}
	}

    var n1Par = n1.parentNode || n1.ownerElement,
        n2Par = n2.parentNode || n2.ownerElement;

    // find common parent
	while (n1Par !== n2Par) {
		n1 = n1Par;
		n2 = n2Par;
		n1Par = n1.parentNode || n1.ownerElement;
	    n2Par = n2.parentNode || n2.ownerElement;
	}
    
    var n1isAttr = Utilities.isAttribute(n1);
    var n2isAttr = Utilities.isAttribute(n2);
    
    if (n1isAttr && !n2isAttr) {
        return -1;
    }
    if (!n1isAttr && n2isAttr) {
        return 1;
    }
    
    if(n1Par) {
	    var cn = n1isAttr ? n1Par.attributes : n1Par.childNodes,
	        len = cn.length;
        for (var i = 0; i < len; i += 1) {
            var n = cn[i];
            if (n === n1) {
                return -1;
            }
            if (n === n2) {
                return 1;
            }
        }
    }        
    
    throw new Error('Unexpected: could not determine node order');
}

AVLTree.prototype.add = function(n)  {
	if (n === this.node) {
        return false;
    }

	var o = nodeOrder(n, this.node);

    var ret = false;
    if (o == -1) {
        if (this.left == null) {
            this.left = new AVLTree(n);
            ret = true;
        } else {
            ret = this.left.add(n);
            if (ret) {
                this.balance();
            }
        }
    } else if (o == 1) {
        if (this.right == null) {
            this.right = new AVLTree(n);
            ret = true;
        } else {
            ret = this.right.add(n);
            if (ret) {
                this.balance();
            }
        }
    }

    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};

// XNodeSet //////////////////////////////////////////////////////////////////

XNodeSet.prototype = new Expression();
XNodeSet.prototype.constructor = XNodeSet;
XNodeSet.superclass = Expression.prototype;

function XNodeSet() {
	this.init();
}

XNodeSet.prototype.init = function() {
    this.tree = null;
	this.nodes = [];
	this.size = 0;
};

XNodeSet.prototype.toString = function() {
	var p = this.first();
	if (p == null) {
		return "";
	}
	return this.stringForNode(p);
};

XNodeSet.prototype.evaluate = function(c) {
	return this;
};

XNodeSet.prototype.string = function() {
	return new XString(this.toString());
};

XNodeSet.prototype.stringValue = function() {
	return this.toString();
};

XNodeSet.prototype.number = function() {
	return new XNumber(this.string());
};

XNodeSet.prototype.numberValue = function() {
	return Number(this.string());
};

XNodeSet.prototype.bool = function() {
	return new XBoolean(this.booleanValue());
};

XNodeSet.prototype.booleanValue = function() {
	return !!this.size;
};

XNodeSet.prototype.nodeset = function() {
	return this;
};

XNodeSet.prototype.stringForNode = function(n) {
	if (n.nodeType == 9   /*Node.DOCUMENT_NODE*/ || 
        n.nodeType == 1   /*Node.ELEMENT_NODE */ || 
        n.nodeType === 11 /*Node.DOCUMENT_FRAGMENT*/) {
		return this.stringForContainerNode(n);
	}
    if (n.nodeType === 2 /* Node.ATTRIBUTE_NODE */) {
        return n.value || n.nodeValue;
    }
	if (n.isNamespaceNode) {
		return n.namespace;
	}
	return n.nodeValue;
};

XNodeSet.prototype.stringForContainerNode = function(n) {
	var s = "";
	for (var n2 = n.firstChild; n2 != null; n2 = n2.nextSibling) {
        var nt = n2.nodeType;
        //  Element,    Text,       CDATA,      Document,   Document Fragment
        if (nt === 1 || nt === 3 || nt === 4 || nt === 9 || nt === 11) {
            s += this.stringForNode(n2);
        }
	}
	return s;
};

XNodeSet.prototype.buildTree = function () {
    if (!this.tree && this.nodes.length) {
        this.tree = new AVLTree(this.nodes[0]);
        for (var i = 1; i < this.nodes.length; i += 1) {
            this.tree.add(this.nodes[i]);
        }
    }

    return this.tree;
};

XNodeSet.prototype.first = function() {
	var p = this.buildTree();
	if (p == null) {
		return null;
	}
	while (p.left != null) {
		p = p.left;
	}
	return p.node;
};

XNodeSet.prototype.add = function(n) {
    for (var i = 0; i < this.nodes.length; i += 1) {
        if (n === this.nodes[i]) {
            return;
        }
    }

    this.tree = null;
    this.nodes.push(n);
    this.size += 1;
};

XNodeSet.prototype.addArray = function(ns) {
	var self = this;
	
	forEach(function (x) { self.add(x); }, ns);
};

/**
 * Returns an array of the node set's contents in document order
 */
XNodeSet.prototype.toArray = function() {
	var a = [];
	this.toArrayRec(this.buildTree(), a);
	return a;
};

XNodeSet.prototype.toArrayRec = function(t, a) {
	if (t != null) {
		this.toArrayRec(t.left, a);
		a.push(t.node);
		this.toArrayRec(t.right, a);
	}
};

/**
 * Returns an array of the node set's contents in arbitrary order
 */
XNodeSet.prototype.toUnsortedArray = function () {
    return this.nodes.slice();
};

XNodeSet.prototype.compareWithString = function(r, o) {
	var a = this.toUnsortedArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithNumber = function(r, o) {
	var a = this.toUnsortedArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XNumber(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithBoolean = function(r, o) {
	return o(this.bool(), r);
};

XNodeSet.prototype.compareWithNodeSet = function(r, o) {
	var arr = this.toUnsortedArray();
	var oInvert = function (lop, rop) { return o(rop, lop); };
	
	for (var i = 0; i < arr.length; i++) {
		var l = new XString(this.stringForNode(arr[i]));

		var res = r.compareWithString(l, oInvert);
		if (res.booleanValue()) {
			return res;
		}
	}
	
	return new XBoolean(false);
};

XNodeSet.compareWith = curry(function (o, r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, o);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, o);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, o);
	}
	return this.compareWithNodeSet(r, o);
});

XNodeSet.prototype.equals = XNodeSet.compareWith(Operators.equals);
XNodeSet.prototype.notequal = XNodeSet.compareWith(Operators.notequal);
XNodeSet.prototype.lessthan = XNodeSet.compareWith(Operators.lessthan);
XNodeSet.prototype.greaterthan = XNodeSet.compareWith(Operators.greaterthan);
XNodeSet.prototype.lessthanorequal = XNodeSet.compareWith(Operators.lessthanorequal);
XNodeSet.prototype.greaterthanorequal = XNodeSet.compareWith(Operators.greaterthanorequal);

XNodeSet.prototype.union = function(r) {
	var ns = new XNodeSet();
    ns.addArray(this.toUnsortedArray());
	ns.addArray(r.toUnsortedArray());
	return ns;
};

// XPathNamespace ////////////////////////////////////////////////////////////

XPathNamespace.prototype = new Object();
XPathNamespace.prototype.constructor = XPathNamespace;
XPathNamespace.superclass = Object.prototype;

function XPathNamespace(pre, ns, p) {
	this.isXPathNamespace = true;
	this.ownerDocument = p.ownerDocument;
	this.nodeName = "#namespace";
	this.prefix = pre;
	this.localName = pre;
	this.namespaceURI = ns;
	this.nodeValue = ns;
	this.ownerElement = p;
	this.nodeType = XPathNamespace.XPATH_NAMESPACE_NODE;
}

XPathNamespace.prototype.toString = function() {
	return "{ \"" + this.prefix + "\", \"" + this.namespaceURI + "\" }";
};

// XPathContext //////////////////////////////////////////////////////////////

XPathContext.prototype = new Object();
XPathContext.prototype.constructor = XPathContext;
XPathContext.superclass = Object.prototype;

function XPathContext(vr, nr, fr) {
	this.variableResolver = vr != null ? vr : new VariableResolver();
	this.namespaceResolver = nr != null ? nr : new NamespaceResolver();
	this.functionResolver = fr != null ? fr : new FunctionResolver();
}

XPathContext.prototype.extend = function (newProps) {
	return assign(new XPathContext(), this, newProps);
};

// VariableResolver //////////////////////////////////////////////////////////

VariableResolver.prototype = new Object();
VariableResolver.prototype.constructor = VariableResolver;
VariableResolver.superclass = Object.prototype;

function VariableResolver() {
}

VariableResolver.prototype.getVariable = function(ln, ns) {
	return null;
};

// FunctionResolver //////////////////////////////////////////////////////////

FunctionResolver.prototype = new Object();
FunctionResolver.prototype.constructor = FunctionResolver;
FunctionResolver.superclass = Object.prototype;

function FunctionResolver(thisArg) {
	this.thisArg = thisArg != null ? thisArg : Functions;
	this.functions = new Object();
	this.addStandardFunctions();
}

FunctionResolver.prototype.addStandardFunctions = function() {
	this.functions["{}last"] = Functions.last;
	this.functions["{}position"] = Functions.position;
	this.functions["{}count"] = Functions.count;
	this.functions["{}id"] = Functions.id;
	this.functions["{}local-name"] = Functions.localName;
	this.functions["{}namespace-uri"] = Functions.namespaceURI;
	this.functions["{}name"] = Functions.name;
	this.functions["{}string"] = Functions.string;
	this.functions["{}concat"] = Functions.concat;
	this.functions["{}starts-with"] = Functions.startsWith;
	this.functions["{}contains"] = Functions.contains;
	this.functions["{}substring-before"] = Functions.substringBefore;
	this.functions["{}substring-after"] = Functions.substringAfter;
	this.functions["{}substring"] = Functions.substring;
	this.functions["{}string-length"] = Functions.stringLength;
	this.functions["{}normalize-space"] = Functions.normalizeSpace;
	this.functions["{}translate"] = Functions.translate;
	this.functions["{}boolean"] = Functions.boolean_;
	this.functions["{}not"] = Functions.not;
	this.functions["{}true"] = Functions.true_;
	this.functions["{}false"] = Functions.false_;
	this.functions["{}lang"] = Functions.lang;
	this.functions["{}number"] = Functions.number;
	this.functions["{}sum"] = Functions.sum;
	this.functions["{}floor"] = Functions.floor;
	this.functions["{}ceiling"] = Functions.ceiling;
	this.functions["{}round"] = Functions.round;
};

FunctionResolver.prototype.addFunction = function(ns, ln, f) {
	this.functions["{" + ns + "}" + ln] = f;
};

FunctionResolver.getFunctionFromContext = function(qName, context) {
    var parts = Utilities.resolveQName(qName, context.namespaceResolver, context.contextNode, false);

    if (parts[0] === null) {
        throw new Error("Cannot resolve QName " + name);
    }

    return context.functionResolver.getFunction(parts[1], parts[0]);
};

FunctionResolver.prototype.getFunction = function(localName, namespace) {
	return this.functions["{" + namespace + "}" + localName];
};

// NamespaceResolver /////////////////////////////////////////////////////////

NamespaceResolver.prototype = new Object();
NamespaceResolver.prototype.constructor = NamespaceResolver;
NamespaceResolver.superclass = Object.prototype;

function NamespaceResolver() {
}

NamespaceResolver.prototype.getNamespace = function(prefix, n) {
	if (prefix == "xml") {
		return XPath.XML_NAMESPACE_URI;
	} else if (prefix == "xmlns") {
		return XPath.XMLNS_NAMESPACE_URI;
	}
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		n = PathExpr.getOwnerElement(n);
	} else if (n.nodeType != 1 /*Node.ELEMENT_NODE*/) {
		n = n.parentNode;
	}
	while (n != null && n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		var nnm = n.attributes;
		for (var i = 0; i < nnm.length; i++) {
			var a = nnm.item(i);
			var aname = a.name || a.nodeName;
			if ((aname === "xmlns" && prefix === "")
					|| aname === "xmlns:" + prefix) {
				return String(a.value || a.nodeValue);
			}
		}
		n = n.parentNode;
	}
	return null;
};

// Functions /////////////////////////////////////////////////////////////////

var Functions = new Object();

Functions.last = function(c) {
	if (arguments.length != 1) {
		throw new Error("Function last expects ()");
	}

	return new XNumber(c.contextSize);
};

Functions.position = function(c) {
	if (arguments.length != 1) {
		throw new Error("Function position expects ()");
	}

	return new XNumber(c.contextPosition);
};

Functions.count = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
		throw new Error("Function count expects (node-set)");
	}
	return new XNumber(ns.size);
};

Functions.id = function() {
	var c = arguments[0];
	var id;
	if (arguments.length != 2) {
		throw new Error("Function id expects (object)");
	}
	id = arguments[1].evaluate(c);
	if (Utilities.instance_of(id, XNodeSet)) {
		id = id.toArray().join(" ");
	} else {
		id = id.stringValue();
	}
	var ids = id.split(/[\x0d\x0a\x09\x20]+/);
	var count = 0;
	var ns = new XNodeSet();
	var doc = c.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? c.contextNode
			: c.contextNode.ownerDocument;
	for (var i = 0; i < ids.length; i++) {
		var n;
		if (doc.getElementById) {
			n = doc.getElementById(ids[i]);
		} else {
			n = Utilities.getElementById(doc, ids[i]);
		}
		if (n != null) {
			ns.add(n);
			count++;
		}
	}
	return ns;
};

Functions.localName = function(c, eNode) {
	var n;
	
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = eNode.evaluate(c).first();
	} else {
		throw new Error("Function local-name expects (node-set?)");
	}
	
	if (n == null) {
		return new XString("");
	}

	return new XString(n.localName ||     //  standard elements and attributes
	                   n.baseName  ||     //  IE
					   n.target    ||     //  processing instructions
                       n.nodeName  ||     //  DOM1 elements
					   "");               //  fallback
};

Functions.namespaceURI = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function namespace-uri expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.namespaceURI);
};

Functions.name = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		return new XString(n.nodeName);
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		return new XString(n.name || n.nodeName);
	} else if (n.nodeType === 7 /*Node.PROCESSING_INSTRUCTION_NODE*/) {
	    return new XString(n.target || n.nodeName);
	} else if (n.localName == null) {
		return new XString("");
	} else {
		return new XString(n.localName);
	}
};

Functions.string = function() {
	var c = arguments[0];
	if (arguments.length == 1) {
		return new XString(XNodeSet.prototype.stringForNode(c.contextNode));
	} else if (arguments.length == 2) {
		return arguments[1].evaluate(c).string();
	}
	throw new Error("Function string expects (object?)");
};

Functions.concat = function(c) {
	if (arguments.length < 3) {
		throw new Error("Function concat expects (string, string[, string]*)");
	}
	var s = "";
	for (var i = 1; i < arguments.length; i++) {
		s += arguments[i].evaluate(c).stringValue();
	}
	return new XString(s);
};

Functions.startsWith = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function startsWith expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.substring(0, s2.length) == s2);
};

Functions.contains = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function contains expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.indexOf(s2) !== -1);
};

Functions.substringBefore = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-before expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XString(s1.substring(0, s1.indexOf(s2)));
};

Functions.substringAfter = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-after expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	if (s2.length == 0) {
		return new XString(s1);
	}
	var i = s1.indexOf(s2);
	if (i == -1) {
		return new XString("");
	}
	return new XString(s1.substring(i + s2.length));
};

Functions.substring = function() {
	var c = arguments[0];
	if (!(arguments.length == 3 || arguments.length == 4)) {
		throw new Error("Function substring expects (string, number, number?)");
	}
	var s = arguments[1].evaluate(c).stringValue();
	var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
	var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : undefined;
	return new XString(s.substring(n1, n2));
};

Functions.stringLength = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function string-length expects (string?)");
	}
	return new XNumber(s.length);
};

Functions.normalizeSpace = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function normalize-space expects (string?)");
	}
	var i = 0;
	var j = s.length - 1;
	while (Utilities.isSpace(s.charCodeAt(j))) {
		j--;
	}
	var t = "";
	while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
		i++;
	}
	while (i <= j) {
		if (Utilities.isSpace(s.charCodeAt(i))) {
			t += " ";
			while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
				i++;
			}
		} else {
			t += s.charAt(i);
			i++;
		}
	}
	return new XString(t);
};

Functions.translate = function(c, eValue, eFrom, eTo) {
	if (arguments.length != 4) {
		throw new Error("Function translate expects (string, string, string)");
	}

	var value = eValue.evaluate(c).stringValue();
	var from = eFrom.evaluate(c).stringValue();
	var to = eTo.evaluate(c).stringValue();
	
	var cMap = reduce(function (acc, ch, i) {
		if (!(ch in acc)) {
			acc[ch] = i > to.length ? '' : to[i];
		}
		return acc;
	}, {}, from);

    var t = join('', map(function (ch) {
        return ch in cMap ? cMap[ch] : ch;
    }, value));

	return new XString(t);
};

Functions.boolean_ = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function boolean expects (object)");
	}
	return arguments[1].evaluate(c).bool();
};

Functions.not = function(c, eValue) {
	if (arguments.length != 2) {
		throw new Error("Function not expects (object)");
	}
	return eValue.evaluate(c).bool().not();
};

Functions.true_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function true expects ()");
	}
	return XBoolean.true_;
};

Functions.false_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function false expects ()");
	}
	return XBoolean.false_;
};

Functions.lang = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function lang expects (string)");
	}
	var lang;
	for (var n = c.contextNode; n != null && n.nodeType != 9 /*Node.DOCUMENT_NODE*/; n = n.parentNode) {
		var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
		if (a != null) {
			lang = String(a);
			break;
		}
	}
	if (lang == null) {
		return XBoolean.false_;
	}
	var s = arguments[1].evaluate(c).stringValue();
	return new XBoolean(lang.substring(0, s.length) == s
				&& (lang.length == s.length || lang.charAt(s.length) == '-'));
};

Functions.number = function() {
	var c = arguments[0];
	if (!(arguments.length == 1 || arguments.length == 2)) {
		throw new Error("Function number expects (object?)");
	}
	if (arguments.length == 1) {
		return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
	}
	return arguments[1].evaluate(c).number();
};

Functions.sum = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of((ns = arguments[1].evaluate(c)), XNodeSet)) {
		throw new Error("Function sum expects (node-set)");
	}
	ns = ns.toUnsortedArray();
	var n = 0;
	for (var i = 0; i < ns.length; i++) {
		n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
	}
	return new XNumber(n);
};

Functions.floor = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function floor expects (number)");
	}
	return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
};

Functions.ceiling = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function ceiling expects (number)");
	}
	return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
};

Functions.round = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function round expects (number)");
	}
	return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
};

// Utilities /////////////////////////////////////////////////////////////////

var Utilities = new Object();

Utilities.isAttribute = function (val) {
    return val && (val.nodeType === 2 || val.ownerElement);
}

Utilities.splitQName = function(qn) {
	var i = qn.indexOf(":");
	if (i == -1) {
		return [ null, qn ];
	}
	return [ qn.substring(0, i), qn.substring(i + 1) ];
};

Utilities.resolveQName = function(qn, nr, n, useDefault) {
	var parts = Utilities.splitQName(qn);
	if (parts[0] != null) {
		parts[0] = nr.getNamespace(parts[0], n);
	} else {
		if (useDefault) {
			parts[0] = nr.getNamespace("", n);
			if (parts[0] == null) {
				parts[0] = "";
			}
		} else {
			parts[0] = "";
		}
	}
	return parts;
};

Utilities.isSpace = function(c) {
	return c == 0x9 || c == 0xd || c == 0xa || c == 0x20;
};

Utilities.isLetter = function(c) {
	return c >= 0x0041 && c <= 0x005A ||
		c >= 0x0061 && c <= 0x007A ||
		c >= 0x00C0 && c <= 0x00D6 ||
		c >= 0x00D8 && c <= 0x00F6 ||
		c >= 0x00F8 && c <= 0x00FF ||
		c >= 0x0100 && c <= 0x0131 ||
		c >= 0x0134 && c <= 0x013E ||
		c >= 0x0141 && c <= 0x0148 ||
		c >= 0x014A && c <= 0x017E ||
		c >= 0x0180 && c <= 0x01C3 ||
		c >= 0x01CD && c <= 0x01F0 ||
		c >= 0x01F4 && c <= 0x01F5 ||
		c >= 0x01FA && c <= 0x0217 ||
		c >= 0x0250 && c <= 0x02A8 ||
		c >= 0x02BB && c <= 0x02C1 ||
		c == 0x0386 ||
		c >= 0x0388 && c <= 0x038A ||
		c == 0x038C ||
		c >= 0x038E && c <= 0x03A1 ||
		c >= 0x03A3 && c <= 0x03CE ||
		c >= 0x03D0 && c <= 0x03D6 ||
		c == 0x03DA ||
		c == 0x03DC ||
		c == 0x03DE ||
		c == 0x03E0 ||
		c >= 0x03E2 && c <= 0x03F3 ||
		c >= 0x0401 && c <= 0x040C ||
		c >= 0x040E && c <= 0x044F ||
		c >= 0x0451 && c <= 0x045C ||
		c >= 0x045E && c <= 0x0481 ||
		c >= 0x0490 && c <= 0x04C4 ||
		c >= 0x04C7 && c <= 0x04C8 ||
		c >= 0x04CB && c <= 0x04CC ||
		c >= 0x04D0 && c <= 0x04EB ||
		c >= 0x04EE && c <= 0x04F5 ||
		c >= 0x04F8 && c <= 0x04F9 ||
		c >= 0x0531 && c <= 0x0556 ||
		c == 0x0559 ||
		c >= 0x0561 && c <= 0x0586 ||
		c >= 0x05D0 && c <= 0x05EA ||
		c >= 0x05F0 && c <= 0x05F2 ||
		c >= 0x0621 && c <= 0x063A ||
		c >= 0x0641 && c <= 0x064A ||
		c >= 0x0671 && c <= 0x06B7 ||
		c >= 0x06BA && c <= 0x06BE ||
		c >= 0x06C0 && c <= 0x06CE ||
		c >= 0x06D0 && c <= 0x06D3 ||
		c == 0x06D5 ||
		c >= 0x06E5 && c <= 0x06E6 ||
		c >= 0x0905 && c <= 0x0939 ||
		c == 0x093D ||
		c >= 0x0958 && c <= 0x0961 ||
		c >= 0x0985 && c <= 0x098C ||
		c >= 0x098F && c <= 0x0990 ||
		c >= 0x0993 && c <= 0x09A8 ||
		c >= 0x09AA && c <= 0x09B0 ||
		c == 0x09B2 ||
		c >= 0x09B6 && c <= 0x09B9 ||
		c >= 0x09DC && c <= 0x09DD ||
		c >= 0x09DF && c <= 0x09E1 ||
		c >= 0x09F0 && c <= 0x09F1 ||
		c >= 0x0A05 && c <= 0x0A0A ||
		c >= 0x0A0F && c <= 0x0A10 ||
		c >= 0x0A13 && c <= 0x0A28 ||
		c >= 0x0A2A && c <= 0x0A30 ||
		c >= 0x0A32 && c <= 0x0A33 ||
		c >= 0x0A35 && c <= 0x0A36 ||
		c >= 0x0A38 && c <= 0x0A39 ||
		c >= 0x0A59 && c <= 0x0A5C ||
		c == 0x0A5E ||
		c >= 0x0A72 && c <= 0x0A74 ||
		c >= 0x0A85 && c <= 0x0A8B ||
		c == 0x0A8D ||
		c >= 0x0A8F && c <= 0x0A91 ||
		c >= 0x0A93 && c <= 0x0AA8 ||
		c >= 0x0AAA && c <= 0x0AB0 ||
		c >= 0x0AB2 && c <= 0x0AB3 ||
		c >= 0x0AB5 && c <= 0x0AB9 ||
		c == 0x0ABD ||
		c == 0x0AE0 ||
		c >= 0x0B05 && c <= 0x0B0C ||
		c >= 0x0B0F && c <= 0x0B10 ||
		c >= 0x0B13 && c <= 0x0B28 ||
		c >= 0x0B2A && c <= 0x0B30 ||
		c >= 0x0B32 && c <= 0x0B33 ||
		c >= 0x0B36 && c <= 0x0B39 ||
		c == 0x0B3D ||
		c >= 0x0B5C && c <= 0x0B5D ||
		c >= 0x0B5F && c <= 0x0B61 ||
		c >= 0x0B85 && c <= 0x0B8A ||
		c >= 0x0B8E && c <= 0x0B90 ||
		c >= 0x0B92 && c <= 0x0B95 ||
		c >= 0x0B99 && c <= 0x0B9A ||
		c == 0x0B9C ||
		c >= 0x0B9E && c <= 0x0B9F ||
		c >= 0x0BA3 && c <= 0x0BA4 ||
		c >= 0x0BA8 && c <= 0x0BAA ||
		c >= 0x0BAE && c <= 0x0BB5 ||
		c >= 0x0BB7 && c <= 0x0BB9 ||
		c >= 0x0C05 && c <= 0x0C0C ||
		c >= 0x0C0E && c <= 0x0C10 ||
		c >= 0x0C12 && c <= 0x0C28 ||
		c >= 0x0C2A && c <= 0x0C33 ||
		c >= 0x0C35 && c <= 0x0C39 ||
		c >= 0x0C60 && c <= 0x0C61 ||
		c >= 0x0C85 && c <= 0x0C8C ||
		c >= 0x0C8E && c <= 0x0C90 ||
		c >= 0x0C92 && c <= 0x0CA8 ||
		c >= 0x0CAA && c <= 0x0CB3 ||
		c >= 0x0CB5 && c <= 0x0CB9 ||
		c == 0x0CDE ||
		c >= 0x0CE0 && c <= 0x0CE1 ||
		c >= 0x0D05 && c <= 0x0D0C ||
		c >= 0x0D0E && c <= 0x0D10 ||
		c >= 0x0D12 && c <= 0x0D28 ||
		c >= 0x0D2A && c <= 0x0D39 ||
		c >= 0x0D60 && c <= 0x0D61 ||
		c >= 0x0E01 && c <= 0x0E2E ||
		c == 0x0E30 ||
		c >= 0x0E32 && c <= 0x0E33 ||
		c >= 0x0E40 && c <= 0x0E45 ||
		c >= 0x0E81 && c <= 0x0E82 ||
		c == 0x0E84 ||
		c >= 0x0E87 && c <= 0x0E88 ||
		c == 0x0E8A ||
		c == 0x0E8D ||
		c >= 0x0E94 && c <= 0x0E97 ||
		c >= 0x0E99 && c <= 0x0E9F ||
		c >= 0x0EA1 && c <= 0x0EA3 ||
		c == 0x0EA5 ||
		c == 0x0EA7 ||
		c >= 0x0EAA && c <= 0x0EAB ||
		c >= 0x0EAD && c <= 0x0EAE ||
		c == 0x0EB0 ||
		c >= 0x0EB2 && c <= 0x0EB3 ||
		c == 0x0EBD ||
		c >= 0x0EC0 && c <= 0x0EC4 ||
		c >= 0x0F40 && c <= 0x0F47 ||
		c >= 0x0F49 && c <= 0x0F69 ||
		c >= 0x10A0 && c <= 0x10C5 ||
		c >= 0x10D0 && c <= 0x10F6 ||
		c == 0x1100 ||
		c >= 0x1102 && c <= 0x1103 ||
		c >= 0x1105 && c <= 0x1107 ||
		c == 0x1109 ||
		c >= 0x110B && c <= 0x110C ||
		c >= 0x110E && c <= 0x1112 ||
		c == 0x113C ||
		c == 0x113E ||
		c == 0x1140 ||
		c == 0x114C ||
		c == 0x114E ||
		c == 0x1150 ||
		c >= 0x1154 && c <= 0x1155 ||
		c == 0x1159 ||
		c >= 0x115F && c <= 0x1161 ||
		c == 0x1163 ||
		c == 0x1165 ||
		c == 0x1167 ||
		c == 0x1169 ||
		c >= 0x116D && c <= 0x116E ||
		c >= 0x1172 && c <= 0x1173 ||
		c == 0x1175 ||
		c == 0x119E ||
		c == 0x11A8 ||
		c == 0x11AB ||
		c >= 0x11AE && c <= 0x11AF ||
		c >= 0x11B7 && c <= 0x11B8 ||
		c == 0x11BA ||
		c >= 0x11BC && c <= 0x11C2 ||
		c == 0x11EB ||
		c == 0x11F0 ||
		c == 0x11F9 ||
		c >= 0x1E00 && c <= 0x1E9B ||
		c >= 0x1EA0 && c <= 0x1EF9 ||
		c >= 0x1F00 && c <= 0x1F15 ||
		c >= 0x1F18 && c <= 0x1F1D ||
		c >= 0x1F20 && c <= 0x1F45 ||
		c >= 0x1F48 && c <= 0x1F4D ||
		c >= 0x1F50 && c <= 0x1F57 ||
		c == 0x1F59 ||
		c == 0x1F5B ||
		c == 0x1F5D ||
		c >= 0x1F5F && c <= 0x1F7D ||
		c >= 0x1F80 && c <= 0x1FB4 ||
		c >= 0x1FB6 && c <= 0x1FBC ||
		c == 0x1FBE ||
		c >= 0x1FC2 && c <= 0x1FC4 ||
		c >= 0x1FC6 && c <= 0x1FCC ||
		c >= 0x1FD0 && c <= 0x1FD3 ||
		c >= 0x1FD6 && c <= 0x1FDB ||
		c >= 0x1FE0 && c <= 0x1FEC ||
		c >= 0x1FF2 && c <= 0x1FF4 ||
		c >= 0x1FF6 && c <= 0x1FFC ||
		c == 0x2126 ||
		c >= 0x212A && c <= 0x212B ||
		c == 0x212E ||
		c >= 0x2180 && c <= 0x2182 ||
		c >= 0x3041 && c <= 0x3094 ||
		c >= 0x30A1 && c <= 0x30FA ||
		c >= 0x3105 && c <= 0x312C ||
		c >= 0xAC00 && c <= 0xD7A3 ||
		c >= 0x4E00 && c <= 0x9FA5 ||
		c == 0x3007 ||
		c >= 0x3021 && c <= 0x3029;
};

Utilities.isNCNameChar = function(c) {
	return c >= 0x0030 && c <= 0x0039
		|| c >= 0x0660 && c <= 0x0669
		|| c >= 0x06F0 && c <= 0x06F9
		|| c >= 0x0966 && c <= 0x096F
		|| c >= 0x09E6 && c <= 0x09EF
		|| c >= 0x0A66 && c <= 0x0A6F
		|| c >= 0x0AE6 && c <= 0x0AEF
		|| c >= 0x0B66 && c <= 0x0B6F
		|| c >= 0x0BE7 && c <= 0x0BEF
		|| c >= 0x0C66 && c <= 0x0C6F
		|| c >= 0x0CE6 && c <= 0x0CEF
		|| c >= 0x0D66 && c <= 0x0D6F
		|| c >= 0x0E50 && c <= 0x0E59
		|| c >= 0x0ED0 && c <= 0x0ED9
		|| c >= 0x0F20 && c <= 0x0F29
		|| c == 0x002E
		|| c == 0x002D
		|| c == 0x005F
		|| Utilities.isLetter(c)
		|| c >= 0x0300 && c <= 0x0345
		|| c >= 0x0360 && c <= 0x0361
		|| c >= 0x0483 && c <= 0x0486
		|| c >= 0x0591 && c <= 0x05A1
		|| c >= 0x05A3 && c <= 0x05B9
		|| c >= 0x05BB && c <= 0x05BD
		|| c == 0x05BF
		|| c >= 0x05C1 && c <= 0x05C2
		|| c == 0x05C4
		|| c >= 0x064B && c <= 0x0652
		|| c == 0x0670
		|| c >= 0x06D6 && c <= 0x06DC
		|| c >= 0x06DD && c <= 0x06DF
		|| c >= 0x06E0 && c <= 0x06E4
		|| c >= 0x06E7 && c <= 0x06E8
		|| c >= 0x06EA && c <= 0x06ED
		|| c >= 0x0901 && c <= 0x0903
		|| c == 0x093C
		|| c >= 0x093E && c <= 0x094C
		|| c == 0x094D
		|| c >= 0x0951 && c <= 0x0954
		|| c >= 0x0962 && c <= 0x0963
		|| c >= 0x0981 && c <= 0x0983
		|| c == 0x09BC
		|| c == 0x09BE
		|| c == 0x09BF
		|| c >= 0x09C0 && c <= 0x09C4
		|| c >= 0x09C7 && c <= 0x09C8
		|| c >= 0x09CB && c <= 0x09CD
		|| c == 0x09D7
		|| c >= 0x09E2 && c <= 0x09E3
		|| c == 0x0A02
		|| c == 0x0A3C
		|| c == 0x0A3E
		|| c == 0x0A3F
		|| c >= 0x0A40 && c <= 0x0A42
		|| c >= 0x0A47 && c <= 0x0A48
		|| c >= 0x0A4B && c <= 0x0A4D
		|| c >= 0x0A70 && c <= 0x0A71
		|| c >= 0x0A81 && c <= 0x0A83
		|| c == 0x0ABC
		|| c >= 0x0ABE && c <= 0x0AC5
		|| c >= 0x0AC7 && c <= 0x0AC9
		|| c >= 0x0ACB && c <= 0x0ACD
		|| c >= 0x0B01 && c <= 0x0B03
		|| c == 0x0B3C
		|| c >= 0x0B3E && c <= 0x0B43
		|| c >= 0x0B47 && c <= 0x0B48
		|| c >= 0x0B4B && c <= 0x0B4D
		|| c >= 0x0B56 && c <= 0x0B57
		|| c >= 0x0B82 && c <= 0x0B83
		|| c >= 0x0BBE && c <= 0x0BC2
		|| c >= 0x0BC6 && c <= 0x0BC8
		|| c >= 0x0BCA && c <= 0x0BCD
		|| c == 0x0BD7
		|| c >= 0x0C01 && c <= 0x0C03
		|| c >= 0x0C3E && c <= 0x0C44
		|| c >= 0x0C46 && c <= 0x0C48
		|| c >= 0x0C4A && c <= 0x0C4D
		|| c >= 0x0C55 && c <= 0x0C56
		|| c >= 0x0C82 && c <= 0x0C83
		|| c >= 0x0CBE && c <= 0x0CC4
		|| c >= 0x0CC6 && c <= 0x0CC8
		|| c >= 0x0CCA && c <= 0x0CCD
		|| c >= 0x0CD5 && c <= 0x0CD6
		|| c >= 0x0D02 && c <= 0x0D03
		|| c >= 0x0D3E && c <= 0x0D43
		|| c >= 0x0D46 && c <= 0x0D48
		|| c >= 0x0D4A && c <= 0x0D4D
		|| c == 0x0D57
		|| c == 0x0E31
		|| c >= 0x0E34 && c <= 0x0E3A
		|| c >= 0x0E47 && c <= 0x0E4E
		|| c == 0x0EB1
		|| c >= 0x0EB4 && c <= 0x0EB9
		|| c >= 0x0EBB && c <= 0x0EBC
		|| c >= 0x0EC8 && c <= 0x0ECD
		|| c >= 0x0F18 && c <= 0x0F19
		|| c == 0x0F35
		|| c == 0x0F37
		|| c == 0x0F39
		|| c == 0x0F3E
		|| c == 0x0F3F
		|| c >= 0x0F71 && c <= 0x0F84
		|| c >= 0x0F86 && c <= 0x0F8B
		|| c >= 0x0F90 && c <= 0x0F95
		|| c == 0x0F97
		|| c >= 0x0F99 && c <= 0x0FAD
		|| c >= 0x0FB1 && c <= 0x0FB7
		|| c == 0x0FB9
		|| c >= 0x20D0 && c <= 0x20DC
		|| c == 0x20E1
		|| c >= 0x302A && c <= 0x302F
		|| c == 0x3099
		|| c == 0x309A
		|| c == 0x00B7
		|| c == 0x02D0
		|| c == 0x02D1
		|| c == 0x0387
		|| c == 0x0640
		|| c == 0x0E46
		|| c == 0x0EC6
		|| c == 0x3005
		|| c >= 0x3031 && c <= 0x3035
		|| c >= 0x309D && c <= 0x309E
		|| c >= 0x30FC && c <= 0x30FE;
};

Utilities.coalesceText = function(n) {
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		if (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
			var s = m.nodeValue;
			var first = m;
			m = m.nextSibling;
			while (m != null && (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/)) {
				s += m.nodeValue;
				var del = m;
				m = m.nextSibling;
				del.parentNode.removeChild(del);
			}
			if (first.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
				var p = first.parentNode;
				if (first.nextSibling == null) {
					p.removeChild(first);
					p.appendChild(p.ownerDocument.createTextNode(s));
				} else {
					var next = first.nextSibling;
					p.removeChild(first);
					p.insertBefore(p.ownerDocument.createTextNode(s), next);
				}
			} else {
				first.nodeValue = s;
			}
			if (m == null) {
				break;
			}
		} else if (m.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			Utilities.coalesceText(m);
		}
	}
};

Utilities.instance_of = function(o, c) {
	while (o != null) {
		if (o.constructor === c) {
			return true;
		}
		if (o === Object) {
			return false;
		}
		o = o.constructor.superclass;
	}
	return false;
};

Utilities.getElementById = function(n, id) {
	// Note that this does not check the DTD to check for actual
	// attributes of type ID, so this may be a bit wrong.
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		if (n.getAttribute("id") == id
				|| n.getAttributeNS(null, "id") == id) {
			return n;
		}
	}
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		var res = Utilities.getElementById(m, id);
		if (res != null) {
			return res;
		}
	}
	return null;
};

// XPathException ////////////////////////////////////////////////////////////

var XPathException = (function () {
    function getMessage(code, exception) {
        var msg = exception ? ": " + exception.toString() : "";
        switch (code) {
            case XPathException.INVALID_EXPRESSION_ERR:
                return "Invalid expression" + msg;
            case XPathException.TYPE_ERR:
                return "Type error" + msg;
        }
        return null;
    }

    function XPathException(code, error, message) {
        var err = Error.call(this, getMessage(code, error) || message);

        err.code = code;
        err.exception = error;

        return err;
    }

    XPathException.prototype = Object.create(Error.prototype);
    XPathException.prototype.constructor = XPathException;
    XPathException.superclass = Error;

    XPathException.prototype.toString = function() {
        return this.message;
    };

    XPathException.fromMessage = function(message, error) {
        return new XPathException(null, error, message);
    };

    XPathException.INVALID_EXPRESSION_ERR = 51;
    XPathException.TYPE_ERR = 52;

    return XPathException;
})();

// XPathExpression ///////////////////////////////////////////////////////////

XPathExpression.prototype = {};
XPathExpression.prototype.constructor = XPathExpression;
XPathExpression.superclass = Object.prototype;

function XPathExpression(e, r, p) {
	this.xpath = p.parse(e);
	this.context = new XPathContext();
	this.context.namespaceResolver = new XPathNSResolverWrapper(r);
}

XPathExpression.getOwnerDocument = function (n) {
	return n.nodeType === 9 /*Node.DOCUMENT_NODE*/ ? n : n.ownerDocument;
}

XPathExpression.detectHtmlDom = function (n) {
	if (!n) { return false; }
	
	var doc = XPathExpression.getOwnerDocument(n);
	
	try {
		return doc.implementation.hasFeature("HTML", "2.0");
	} catch (e) {
		return true;
	}
}

XPathExpression.prototype.evaluate = function(n, t, res) {
	this.context.expressionContextNode = n;
	// backward compatibility - no reliable way to detect whether the DOM is HTML, but
	// this library has been using this method up until now, so we will continue to use it
	// ONLY when using an XPathExpression
	this.context.caseInsensitive = XPathExpression.detectHtmlDom(n);
	
	var result = this.xpath.evaluate(this.context);
	return new XPathResult(result, t);
}

// XPathNSResolverWrapper ////////////////////////////////////////////////////

XPathNSResolverWrapper.prototype = {};
XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
XPathNSResolverWrapper.superclass = Object.prototype;

function XPathNSResolverWrapper(r) {
	this.xpathNSResolver = r;
}

XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
    if (this.xpathNSResolver == null) {
        return null;
    }
	return this.xpathNSResolver.lookupNamespaceURI(prefix);
};

// NodeXPathNSResolver ///////////////////////////////////////////////////////

NodeXPathNSResolver.prototype = {};
NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
NodeXPathNSResolver.superclass = Object.prototype;

function NodeXPathNSResolver(n) {
	this.node = n;
	this.namespaceResolver = new NamespaceResolver();
}

NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
	return this.namespaceResolver.getNamespace(prefix, this.node);
};

// XPathResult ///////////////////////////////////////////////////////////////

XPathResult.prototype = {};
XPathResult.prototype.constructor = XPathResult;
XPathResult.superclass = Object.prototype;

function XPathResult(v, t) {
	if (t == XPathResult.ANY_TYPE) {
		if (v.constructor === XString) {
			t = XPathResult.STRING_TYPE;
		} else if (v.constructor === XNumber) {
			t = XPathResult.NUMBER_TYPE;
		} else if (v.constructor === XBoolean) {
			t = XPathResult.BOOLEAN_TYPE;
		} else if (v.constructor === XNodeSet) {
			t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
		}
	}
	this.resultType = t;
	switch (t) {
		case XPathResult.NUMBER_TYPE:
			this.numberValue = v.numberValue();
			return;
		case XPathResult.STRING_TYPE:
			this.stringValue = v.stringValue();
			return;
		case XPathResult.BOOLEAN_TYPE:
			this.booleanValue = v.booleanValue();
			return;
		case XPathResult.ANY_UNORDERED_NODE_TYPE:
		case XPathResult.FIRST_ORDERED_NODE_TYPE:
			if (v.constructor === XNodeSet) {
				this.singleNodeValue = v.first();
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
		case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			if (v.constructor === XNodeSet) {
				this.invalidIteratorState = false;
				this.nodes = v.toArray();
				this.iteratorIndex = 0;
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
		case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			if (v.constructor === XNodeSet) {
				this.nodes = v.toArray();
				this.snapshotLength = this.nodes.length;
				return;
			}
			break;
	}
	throw new XPathException(XPathException.TYPE_ERR);
};

XPathResult.prototype.iterateNext = function() {
	if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[this.iteratorIndex++];
};

XPathResult.prototype.snapshotItem = function(i) {
	if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[i];
};

XPathResult.ANY_TYPE = 0;
XPathResult.NUMBER_TYPE = 1;
XPathResult.STRING_TYPE = 2;
XPathResult.BOOLEAN_TYPE = 3;
XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
XPathResult.FIRST_ORDERED_NODE_TYPE = 9;

// DOM 3 XPath support ///////////////////////////////////////////////////////

function installDOM3XPathSupport(doc, p) {
	doc.createExpression = function(e, r) {
		try {
			return new XPathExpression(e, r, p);
		} catch (e) {
			throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e);
		}
	};
	doc.createNSResolver = function(n) {
		return new NodeXPathNSResolver(n);
	};
	doc.evaluate = function(e, cn, r, t, res) {
		if (t < 0 || t > 9) {
			throw { code: 0, toString: function() { return "Request type not supported"; } };
		}
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
	};
};

// ---------------------------------------------------------------------------

// Install DOM 3 XPath support for the current document.
try {
	var shouldInstall = true;
	try {
		if (document.implementation
				&& document.implementation.hasFeature
				&& document.implementation.hasFeature("XPath", null)) {
			shouldInstall = false;
		}
	} catch (e) {
	}
	if (shouldInstall) {
		installDOM3XPathSupport(document, new XPathParser());
	}
} catch (e) {
}

// ---------------------------------------------------------------------------
// exports for node.js

installDOM3XPathSupport(exports, new XPathParser());

(function() {
    var parser = new XPathParser();

    var defaultNSResolver = new NamespaceResolver();
    var defaultFunctionResolver = new FunctionResolver();
    var defaultVariableResolver = new VariableResolver();

    function makeNSResolverFromFunction(func) {
        return {
            getNamespace: function (prefix, node) {
                var ns = func(prefix, node);

                return ns || defaultNSResolver.getNamespace(prefix, node);
            }
        };
    }

    function makeNSResolverFromObject(obj) {
        return makeNSResolverFromFunction(obj.getNamespace.bind(obj));
    }

    function makeNSResolverFromMap(map) {
        return makeNSResolverFromFunction(function (prefix) {
            return map[prefix];
        });
    }

    function makeNSResolver(resolver) {
        if (resolver && typeof resolver.getNamespace === "function") {
            return makeNSResolverFromObject(resolver);
        }

        if (typeof resolver === "function") {
            return makeNSResolverFromFunction(resolver);
        }

        // assume prefix -> uri mapping
        if (typeof resolver === "object") {
            return makeNSResolverFromMap(resolver);
        }

        return defaultNSResolver;
    }

    /** Converts native JavaScript types to their XPath library equivalent */
    function convertValue(value) {
        if (value === null ||
            typeof value === "undefined" ||
            value instanceof XString ||
            value instanceof XBoolean ||
            value instanceof XNumber ||
            value instanceof XNodeSet) {
            return value;
        }

        switch (typeof value) {
            case "string": return new XString(value);
            case "boolean": return new XBoolean(value);
            case "number": return new XNumber(value);
        }

        // assume node(s)
        var ns = new XNodeSet();
        ns.addArray([].concat(value));
        return ns;
    }

    function makeEvaluator(func) {
        return function (context) {
            var args = Array.prototype.slice.call(arguments, 1).map(function (arg) {
                return arg.evaluate(context);
            });
            var result = func.apply(this, [].concat(context, args));
            return convertValue(result);
        };
    }

    function makeFunctionResolverFromFunction(func) {
        return {
            getFunction: function (name, namespace) {
                var found = func(name, namespace);
                if (found) {
                    return makeEvaluator(found);
                }
                return defaultFunctionResolver.getFunction(name, namespace);
            }
        };
    }

    function makeFunctionResolverFromObject(obj) {
        return makeFunctionResolverFromFunction(obj.getFunction.bind(obj));
    }

    function makeFunctionResolverFromMap(map) {
        return makeFunctionResolverFromFunction(function (name) {
            return map[name];
        });
    }

    function makeFunctionResolver(resolver) {
        if (resolver && typeof resolver.getFunction === "function") {
            return makeFunctionResolverFromObject(resolver);
        }

        if (typeof resolver === "function") {
            return makeFunctionResolverFromFunction(resolver);
        }

        // assume map
        if (typeof resolver === "object") {
            return makeFunctionResolverFromMap(resolver);
        }

        return defaultFunctionResolver;
    }

    function makeVariableResolverFromFunction(func) {
        return {
            getVariable: function (name, namespace) {
                var value = func(name, namespace);
                return convertValue(value);
            }
        };
    }

    function makeVariableResolver(resolver) {
        if (resolver) {
            if (typeof resolver.getVariable === "function") {
                return makeVariableResolverFromFunction(resolver.getVariable.bind(resolver));
            }

            if (typeof resolver === "function") {
                return makeVariableResolverFromFunction(resolver);
            }

            // assume map
            if (typeof resolver === "object") {
                return makeVariableResolverFromFunction(function (name) {
                    return resolver[name];
                });
            }
        }

        return defaultVariableResolver;
    }
	
	function copyIfPresent(prop, dest, source) {
		if (prop in source) { dest[prop] = source[prop]; }
	}

    function makeContext(options) {
        var context = new XPathContext();

        if (options) {
            context.namespaceResolver = makeNSResolver(options.namespaces);
            context.functionResolver = makeFunctionResolver(options.functions);
            context.variableResolver = makeVariableResolver(options.variables);
			context.expressionContextNode = options.node;
			copyIfPresent('allowAnyNamespaceForNoPrefix', context, options);
			copyIfPresent('isHtml', context, options);
        } else {
            context.namespaceResolver = defaultNSResolver;
        }

        return context;
    }

    function evaluate(parsedExpression, options) {
        var context = makeContext(options);

        return parsedExpression.evaluate(context);
    }

    var evaluatorPrototype = {
        evaluate: function (options) {
            return evaluate(this.expression, options);
        }

        ,evaluateNumber: function (options) {
            return this.evaluate(options).numberValue();
        }

        ,evaluateString: function (options) {
            return this.evaluate(options).stringValue();
        }

        ,evaluateBoolean: function (options) {
            return this.evaluate(options).booleanValue();
        }

        ,evaluateNodeSet: function (options) {
            return this.evaluate(options).nodeset();
        }

        ,select: function (options) {
            return this.evaluateNodeSet(options).toArray()
        }

        ,select1: function (options) {
            return this.select(options)[0];
        }
    };

    function parse(xpath) {
        var parsed = parser.parse(xpath);

        return Object.create(evaluatorPrototype, {
            expression: {
                value: parsed
            }
        });
    }

    exports.parse = parse;
})();

exports.XPath = XPath;
exports.XPathParser = XPathParser;
exports.XPathResult = XPathResult;

exports.Step = Step;
exports.NodeTest = NodeTest;
exports.BarOperation = BarOperation;

exports.NamespaceResolver = NamespaceResolver;
exports.FunctionResolver = FunctionResolver;
exports.VariableResolver = VariableResolver;

exports.Utilities = Utilities;

exports.XPathContext = XPathContext;
exports.XNodeSet = XNodeSet;
exports.XBoolean = XBoolean;
exports.XString = XString;
exports.XNumber = XNumber;

// helper
exports.select = function(e, doc, single) {
	return exports.selectWithResolver(e, doc, null, single);
};

exports.useNamespaces = function(mappings) {
	var resolver = {
		mappings: mappings || {},
		lookupNamespaceURI: function(prefix) {
			return this.mappings[prefix];
		}
	};

	return function(e, doc, single) {
		return exports.selectWithResolver(e, doc, resolver, single);
	};
};

exports.selectWithResolver = function(e, doc, resolver, single) {
	var expression = new XPathExpression(e, resolver, new XPathParser());
	var type = XPathResult.ANY_TYPE;

	var result = expression.evaluate(doc, type, null);

	if (result.resultType == XPathResult.STRING_TYPE) {
		result = result.stringValue;
	}
	else if (result.resultType == XPathResult.NUMBER_TYPE) {
		result = result.numberValue;
	}
	else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
		result = result.booleanValue;
	}
	else {
		result = result.nodes;
		if (single) {
			result = result[0];
		}
	}

	return result;
};

exports.select1 = function(e, doc) {
	return exports.select(e, doc, true);
};

// end non-node wrapper
})(xpath);

},{}],25:[function(require,module,exports){
// taken from https://github.com/gre/json-beautify/blob/master/index.js

var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

var gap,
    indent,
    meta = { // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;

function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string)
        ? '"' + string.replace(rx_escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"'
        : '"' + string + '"';
}


function str(key, holder, limit) {

// Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }

// What happens next depends on the value's type.

    switch (typeof value) {
    case 'string':
        return quote(value);

    case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value)
            ? String(value)
            : 'null';

    case 'boolean':
    case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

        return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

    case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

        if (!value) {
            return 'null';
        }

// Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

// Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

            length = value.length;
            for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value, limit) || 'null';
            }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

            v = partial.length === 0
                ? '[]'
                : gap
                    ? (
                      gap.length + partial.join(', ').length + 4 > limit ?
                      '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                      '[ ' + partial.join(', ') + ' ]'
                    )
                    : '[' + partial.join(',') + ']';
            gap = mind;
            return v;
        }

// If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
                if (typeof rep[i] === 'string') {
                    k = rep[i];
                    v = str(k, value, limit);
                    if (v) {
                        partial.push(quote(k) + (
                            gap
                                ? ': '
                                : ':'
                        ) + v);
                    }
                }
            }
        } else {

// Otherwise, iterate through all of the keys in the object.

//if it is one of dweeve'sspecial extra-wrapped-list, deal with that:
            if (value['__extra-wrapped-list']) {
                for (k in value) {
                    if ( k.startsWith('__key')) {
                        let v2 = value[k];
                        let k2 = Object.keys(v2)[0];

                        if (Object.prototype.hasOwnProperty.call(v2, k2)) {
                            v = str(k2, v2, limit);
                            if (v) {
                                partial.push(quote(k2) + (
                                    gap
                                        ? ': '
                                        : ':'
                                ) + v);
                            }
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value, limit);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ': '
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }
        }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

        v = partial.length === 0
            ? '{}'
            : gap
                ? (
                  gap.length + partial.join(', ').length + 4 > limit ?
                  '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                  '{ ' + partial.join(', ') + ' }'
                )
                : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}


function beautify (value, replacer, space, limit) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

  var i;
  gap = '';
  indent = '';

  if (!limit) limit = 0;

  if (typeof limit !== "number")
    throw new Error("beaufifier: limit must be a number");

// If the space parameter is a number, make an indent string containing that
// many spaces.

  if (typeof space === 'number') {
      for (i = 0; i < space; i += 1) {
          indent += ' ';
      }

// If the space parameter is a string, it will be used as the indent string.

  } else if (typeof space === 'string') {
      indent = space;
  }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

  rep = replacer;
  if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')) {
      throw new Error('beautifier: wrong replacer parameter');
  }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

  return str('', {'': value}, limit);
}

module.exports = beautify;
},{}],26:[function(require,module,exports){
const nearley = require("nearley");
const grammar = require("../parser/dweeve-grammar.js");
const transpiler = require("../transpiler/transpiler.js");
const beautify = require('./beautify.js');
const vm = require('vm');
const xml2js = require('./xmldom2jsobj')
const DOMParser = require('xmldom').DOMParser;
const selectorFunctions = require('../functions/selectors')
const coreFunctions = require('../functions/core') 
const doScopeFunctions = require('../functions/doScope')       

function run(dwl, payload, vars, attributes) {
 
    if (typeof payload === 'string' && payload.trim().startsWith('<') && payload.trim().endsWith('>')) {
        var xml = payload.trim();
        var doc = new DOMParser().parseFromString(xml);
        payload = xml2js.toJsObj(doc);
    }
    let t = typeof payload;
    let result = innerRun (dwl, payload , vars, attributes);
    
    return result;
}

function innerRun (dwl, payload, vars, attributes) {

    const args = {
        payload: payload,
        vars: vars,
        attributes:attributes,
        __doDotOp:  selectorFunctions.__doDotOp,
        __doDotStarOp: selectorFunctions.__doDotStarOp,
        __doDotDotStarOp: selectorFunctions.__doDotDotStarOp,
        __doDotDotOp: selectorFunctions.__doDotDotOp,
        __getIdentifierValue: selectorFunctions.__getIdentifierValue,
        __execDoScope: doScopeFunctions.__execDoScope,
        isOdd: coreFunctions.isOdd,
        concat: coreFunctions.concat,
        map: coreFunctions.map,
        mapObject: coreFunctions.mapObject
    };
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(dwl.trim());

    if (parser.results.length === 0)
    throw "Dweeve parser found no dweeve!"

    if (parser.results.length > 1)
    throw "Dweeve parser found more than one intepretation of the dweeve!"

    code = transpiler.transpile(parser.results[0]);
     
    const script = new vm.Script(code.decs + '\n' +code.text + '\n var result=dweeve()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    let result = context.result

    return beautify(result, null,2,100);
}

module.exports = { run: run};

},{"../functions/core":28,"../functions/doScope":29,"../functions/selectors":30,"../parser/dweeve-grammar.js":31,"../transpiler/transpiler.js":37,"./beautify.js":25,"./xmldom2jsobj":27,"nearley":7,"vm":4,"xmldom":20}],27:[function(require,module,exports){
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
        return ( { [node.nodeName]: numberIfPossible(node.textContent) } );
    }
    if (!hasText(node)) {
        return ({ [node.nodeName]: toJsObj(node.childNodes) });
    } else {
        let inner = toJsObj(node.childNodes);
        let ewl = { '__extra-wrapped-list' : true};
        ewl["__key0"]= { "__text" : nodeOwnText(node) }; 
        for (let idx=1;idx<=Object.values(inner).length;idx++)
            if (Object.keys(inner)[idx-1].startsWith('__key'))
                ewl['__key'+idx]=Object.values(inner)[idx-1]; 
        
            return { [node.nodeName]: ewl };
    }
}

function numberIfPossible(text){
    if (!isNaN(parseFloat(text))) return parseFloat(text);
    if (text==='true') return true;
    if (text==='false') return false;

    return text
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
            && !(/^\s*$/.test(node.childNodes.item(idx).textContent))) return true;

    return false;
}

function nodeOwnText(node) {
    if (node.childNodes===undefined || node.childNodes===null || node.childNodes.length==0) return "";
    for (idx=0;idx<node.childNodes.length;idx++)
        if (node.childNodes.item(idx).constructor.name==="Text"
            && !(/^\s*$/.test(node.childNodes.item(idx).textContent)))
             return node.childNodes.item(idx).textContent;

    return "";
}

function isTextOnlyElement(node){
    return (getNodeType(node)==='Element' && node.childNodes.length==1
     && node.firstChild.constructor.name==='Text');
}


module.exports = {toJsObj: toJsObj}
},{"xmldom":20,"xpath":24}],28:[function(require,module,exports){
function isOdd(number) {
    return number % 2 ? true: false;
}

function concat(a,b) {
    return a+b;
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

module.exports = { isOdd: isOdd,
    concat: concat,
    map: map,
    mapObject: mapObject}
},{}],29:[function(require,module,exports){
const vm = require('vm');

function __execDoScope(code, args) {
    const script = new vm.Script(code + '\n var result=doScope()');
    
    const context = new vm.createContext(args);
    script.runInContext(context);

    return context.result
}

module.exports = { __execDoScope: __execDoScope};
},{"vm":4}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");



const lexer = moo.compile({
            header: /^\%dw [0-9]+\.[0.9]+$/,
            keyword: ['case', 'if', 'default', 'matches', 'match', 'var', 'fun', 'else', 'do'],
            WS:      { match: /[ \t\n]+/, lineBreaks: true },
            headerend : '---',
            comment: /\/\/.*?$/,
            number:  /0|[1-9][0-9]*\.?[0-9]*/,
            regex: /\/(?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\//,
            bool: /(?:true|false)/,
            null: /null/,
            thinarrow: /->/,
            fatarrow: /=>/,
            dotdotstarbinop: /\.\.\*/,
            dotdotbinop: /\.\./,
            dotstarbinop: /\.\*/,
            dotbinop: /[.]/,
            mathbinop: /==|\+\+|<=|>=|\|\||&&|!=|[><\-+/*|&\^]/,
            assignment: /=/,
            dblstring:  { match : /["](?:\\["\\]|[^\n"\\])*["]/,},
            sglstring:  { match : /['](?:\\['\\]|[^\n'\\])*[']/,},
            keyvalsep: /:/,
            comma: /,/,
            mimetype:  /(?:application|text)\/\w+/,
            word:  { match : /\w[\w0-9_]*/},
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



    const thing = (name, data) => ( { type: name, 
        data: Array.isArray(data) ? data.filter(e => e !== null && (!Array.isArray(e) || e.length > 0)) : data } );
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "dweeve$ebnf$1", "symbols": ["d_header"], "postprocess": id},
    {"name": "dweeve$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dweeve", "symbols": ["dweeve$ebnf$1", "d_body"], "postprocess": (data) => ( { type:'dweeve', header: data[0], body: data[1] } )},
    {"name": "d_header$ebnf$1", "symbols": [(lexer.has("header") ? {type: "header"} : header)], "postprocess": id},
    {"name": "d_header$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "d_header$ebnf$2", "symbols": []},
    {"name": "d_header$ebnf$2", "symbols": ["d_header$ebnf$2", "h_declaration"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "d_header", "symbols": ["d_header$ebnf$1", "d_header$ebnf$2", {"literal":"---"}], "postprocess": (data) => ( { type:'dweeve', header: data[0], decs: data[1] } )},
    {"name": "d_body", "symbols": ["expression"], "postprocess": (data) => ( { type:'body', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_input_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_output_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_var_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_declaration", "symbols": ["h_fun_dec"], "postprocess": (data) => (  { type:'head-dec', value: data[0] } )},
    {"name": "h_input_dec", "symbols": [{"literal":"input"}, (lexer.has("mimetype") ? {type: "mimetype"} : mimetype)], "postprocess": (data) => ( { type: 'input-dec', mimetype: data[1]} )},
    {"name": "h_output_dec", "symbols": [{"literal":"output"}, (lexer.has("mimetype") ? {type: "mimetype"} : mimetype)], "postprocess": (data) => ( { type: 'output-dec', mimetype: data[1]} )},
    {"name": "h_var_dec", "symbols": [{"literal":"var"}, (lexer.has("word") ? {type: "word"} : word), (lexer.has("assignment") ? {type: "assignment"} : assignment), "h_dec_expression"], "postprocess": (data) => ( { type: 'var-dec', varName: data[1], varVal: data[3]} )},
    {"name": "h_fun_dec$ebnf$1", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": id},
    {"name": "h_fun_dec$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "h_fun_dec$ebnf$2", "symbols": []},
    {"name": "h_fun_dec$ebnf$2$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("word") ? {type: "word"} : word)]},
    {"name": "h_fun_dec$ebnf$2", "symbols": ["h_fun_dec$ebnf$2", "h_fun_dec$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "h_fun_dec", "symbols": [{"literal":"fun"}, (lexer.has("word") ? {type: "word"} : word), (lexer.has("lparen") ? {type: "lparen"} : lparen), "h_fun_dec$ebnf$1", "h_fun_dec$ebnf$2", (lexer.has("rparen") ? {type: "rparen"} : rparen), (lexer.has("assignment") ? {type: "assignment"} : assignment), "h_dec_expression"], "postprocess":  (data) => ( { 
        type:"fun-def", func:data[1], args: [data[3], ...(data[4].flat().filter(a=>a.type!=='comma') ) ],
        body: data[7]
        } )},
    {"name": "h_dec_expression", "symbols": ["expression"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "h_dec_expression", "symbols": [{"literal":"do"}, (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "dweeve", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": (data) => ( { type: 'do-dweeve', dweeve: data[2]} )},
    {"name": "object$ebnf$1", "symbols": []},
    {"name": "object$ebnf$1$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "keyvaluepair"]},
    {"name": "object$ebnf$1", "symbols": ["object$ebnf$1", "object$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "object", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "keyvaluepair", "object$ebnf$1", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess":  (data) => ( { type:"member-list",
        members: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ] } ) },
    {"name": "keyvaluepair$ebnf$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "keyvaluepair$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "keyvaluepair", "symbols": ["key", (lexer.has("keyvalsep") ? {type: "keyvalsep"} : keyvalsep), "expression", "keyvaluepair$ebnf$1"], "postprocess": (data) => ( { type: 'member', key: data[0], value: data[2]} )},
    {"name": "key", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("sglstring") ? {type: "sglstring"} : sglstring)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("dblstring") ? {type: "dblstring"} : dblstring)], "postprocess": (data) => ( { type:'key', value: data[0] } )},
    {"name": "key", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'dynamic-key', value: data[1] } )},
    {"name": "expression", "symbols": ["result"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["object"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["defaultexp"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["ifconditional"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["matcher"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "expression", "symbols": ["expression", (lexer.has("word") ? {type: "word"} : word), "expression"], "postprocess":  (data) => ( { type:'fun-call',  fun:data[1], 
        args: { args: [ data[0], data[2] ] } } ) },
    {"name": "expression$ebnf$1", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": id},
    {"name": "expression$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "expression$ebnf$2", "symbols": []},
    {"name": "expression$ebnf$2$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), (lexer.has("word") ? {type: "word"} : word)]},
    {"name": "expression$ebnf$2", "symbols": ["expression$ebnf$2", "expression$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "expression", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression$ebnf$1", "expression$ebnf$2", (lexer.has("rparen") ? {type: "rparen"} : rparen), (lexer.has("thinarrow") ? {type: "thinarrow"} : thinarrow), "expression"], "postprocess":  (data) => ( { type:'lambda', ident: data[0],func:data[1], 
        args: [data[1], ...(data[2].flat().filter(a=>a.type!=='comma') ) ],
        expression: data[5] } ) },
    {"name": "expression", "symbols": ["array"], "postprocess": (data) => ( { type:'expression', value: data[0] } )},
    {"name": "defaultexp", "symbols": ["expression", {"literal":"default"}, "expression"], "postprocess": (data) => ( { type:'default-expression', value: data[0], default: data[2] } )},
    {"name": "ifconditional", "symbols": [{"literal":"if"}, (lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen), "expression", {"literal":"else"}, "expression"], "postprocess":  (data) => ( { type:'if-conditional', 
        condition: data[2], then: data[4],                        
        else: data[6] } ) },
    {"name": "matcher$ebnf$1$subexpression$1", "symbols": [{"literal":"case"}, "matchcond", (lexer.has("thinarrow") ? {type: "thinarrow"} : thinarrow), "expression"]},
    {"name": "matcher$ebnf$1", "symbols": ["matcher$ebnf$1$subexpression$1"]},
    {"name": "matcher$ebnf$1$subexpression$2", "symbols": [{"literal":"case"}, "matchcond", (lexer.has("thinarrow") ? {type: "thinarrow"} : thinarrow), "expression"]},
    {"name": "matcher$ebnf$1", "symbols": ["matcher$ebnf$1", "matcher$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "matcher$ebnf$2$subexpression$1", "symbols": [{"literal":"else"}, {"literal":"->"}, "expression"]},
    {"name": "matcher$ebnf$2", "symbols": ["matcher$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "matcher$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "matcher", "symbols": ["expression", {"literal":"match"}, (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "matcher$ebnf$1", "matcher$ebnf$2", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess":  (data) => ( { type:'pattern-match', 
        input: data[0], then: data[4],                        
        cases: data[3].map (c=>( { match: c[1], result:c[3]}) ),
        else: (data[4])==null ? null : data[4][2] } ) },
    {"name": "matchcond$ebnf$1$subexpression$1", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":":"}]},
    {"name": "matchcond$ebnf$1", "symbols": ["matchcond$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "matchcond$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "matchcond", "symbols": ["matchcond$ebnf$1", "literal"], "postprocess":  (data) => ( { type:'match-literal', var:(data[0]==null) ? null : data[0][0],
        litMatch:data[1] } ) },
    {"name": "matchcond", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":"if"}, "expression"], "postprocess": (data) => ( { type:'match-if-exp', var:data[0], expMatch:data[2] } )},
    {"name": "matchcond", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":"matches"}, (lexer.has("regex") ? {type: "regex"} : regex)], "postprocess": (data) => ( { type:'match-regex', var:data[0], regex:data[2] } )},
    {"name": "matchcond$ebnf$2$subexpression$1", "symbols": [(lexer.has("word") ? {type: "word"} : word)]},
    {"name": "matchcond$ebnf$2", "symbols": ["matchcond$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "matchcond$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "matchcond", "symbols": ["matchcond$ebnf$2", {"literal":"is"}, (lexer.has("word") ? {type: "word"} : word)], "postprocess":  (data) => ( { type:'match-type',var:(data[0]==null) ? null : data[0][0],
        typeName:data[2] } ) },
    {"name": "result", "symbols": ["result", (lexer.has("mathbinop") ? {type: "mathbinop"} : mathbinop), "operand"], "postprocess": (data) => ( { type:'bin-op', lhs:data[0], op:data[1], rhs:data[2] } )},
    {"name": "result", "symbols": ["result", "dotops", "operand"], "postprocess": (data) => ( { type:'dot-op', lhs:data[0], op:data[1], rhs:data[2] } )},
    {"name": "result", "symbols": ["operand"], "postprocess": (data) =>( { type:'some-operand', value: data[0] } )},
    {"name": "operand", "symbols": ["identifier"], "postprocess": (data) => ( { type:'identifier-operand', value: data[0] } )},
    {"name": "operand", "symbols": ["literal"], "postprocess": (data) => ( { type:'literal-operand', value: data[0] } )},
    {"name": "operand", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'bracket-operand', value: data[1] } )},
    {"name": "identifier", "symbols": ["identifier", (lexer.has("lparen") ? {type: "lparen"} : lparen), "arglist", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": (data) => ( { type:'fun-call',  fun:data[0], args:data[2] } )},
    {"name": "identifier", "symbols": ["identifier", (lexer.has("lsquare") ? {type: "lsquare"} : lsquare), "expression", (lexer.has("rsquare") ? {type: "rsquare"} : rsquare)], "postprocess": (data) => ( { type:'idx-identifier', ident: data[0], idx: data[2] } )},
    {"name": "identifier", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": (data) => ( { type:'identifier', ident: data[0] } )},
    {"name": "array", "symbols": [(lexer.has("lsquare") ? {type: "lsquare"} : lsquare), "arglist", (lexer.has("rsquare") ? {type: "rsquare"} : rsquare)], "postprocess": (data) => ( { type:'array',  members:data[1] } )},
    {"name": "arglist$ebnf$1", "symbols": ["expression"], "postprocess": id},
    {"name": "arglist$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "arglist$ebnf$2", "symbols": []},
    {"name": "arglist$ebnf$2$subexpression$1", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma), "expression"]},
    {"name": "arglist$ebnf$2", "symbols": ["arglist$ebnf$2", "arglist$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arglist", "symbols": ["arglist$ebnf$1", "arglist$ebnf$2"], "postprocess":  (data) => ( { type:"arg-list",
        args: [data[0], ...(data[1].flat().filter(a=>a.type!=='comma') ) ] } ) },
    {"name": "literal", "symbols": [(lexer.has("sglstring") ? {type: "sglstring"} : sglstring)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("dblstring") ? {type: "dblstring"} : dblstring)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("null") ? {type: "null"} : null)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "literal", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => ( { type:'literal', value: data[0] } )},
    {"name": "dotops", "symbols": [(lexer.has("dotbinop") ? {type: "dotbinop"} : dotbinop)], "postprocess": (data) => ( { type:'dot', value: data[0] } )},
    {"name": "dotops", "symbols": [(lexer.has("dotstarbinop") ? {type: "dotstarbinop"} : dotstarbinop)], "postprocess": (data) => ( { type:'dotstar', value: data[0] } )},
    {"name": "dotops", "symbols": [(lexer.has("dotdotstarbinop") ? {type: "dotdotstarbinop"} : dotdotstarbinop)], "postprocess": (data) => ( { type:'dotdotstar', value: data[0] } )},
    {"name": "dotops", "symbols": [(lexer.has("dotdotbinop") ? {type: "dotdotbinop"} : dotdotbinop)], "postprocess": (data) => ( { type:'dotdot', value: data[0] } )}
]
  , ParserStart: "dweeve"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

},{"moo":6}],32:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['if-conditional'] = (context, code) => { 
    let op = context.node;
    code.addCode('( () =>  { if (');
    context.compiler({parentType: 'if-conidtion', node: context.node.condition, compiler:context.compiler}, code);
    code.addCode(') { return (');
    context.compiler({parentType: 'if-then', node: context.node.then, compiler:context.compiler}, code);
    code.addCode(');} else { return (');
    context.compiler({parentType: 'if-else', node: context.node.else, compiler:context.compiler}, code);
    code.addCode(');} } ) ()');
    
    return false;
 };

 codeGenFor['pattern-match'] = (context, code) => { 
    let cn = context.node;
    code.addCode('( () => { let $ = (');
    context.compiler({parentType: 'if-condition', node: cn.input, compiler:context.compiler}, code);
    code.addCode('); \n');
    if (Array.isArray(cn.cases)){
        cn.cases.forEach( c => {
            if (c.match.type === 'match-if-exp')
                emitcodeMatchIfExp(code, c, context);
            else if (c.match.type === 'match-regex')
                emitcodeMatchRegex(code, c, context);
            else if (c.match.type === 'match-literal')
                emitcodeMatchLiteral(code, c, context);
            else if (c.match.type === 'match-type')
                emitcodeMatchType(code, c, context);
        });
    };
    if (cn.else !== null) {
        code.addCode('return (');
        context.compiler({parentType: 'if-else', node: cn.else, compiler:context.compiler}, code);
        code.addCode(');');
    }
    code.addCode('} ) ()');
    
    return false;
 };

function emitcodeMatchType(code, c, context) {
    code.addCode('{');
    if (c.match.var !== null)
        code.addCode(' let ' + c.match.var.value + ' = $; ');
    code.addCode(' if ( typeof $ === "' + c.match.typeName.value.toLowerCase() + '") { return (');
    context.compiler({ parentType: 'if-exp-match-result', node: c.result, compiler: context.compiler }, code);
    code.addCode(') } }\n');
}

function emitcodeMatchLiteral(code, c, context) {
    code.addCode('{');
    if (c.match.var !== null)
        code.addCode(' let ' + c.match.var.value + ' = $; ');
    code.addCode(' if ( $ ===' + c.match.litMatch.value.value + ') { return (');
    context.compiler({ parentType: 'if-exp-match-result', node: c.result, compiler: context.compiler }, code);
    code.addCode(') } }\n');
}

function emitcodeMatchRegex(code, c, context) {
    code.addCode('{ try {');
    code.addCode(' let ' + c.match.var.value + ' = $.match(' + c.match.regex + '); ');
    code.addCode(' if (' + c.match.var.value + ' !==null) { return (');
    context.compiler({ parentType: 'if-exp-match-result', node: c.result, compiler: context.compiler }, code);
    code.addCode(') } } catch {} }\n');
}

function emitcodeMatchIfExp(code, c, context) {
    code.addCode('{');
    if (c.match.var !== null)
        code.addCode(' let ' + c.match.var.value + ' = $; ');
    code.addCode(' if (');
    context.compiler({ parentType: 'if-exp-match', node: c.match.expMatch, compiler: context.compiler }, code);
    code.addCode(') { return (');
    context.compiler({ parentType: 'if-exp-match-result', node: c.result, compiler: context.compiler }, code);
    code.addCode(') } }\n');
}

function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}

},{"dictionaryjs":5,"source-map":19}],33:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['do-dweeve'] = (context, code) => { 
    let doDweeve = context.node;
    let doCode = getSubCode(code);
    let doId = '__do'+code.doScopes.length;
    code.doScopes.push( {[doId]: doCode})

    doCode.addCode('let doScope = () => (');
    context.compiler({node: doDweeve.dweeve, compiler:context.compiler}, doCode);
    doCode.addCode(')\n');

    args=''
    if (context.argList!==undefined && context.argList!=null) {
        context.argList.forEach(arg => {
            if (arg!==null)
                args+=', ' + arg.value + ': '+arg.value;
        });
    }

    code.addCode("__execDoScope(`\n" + doCode.decs + '\n' +doCode.text + '`, {payload: payload' + args + '} )')

    return false;
 };

 
 
 function getSubCode(code)
{
    let subCode = {text: '', decs: '', lines: code.lines, doScopes: code.doScopes}
    subCode.addCode = (text) => {
        subCode.text += text;
        subCode.lines.push(text);
    };
    return subCode;
}

function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}

},{"dictionaryjs":5,"source-map":19}],34:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['member-list'] = (context, code) => { 
    if (context.node.members.length > 1) {
        code.addCode('{ "__extra-wrapped-list": true, \n') ; 
        let idx=0;
        context.node.members.forEach(m => {
            code.addCode('"__key' + idx++ + '": {') ; 
            context.compiler({parentType: 'obj-member', node: m, compiler:context.compiler}, code);
            code.addCode('},\n ') ; 
        });
        code.addCode('}\n')
    } else if (context.node.members.length === 1) {
        code.addCode('{')
        context.compiler({parentType: 'obj-member', node: context.node.members[0], compiler:context.compiler}, code);
        code.addCode('}')
    }
    return false; 
};

codeGenFor['array'] = (context, code) => { 
    code.addCode('[') ; 
    context.node.members.args.forEach(m => {
        context.compiler({parentType: 'array-member', node: m, compiler:context.compiler}, code);
        code.addCode(', ') ; 
    });
    code.addCode(']') ; 
    return false; 
};

codeGenFor['default-expression'] = (context, code) => { 
    code.addCode('( () => { let d = (');
    context.compiler({parentType: 'default-expression-default', node: context.node.default, compiler:context.compiler}, code);
    code.addCode('); try { let v = (') ; 
    context.compiler({parentType: 'default-expression-value', node: context.node.value, compiler:context.compiler}, code);
    code.addCode('); if (v!==null && v!==undefined) {return v;} else {return d;} } catch {return d} } )()\n ') 
    return false; 
};

codeGenFor['idx-identifier'] = (context, code) => { 
    let id = context.node;
   
    code.addCode(id.ident.ident.value + '[');
    context.compiler({parentType: 'indexed-identifier', node: id.idx, compiler:context.compiler}, code);
    code.addCode(']') ; 
   
    return false; 
};

codeGenFor['lambda'] = (context, code) => { 
    let lamda = context.node;
   
    code.addCode('(');
    if (lamda.args!==null && Array.isArray(lamda.args)) {
        idx=1;
        lamda.args.forEach(arg => {
            if (arg!==null) {
                code.addCode(arg.value);
                if (idx++<lamda.args.length)
                    code.addCode(', ');
            }
        });
    }
    code.addCode(') => (');
    context.compiler({parentType: 'lambda', node: lamda.expression, compiler:context.compiler}, code);
    code.addCode(')\n');
    return false; 
};

codeGenFor['dynamic-key'] = (context, code) => { 
    code.addCode('[');
    context.compiler({parentType: 'dynamic-key', node: context.node.value, compiler:context.compiler}, code);
    code.addCode(']: ');
    return false;
};

// ( () => { try { return  key ;} catch { return 'bat'}; })()

//codeGenAfter['member-list'] = (context, code) => { code.addCode('}\n') };

codeGenAfter['key'] = (context, code) => { code.addCode(': ') };

//codeGenAfter['member'] = (context, code) => { code.addCode(',\n') };

codeGenFor['word'] = (context, code) => { code.addCode(context.node.value ) };
codeGenFor['number'] = (context, code) => { code.addCode(context.node.value) };
codeGenFor['dblstring'] = (context, code) => { code.addCode(context.node.value) };
codeGenFor['sglstring'] = (context, code) => { code.addCode(context.node.value) };
codeGenFor['bool'] = (context, code) => { code.addCode(context.node.value) };
codeGenFor['null'] = (context, code) => { code.addCode(context.node.value) };



function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}

},{"dictionaryjs":5,"source-map":19}],35:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['dot-op'] = (context, code) => { 
    let op = context.node;
    switch (op.op.type) {
        case "dot":
            code.addCode('( __doDotOp( (');
            break;
        case "dotstar":
            code.addCode('( __doDotStarOp( (');
            break;
        case "dotdotstar":
            code.addCode('( __doDotDotStarOp( (');
            break;
        case "dotdot":
            code.addCode('( __doDotDotOp( (');
            break;
    }
    context.compiler({parentType: 'dot-op-lhs', node: context.node.lhs, compiler:context.compiler}, code);
    code.addCode('), (\'');
    context.compiler({parentType: 'dot-top-rhs', node: context.node.rhs, compiler:context.compiler}, code);
    code.addCode('\')) )');
    
    return false;
 };

 codeGenFor['bin-op'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.lhs, compiler:context.compiler}, code);
    if (op.op.value==='++') // double plus for string concat will be single + for javascript
        code.addCode('+');
    else
        code.addCode(op.op.value);
    context.compiler({node: op.rhs, compiler:context.compiler}, code);
    return false;
 };

 codeGenFor['fun-call'] = (context, code) => { 
    let op = context.node;
    context.compiler({node: op.fun, compiler:context.compiler}, code);
    code.addCode('(');
    if (op.args!==null && Array.isArray(op.args.args)) {
        idx=0;
        op.args.args.forEach(arg => {
            context.compiler({node: arg, compiler:context.compiler}, code);
            if (++idx<op.args.args.length)
                code.addCode(', ');
        });
    }
    code.addCode(')');
    return false;
 };


function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}

},{"dictionaryjs":5,"source-map":19}],36:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

codeGenFor['var-dec'] = (context, code) => { 
    let op = context.node;
    let decCode = getSubCode(code);
    decCode.addCode('var ' + op.varName + ' = ');
    context.compiler({node: op.varVal, compiler:context.compiler}, decCode);
    decCode.addCode(';\n');
    code.decs+=decCode.text;
    return false;
 };

 codeGenFor['fun-def'] = (context, code) => { 
    let op = context.node;
    let decCode = getSubCode(code);
   
    decCode.addCode('\n function ' + op.func.value +'(');
    if (op.args!==null && Array.isArray(op.args)) {
        idx=1;
        op.args.forEach(arg => {
            if (arg!==null) {
                decCode.addCode(arg.value);
                if (idx++<op.args.length)
                    decCode.addCode(', ');
            }
        });
    }
    decCode.addCode(') { return ( \n');
    context.compiler({node: op.body, compiler:context.compiler, argList: op.args}, decCode);
    decCode.addCode(' ) }\n');
    code.decs+=decCode.text;
    
    return false;
 };
 
 function getSubCode(code)
{
    let subCode = {text: '', lines: code.lines, doScopes: code.doScopes}
    subCode.addCode = (text) => {
        subCode.text += text;
        subCode.lines.push(text);
    };
    return subCode;
}

function addTranspilerFeatures(preDict, postDict) {
    for (k in codeGenFor)
        preDict[k]=codeGenFor[k];
    for (k in codeGenAfter)
        postDict[k]=codeGenAfter[k];    
}

module.exports = {addTranspilerFeatures : addTranspilerFeatures}

},{"dictionaryjs":5,"source-map":19}],37:[function(require,module,exports){
const Dictionary = require('dictionaryjs');
const HeaderFeatures = require('./transpiler-header-decs')
const ConditionalsFeatures = require('./transpiler-conditionals')
const FuncAndSelectorFeatures = require('./transpiler-funcs-and-selectors')
const ExpressionFeatures = require('./transpiler-expressions')
const DoScopeFeatures = require('./transpiler-do-scope')
var sourceMap = require("source-map");

let codeGenFor = new Dictionary.Dictionary();
let codeGenAfter = new Dictionary.Dictionary();

HeaderFeatures.addTranspilerFeatures(codeGenFor, codeGenAfter);
ConditionalsFeatures.addTranspilerFeatures(codeGenFor, codeGenAfter);
FuncAndSelectorFeatures.addTranspilerFeatures(codeGenFor, codeGenAfter);
ExpressionFeatures.addTranspilerFeatures(codeGenFor, codeGenAfter);
DoScopeFeatures.addTranspilerFeatures(codeGenFor, codeGenAfter);


function transpile(dweeve){

    let code = { text: ("dweeve = () => ( "), decs: '', lines: [], doScopes: [] };
    code.addCode = (text) => {
        code.text += text;
        code.lines.push(text);
    };

    let context = {parentType : 'dweeve', node: dweeve, compiler: recursiveTranspile}
    recursiveTranspile(context, code)
    code.text+="\n);"

    return code;
}

function recursiveTranspile(context, code) {
    let n = context.node;
    if (n===undefined || n===null || n.type===undefined) return;
    
    let goDeep = true;

    let codeGen =codeGenFor[n.type]
    if (codeGen!==undefined) goDeep = codeGen(context, code)
    // if we have a token leaf node, do nothing, otherwise do some compiling!
    if (n.hasOwnProperty('text') && n.hasOwnProperty('value')) {
    } else if (goDeep) {
        for (var key in n) {
            if (key !=='type' && n.hasOwnProperty(key)) {
                let v = n[key];
                if (Array.isArray(v)) {
                    v.forEach(an => context.compiler({parentType: n.type, node: an, compiler:context.compiler}, code))
                } else {
                    context.compiler({parentType: n.type, node: v, compiler:context.compiler}, code)
                }
            }
        }
    }

    let post =codeGenAfter[n.type]
    if (post!==undefined) post(context, code)
};

module.exports = { transpile: transpile};
},{"./transpiler-conditionals":32,"./transpiler-do-scope":33,"./transpiler-expressions":34,"./transpiler-funcs-and-selectors":35,"./transpiler-header-decs":36,"dictionaryjs":5,"source-map":19}]},{},[26])(26)
});
