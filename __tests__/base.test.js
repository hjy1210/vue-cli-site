const sum = require('../src/components/sum.js')
const {lonofsolar} = require('../src/components/base.js')
let {julian, solar, planetposition, data, coord}= require('astronomia')
const earth = new planetposition.Planet(data.earth);
const mars = new planetposition.Planet(data.mars);

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
  ///// 不知如何得到行星的赤道座標
})