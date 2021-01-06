const sum = require('../src/components/sum.js')
const {lonofsolar} = require('../src/components/base.js')
let {julian, solar, planetposition, data}= require('astronomia')
const earth = new planetposition.Planet(data.earth);
import {describe, expect, test} from '@jest/globals'

describe("Sum", () => {
    test("it should sum(2,3) should be 5", () => {
      expect(sum(2,3)).toEqual(5);
    });
  });

describe("sun's ecliptic longitute", ()=>{
  test("comapre with skyfield ecliptic(sun,ts.utc(2020,1,1))", ()=>{
    let day = new Date(Date.UTC(2020,0,1))
    let jde = julian.DateToJDE(day)
    expect(lonofsolar(jde)).toBeCloseTo(280.00950501,4)
  });
  test("comapre with Horizon sun's ra at 2020-1-1", ()=>{
    let day = new Date(Date.UTC(2020,0,1))
    let jde = julian.DateToJDE(day)
    let radian = solar.apparentEquatorialVSOP87(earth, jde).ra
    expect(( radian* 180 / Math.PI + 360) % 360).toBeCloseTo(280.88884,4)
  });
  test("check deltaT at 2002/01/01 on page 79 Meeus 2009" , ()=>{
    let day = new Date(Date.UTC(2002,0,1))
    let deltaTInSeconds = (julian.DateToJDE(day)-julian.DateToJD(day))*86400
    expect(deltaTInSeconds).toBeCloseTo(64.3,1)
  })
  test("JD at 1957/10/4.81 is 2436116.31 on page 61", ()=>{
    let day = new Date(Date.UTC(1957,9,4,19,26,24))
    //console.log(day)
    let jd = julian.DateToJD(day)
    expect(jd).toBeCloseTo(2436116.31, 7)
  })
  test("JD at 333/1/27 12:00 is 1842713.0 on page 61 Meeus 2009", ()=>{
    let jd = julian.DateToJD(new Date(Date.UTC(333,0,27,12,0,0)))
    expect(jd).toBeCloseTo(1842713.0, 7)
  })
  //console.log(julian.DateToJD(new Date(Date.UTC(333,0,27,12,0,0))))
  ///// 不知如何得到行星的赤道座標
})