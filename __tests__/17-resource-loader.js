import dweeve from '../src/exe/dweeve.js'
import core from '../src/functions/core'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

describe('resource loaders', function() {
  it('set resource file before execution', function(done) {
    let payload = ''
    let attributes = {}
    let vars = {}

    let dwl = `var a = readUrl('http://test.url/content', 'application/json')
    ---
    a.value`

    let exptected_result = `"true"`

    core.setResourceFileContent('http://test.url/content','{"value":"true"}')

    let result = dweeve.run(dwl, payload, attributes, vars)
    dwassert.equalwows(result, exptected_result, 'output does not match example')
    done()
  })


    it('set resource loader before execution', function(done) {
      let payload = ''
      let attributes = {}
      let vars = {}
  
      let dwl = `var a = readUrl('http://test.url/content', 'application/json')
      ---
      a.value`
  
      let exptected_result = `"true"`

      const loader = (p,t) => { return  (p==='http://test.url/content') ? '{"value":"true"}' : '{"value":"false"}' }
  
      core.setResourceLoader(loader)
  
      let result = dweeve.run(dwl, payload, attributes, vars)
      dwassert.equalwows(result, exptected_result, 'output does not match example')
      done()
    })
})