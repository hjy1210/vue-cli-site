const sum = require('../src/components/sum.js')
const {lonofsolar} = require('../src/components/base.js')
const {julian}= require('astronomia')
describe("Sum", () => {
    test("it should sum(2,3) should be 5", () => {
      expect(sum(2,3)).toEqual(5);
    });
  });

describe("base function", ()=>{
  test("春分", ()=>{
    let day = new Date(2020,2,20,11,49)
    let jde = julian.DateToJDE(day)
    expect(lonofsolar(jde)).toBeCloseTo(359.9996,4)
  })
})