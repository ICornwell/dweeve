import chai from 'chai'

function equalwows (actual, expected, msg) {
    chai.assert.equal(actual.replace(/\s*/g,''), expected.replace(/\s*/g,''),msg)
}

export default {equalwows: equalwows}