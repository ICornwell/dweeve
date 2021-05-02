import dweeve from '../src/exe/dweeve.js'
import chai from 'chai'
var assert = chai.assert
import dwassert from '../__asserts__/dwassert'

it('date add', function(done) {
 
const payload = `
{ data: [
  {
      "p1": "v1",
      "p2": "v2",
      "p3": "v3",
      "p4": "v4",
      "p5": "v5",
      "p6": [
          {
              "ap1": "av1",
              "ap2": "av2",
              "ap3": "av3",
              "ap4": "av4",
              "ap5": "av5"
          },
          {
              "ap1": "bv1",
              "ap2": "bv2",
              "ap3": "bv3",
              "ap4": "bv4",
              "ap5": "bv5"
          },
          {
              "ap1": "cv1",
              "ap2": "cv2",
              "ap3": "cv3",
              "ap4": "cv4",
              "ap5": "cv5"
          }
      ]
  },
  {
      "p1": "y1",
      "p2": "y2",
      "p3": "y3",
      "p4": "y4",
      "p5": "y5",
      "p6": [
          {
              "ap1": "ay1",
              "ap2": "ay2",
              "ap3": "ay3",
              "ap4": "ay4",
              "ap5": "ay5"
          },
          {
              "ap1": "by1",
              "ap2": "by2",
              "ap3": "by3",
              "ap4": "by4",
              "ap5": "by5"
          },
          {
              "ap1": "cy1",
              "ap2": "cy2",
              "ap3": "cy3",
              "ap4": "cy4",
              "ap5": "cy5"
          }
      ]
  }
]
}`

const dwl = `
payload.data flatMap (po) -> 
    (po.p6 map (m) ->
    {
        (po mapObject (value, key) -> { ((key) : value) if (key != "p6")} ),
        (m)
    })
`

let exptected_result = `[
  {
    "p1": "v1",
    "p2": "v2",
    "p3": "v3",
    "p4": "v4",
    "p5": "v5",
    "ap1": "av1",
    "ap2": "av2",
    "ap3": "av3",
    "ap4": "av4",
    "ap5": "av5"
  },
  {
    "p1": "v1",
    "p2": "v2",
    "p3": "v3",
    "p4": "v4",
    "p5": "v5",
    "ap1": "bv1",
    "ap2": "bv2",
    "ap3": "bv3",
    "ap4": "bv4",
    "ap5": "bv5"
  },
  {
    "p1": "v1",
    "p2": "v2",
    "p3": "v3",
    "p4": "v4",
    "p5": "v5",
    "ap1": "cv1",
    "ap2": "cv2",
    "ap3": "cv3",
    "ap4": "cv4",
    "ap5": "cv5"
  },
  {
    "p1": "y1",
    "p2": "y2",
    "p3": "y3",
    "p4": "y4",
    "p5": "y5",
    "ap1": "ay1",
    "ap2": "ay2",
    "ap3": "ay3",
    "ap4": "ay4",
    "ap5": "ay5"
  },
  {
    "p1": "y1",
    "p2": "y2",
    "p3": "y3",
    "p4": "y4",
    "p5": "y5",
    "ap1": "by1",
    "ap2": "by2",
    "ap3": "by3",
    "ap4": "by4",
    "ap5": "by5"
  },
  {
    "p1": "y1",
    "p2": "y2",
    "p3": "y3",
    "p4": "y4",
    "p5": "y5",
    "ap1": "cy1",
    "ap2": "cy2",
    "ap3": "cy3",
    "ap4": "cy4",
    "ap5": "cy5"
  }
]`

let result = dweeve.run(dwl, payload, {}, {})
dwassert.equalwows(result, exptected_result, 'output does not match example')
done()
})

