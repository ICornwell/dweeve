var chai = require('chai');

function equalwows (actual, expected, msg) {
    chai.assert.equal(actual.replace(/\s*/g,''), expected.replace(/\s*/g,''),msg);
}

module.exports = {equalwows: equalwows}