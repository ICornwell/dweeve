"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function toJsObj(node) {
  var nodeType = getNodeType(node);

  if (nodeType === 'Document') {
    var nl = {};

    for (var idx = 0; idx < node.childNodes.length; idx++) {
      var ce = node.childNodes.item(idx);

      if (getNodeType(ce) === 'Element') {
        nl = toJsObj(ce);
      }
    }

    return nl;
  }

  if (nodeType === 'NodeList') {
    var _nl = {
      '__ukey-obj': true
    };

    for (var _idx = 0; _idx < node.length; _idx++) {
      var _ce = node.item(_idx);

      if (getNodeType(_ce) === 'Element') {
        var js = toJsObj(_ce);
        _nl['__key' + _idx] = js;
      }
    }

    return _nl;
  }

  if (isTextOnlyElement(node)) {
    return _defineProperty({}, node.nodeName, numberIfPossible(node.textContent));
  }

  if (!hasText(node)) {
    return _defineProperty({}, node.nodeName, toJsObj(node.childNodes));
  } else {
    var inner = toJsObj(node.childNodes);
    var ewl = {
      '__ukey-obj': true
    };
    ewl["__key0"] = {
      "__text": nodeOwnText(node)
    };

    for (var _idx2 = 1; _idx2 <= Object.values(inner).length; _idx2++) {
      if (Object.keys(inner)[_idx2 - 1].startsWith('__key')) ewl['__key' + _idx2] = Object.values(inner)[_idx2 - 1];
    }

    return _defineProperty({}, node.nodeName, ewl);
  }
}

function numberIfPossible(text) {
  if (!isNaN(parseFloat(text))) return parseFloat(text);
  if (text === 'true') return true;
  if (text === 'false') return false;
  return text;
}

function getNodeType(node) {
  if (node.constructor != null && typeof node.constructor.name === 'string' && node.constructor.name.length > 1 && node.constructor.name !== 'Object') {
    return node.constructor.name;
  }

  if (node.length && node.item) {
    return 'NodeList';
  }
}

function hasText(node) {
  if (node.childNodes === undefined || node.childNodes === null || node.childNodes.length == 0) return false;

  for (var idx = 0; idx < node.childNodes.length; idx++) {
    if (node.childNodes.item(idx).constructor.name === "Text" && !/^\s*$/.test(node.childNodes.item(idx).textContent)) return true;
  }

  return false;
}

function nodeOwnText(node) {
  if (node.childNodes === undefined || node.childNodes === null || node.childNodes.length == 0) return "";

  for (var idx = 0; idx < node.childNodes.length; idx++) {
    if (node.childNodes.item(idx).constructor.name === "Text" && !/^\s*$/.test(node.childNodes.item(idx).textContent)) return node.childNodes.item(idx).textContent;
  }

  return "";
}

function isTextOnlyElement(node) {
  return getNodeType(node) === 'Element' && node.childNodes.length == 1 && node.firstChild.constructor.name === 'Text';
}

var _default = {
  toJsObj: toJsObj
};
exports.default = _default;