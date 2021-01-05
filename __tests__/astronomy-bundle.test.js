let {createTimeOfInterest} =require('astronomy-bundle/time');
let {createVenus, createJupiter, createMars, createSaturn, createMercury, createUranus, createNeptune} =require('astronomy-bundle/planets');
let {createSun} =require('astronomy-bundle/sun');
let {createMoon} =require('astronomy-bundle/moon');

const toi = createTimeOfInterest.fromTime(2020, 1, 1, 0, 0, 0);
const objnames=['sun','moon','venus','mars','jupiter','saturn','mercury','uranus', 'neptune']
const objConstructor = {
    sun: createSun,
    moon: createMoon,
    mercury: createMercury,
    saturn: createSaturn,
    mars: createMars,
    venus: createVenus,
    jupiter: createJupiter,
    uranus: createUranus,
    neptune: createNeptune
}
function radecdelta(ra,dec,delta){
    return {
        rightAscension:ra, declination:dec, radiusVector: delta
    }
}
let objposition = {
    sun: radecdelta(280.88884, -23.05882, 0.98329304255144),
    moon: radecdelta(349.16852,  -9.97481, 0.00269988972202),
    venus: radecdelta(317.43675, -18.26531, 1.27802814146320),
    mars: radecdelta(236.22639, -19.44505, 2.18441290339058),
    jupiter: radecdelta(277.25910, -23.17971, 6.20889838848593),
    saturn: radecdelta(293.11485, -21.68417, 10.9964084755714),
    mercury: radecdelta(274.82205, -24.63572, 1.43399235470290),
    uranus: radecdelta(30.66643,  11.94191,  19.4187753586373),
    neptune: radecdelta(347.76053, -6.36481, 30.3152893725537)
}
// const toi = createTimeOfInterest.fromTime(2020, 1, 1, 0, 0, 0)
// data on Horison web site 
// obj     ra        dec       delta            lon             lat
// sun     280.88884 -23.05882 0.98329304255144 280.0094920  -0.0001188
// moon    349.16852  -9.97481 0.00269988972202 346.1383763  -4.8940719
// venus   317.43675 -18.26531 1.27802814146320
// mars    236.22639 -19.44505 2.18441290339058
// jupiter 277.25910 -23.17971 6.20889838848593
// saturn  293.11485 -21.68417 10.9964084755714
// mercury 274.82205 -24.63572 1.43399235470290
// uranus  30.66643  11.94191  19.4187753586373
// neptune 347.76053  -6.36481 30.3152893725537
describe("test astronomy-bundle", () => {
    test("ra,dec,delta of sun, moon, planets at 2020-1-1 with Horizon", async () => {
        for (let i=0;i< objnames.length; i++){
            let name = objnames[i]
            let astroObj = objConstructor[name](toi)
            let data = await astroObj.getApparentGeocentricEquatorialSphericalCoordinates()
            //expect(data.rightAscension).toBeCloseTo(objposition[name].rightAscension,1)
            //expect(data.declination).toBeCloseTo(objposition[name].declination,1)
            //expect(data.radiusVector).toBeCloseTo(objposition[name].radiusVector,1)
            expect(Math.abs(data.rightAscension-objposition[name].rightAscension)).toBeLessThan(0.009)
            expect(Math.abs(data.declination-objposition[name].declination)).toBeLessThan(0.009)
            expect(Math.abs(data.radiusVector-objposition[name].radiusVector)).toBeLessThan(0.00009)
        }
    });
    test("lon,lat of sun, moon at 2020-1-1 with Horizon", async () => {
           let sun = createSun(toi)
           let data = await sun.getApparentGeocentricEclipticSphericalCoordinates()
            expect(Math.abs(data.lon-280.0094920)).toBeLessThan(0.009)
            expect(Math.abs(data.lat-(-0.0001188))).toBeLessThan(0.009)
            let moon = createMoon(toi)
            let moondata = await moon.getApparentGeocentricEclipticSphericalCoordinates()
            expect(Math.abs(moondata.lon-346.1383763)).toBeLessThan(0.009)
            expect(Math.abs(moondata.lat-(-4.8940719))).toBeLessThan(0.009)
     });
  });
