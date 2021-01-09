let { createTimeOfInterest } = require('astronomy-bundle/time');
let {
	createVenus,
	createJupiter,
	createMars,
	createSaturn,
	createMercury,
	createUranus,
	createNeptune
} = require('astronomy-bundle/planets');
let { createSun } = require('astronomy-bundle/sun');
let { createMoon } = require('astronomy-bundle/moon');
import { createLocation } from 'astronomy-bundle/earth';
let {
	eclipticSpherical2equatorialSpherical,
	eclipticJ20002eclipticDate,
	equatorialSpherical2eclipticSpherical,
	equatorialSpherical2topocentricSpherical,
	equatorialSpherical2topocentricHorizontal
} = require('astronomy-bundle/utils/coordinateCalc');
import { describe, expect, test } from '@jest/globals';

const toi = createTimeOfInterest.fromTime(2020, 1, 1, 0, 0, 0);
const objnames = [ 'sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn', 'mercury', 'uranus', 'neptune' ];
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
};
function radecdelta(astrora, astrodec, ra, dec, delta) {
	return {
		astrora: astrora,
		astrodec: astrodec,
		rightAscension: ra,
		declination: dec,
		radiusVector: delta
	};
}
let objposition = {
	sun: radecdelta(280.59732, -23.07927, 280.88884, -23.05882, 0.98329304255144),
	moon: radecdelta(348.91492, -10.08107, 349.16852, -9.97481, 0.00269988972202),
	venus: radecdelta(317.16507, -18.34461, 317.43675, -18.26531, 1.2780281414632),
	mars: radecdelta(235.94673, -19.38528, 236.22639, -19.44505, 2.18441290339058),
	jupiter: radecdelta(276.96689, -23.19346, 277.2591, -23.17971, 6.20889838848593),
	saturn: radecdelta(292.82881, -21.72647, 293.11485, -21.68417, 10.9964084755714),
	mercury: radecdelta(274.52634, -24.64494, 274.82205, -24.63572, 1.4339923547029),
	uranus: radecdelta(30.40046,  11.84712, 30.66643, 11.94191, 19.4187753586373),
	neptune: radecdelta(347.50806, -6.47088, 347.76053, -6.36481, 30.3152893725537)
};
// const toi = createTimeOfInterest.fromTime(2020, 1, 1, 0, 0, 0)
// data on Horison web site
// obj     ra        dec       delta            lon             lat
// sun     280.59732 -23.07927 280.88884 -23.05882 0.98329304255144 280.0094920  -0.0001188
// moon    348.91492 -10.08107 349.16852  -9.97481 0.00269988972202 346.1383763  -4.8940719
// venus   317.16507 -18.34461 317.43675 -18.26531 1.27802814146320
// mars    235.94673 -19.38528 236.22639 -19.44505 2.18441290339058
// jupiter 276.96689 -23.19346 277.25910 -23.17971 6.20889838848593
// saturn  292.82881 -21.72647 293.11485 -21.68417 10.9964084755714
// mercury 274.52634 -24.64494 274.82205 -24.63572 1.43399235470290
// uranus  30.40046  11.84712  30.66643  11.94191  19.4187753586373
// neptune 347.50806  -6.47088 347.76053  -6.36481 30.3152893725537
describe('test astronomy-bundle', () => {
	test('icrf/a-appraent geocentric ra/dec/delta of sun, moon, planets at 2020-1-1 with Horizon', async () => {
		for (let i = 0; i < objnames.length; i++) {
			let name = objnames[i];
			let astroObj = objConstructor[name](toi);
			let data = await astroObj.getApparentGeocentricEquatorialSphericalCoordinates();
			// apparent 地心赤道座標的計算
			expect(Math.abs(data.rightAscension - objposition[name].rightAscension)).toBeLessThan(0.009);
			expect(Math.abs(data.declination - objposition[name].declination)).toBeLessThan(0.009);
			expect(Math.abs(data.radiusVector - objposition[name].radiusVector)).toBeLessThan(0.00009);
			// ICRF 地心赤道座標的計算
			if ( name != "moon") {
				data = await astroObj.getGeocentricEquatorialSphericalJ2000Coordinates()
				//expect(data.rightAscension).toBeCloseTo(objposition[name].astrora,2)
				expect(Math.abs(data.rightAscension - objposition[name].astrora)).toBeLessThan(0.01)
				expect(Math.abs(data.declination - objposition[name].astrodec)).toBeLessThan(0.01)
			}
		}
	});
	test('lon,lat of sun, moon at 2020-1-1 with Horizon', async () => {
		let sun = createSun(toi);
		let data = await sun.getApparentGeocentricEclipticSphericalCoordinates();
		// 測試太陽的apparent黃道座標
		expect(Math.abs(data.lon - 280.009492)).toBeLessThan(0.009);
		expect(Math.abs(data.lat - -0.0001188)).toBeLessThan(0.009);
		let moon = createMoon(toi);
		let moondata = await moon.getApparentGeocentricEclipticSphericalCoordinates();
		// 測試月亮的apparent黃道座標
		expect(Math.abs(moondata.lon - 346.1383763)).toBeLessThan(0.009);
		expect(Math.abs(moondata.lat - -4.8940719)).toBeLessThan(0.009);
	});
	test('JD at 333/1/27 12:00 is 1842713.0 Page 61 Meeus(2009)', () => {
		let toi = createTimeOfInterest.fromTime(333, 1, 27, 12, 0, 0);
		expect(toi.getJulianDay()).toBeCloseTo(1842713.0, 7);
	});
	test('JD at 1957/10/4.81 is 2436116.31 on page 61 Meeus(2009)', () => {
		let toi = createTimeOfInterest.fromTime(1957, 10, 4, 19, 26, 24);
		expect(toi.getJulianDay()).toBeCloseTo(2436116.31, 7);
	});
	test('deltaT at 2002/1/1 is 64.3 secs', () => {
		let toi = createTimeOfInterest.fromTime(2002, 1, 1, 0, 0, 0);
		expect(toi.getDeltaT()).toBeCloseTo(64.3, 1);
	});
});
describe('icrf ra dec, appraent ra dec, delta, eclon eclat', () => {
	// Ephemeris Type [change] : 	OBSERVER
	// Target Body [change] : 	Saturn [699]
	// Observer Location [change] : 	Geocentric [500]
	// Time Span [change] : 	Start=2015-8-10 17:9, Stop=2015-8-10 17:10, Intervals=60
	// Table Settings [change] : 	QUANTITIES=1,2,20,31; angle format=DEG
	// Display/Output [change] : 	default (formatted HTML)
	//  Date__(UT)__HR:MN:SC.fff     R.A.___(ICRF)___DEC R.A._(a-appar)_DEC.            delta      deldot    ObsEcLon    ObsEcLat
	//**************************************************************************************************************************
	// 2015-Aug-10 17:09:00.000     236.32336 -17.84566 236.54879 -17.89171 9.75506000404463  28.2630181 238.3404810   1.9427444
	test('2015-8-10 17:09 saturn', () => {
		const toi = createTimeOfInterest.fromTime(2015, 8, 10, 17, 9, 0);
		const T = toi.getJulianCenturiesJ2000();
		const app = eclipticSpherical2equatorialSpherical(238.340481, 1.9427444, 9.75506000404463, T);
		// 測試土星的 apparent 黃道轉apparent 赤道
		expect(app.rightAscension).toBeCloseTo(236.54879, 5);
		expect(app.declination).toBeCloseTo(-17.89171, 5);
		expect(app.radiusVector).toBeCloseTo(9.75506000404463, 7);
		const icrfEclip = equatorialSpherical2eclipticSpherical(236.32336, -17.84566, 9.75506000404463, T);
		const appEclip = eclipticJ20002eclipticDate(icrfEclip.lon, icrfEclip.lat, icrfEclip.radiusVector, T);
		// 測試土星的 J2000赤道轉J2000黃道，再轉apparent黃道
		expect(appEclip.lon).toBeCloseTo(238.340481, 2);
		expect(appEclip.lat).toBeCloseTo(1.9427444, 2);
		expect(appEclip.radiusVector).toBeCloseTo(9.75506000404463, 7);
	});
	// Ephemeris Type [change] : 	OBSERVER
	// Target Body [change] : 	Saturn [699]
	// Observer Location [change] : 	Topocentric ( 121°00'00.0''E, 25°00'00.0''N )
	// Time Span [change] : 	Start=2015-8-10 17:9, Stop=2015-8-10 17:10, Intervals=60
	// Table Settings [change] : 	QUANTITIES=1,2,20,31; angle format=DEG
	// Display/Output [change] : 	default (formatted HTML)
	// 2015-Aug-10 17:09:00.000     236.32313 -17.84575 236.54854 -17.89182 9.75507225288152  28.6575803 238.3402732   1.9425833
	test(`2015-8-10 17:09 saturn 121°00'00.0"E, 25°00'00.0"N`, async () => {
		const toi = createTimeOfInterest.fromTime(2015, 8, 10, 17, 9, 0);
		const T = toi.getJulianCenturiesJ2000();
		const saturn = createSaturn(toi);
		const app = await saturn.getApparentGeocentricEquatorialSphericalCoordinates();
		// 測試土星的apparent地心赤道座標
		expect(app.rightAscension).toBeCloseTo(236.54879, 3);
		expect(app.declination).toBeCloseTo(-17.89171, 3);
		expect(app.radiusVector).toBeCloseTo(9.75506000404463, 4);
		const topApp = equatorialSpherical2topocentricSpherical(
			T,
			app.rightAscension,
			app.declination,
			app.radiusVector,
			25,
			121,
			0
		);
		// 測試土星的apparent地心赤道轉apparent地表赤道座標
		expect(topApp.rightAscension).toBeCloseTo(236.54854, 3);
		expect(topApp.declination).toBeCloseTo(-17.89182, 3);
		expect(topApp.radiusVector).toBeCloseTo(9.75507225288152, 4);
	});
	// Ephemeris Type [change] : 	OBSERVER
	// Target Body [change] : 	Saturn [699]
	// Observer Location [change] : 	Topocentric ( 121°00'00.0''E, 25°00'00.0''N )
	// Time Span [change] : 	Start=2015-8-10 17:9, Stop=2015-8-10 17:10, Intervals=60
	// Table Settings [change] : 	QUANTITIES=1,2,4,20; angle format=DEG
	// Display/Output [change] : 	default (formatted HTML)
	// Date__(UT)__HR:MN:SC.fff     R.A.___(ICRF)___DEC R.A._(a-appar)_DEC. Azi_(a-appr)_Elev            delta      deldot
	// 2015-Aug-10 17:09:00.000     236.32313 -17.84575 236.54854 -17.89182 257.6578 -16.7370 9.75507225288152  28.6575803

	test(`2015-8-10 17:09 saturn 121°00'00.0"E, 25°00'00.0"N local horizontal`, async () => {
		const toi = createTimeOfInterest.fromTime(2015, 8, 10, 17, 9, 0);
		const T = toi.getJulianCenturiesJ2000();
		const saturn = createSaturn(toi);
		const location = createLocation(25, 121, 0);
		const local = await saturn.getApparentTopocentricHorizontalCoordinates(location);
		// console.log(local);
		// 測試土星的apparent地表地平座標
		expect(local.azimuth).toBeCloseTo(257.6578, 3);
		expect(local.altitude).toBeCloseTo(-16.737, 2);
		expect(local.radiusVector).toBeCloseTo(9.75507225288152, 4);

		const app = await saturn.getApparentGeocentricEquatorialSphericalCoordinates();
		const topApp = equatorialSpherical2topocentricHorizontal(
			T,
			app.rightAscension,
			app.declination,
			app.radiusVector,
			25,
			121,
			0
		);
		// 測試土星的apparent地心赤道轉apparent地表地平座標
		expect(topApp.azimuth).toBeCloseTo(257.6578, 3);
		expect(topApp.altitude).toBeCloseTo(-16.737, 2);
		expect(topApp.radiusVector).toBeCloseTo(9.75507225288152, 4);
	});
});
//  Date__(UT)__HR:MN:SC.fff     R.A.___(ICRF)___DEC R.A._(a-appar)_DEC.            delta      deldot       TDB-UT    ObsEcLon    ObsEcLat
//  2021-Jan-01 00:00:00.000     24.79948  11.23957  25.07558  11.34477 0.89856820833498  15.6579710    69.183909  27.3576862   0.8714905
describe('relation between Atrometric RA/DEC, airless-apparent RA/DEC and ObsEcLon/ObsEcLat', ()=>{
	test('mars at 2021-Jan-01 00:00:00.000', () =>{
		const toi = createTimeOfInterest.fromTime(2021, 1, 1, 0, 0, 0);
		const T = toi.getJulianCenturiesJ2000()
		const a_app = eclipticSpherical2equatorialSpherical(27.3576862, 0.8714905, 0.89856820833498, T, true)
		// test ObsEcLon/ObsEcLat => airless-apparent RA/DEC
		expect(a_app.rightAscension).toBeCloseTo(25.07558,5)
		expect(a_app.declination).toBeCloseTo(11.34477,5)
		const eclip_j2000 = equatorialSpherical2eclipticSpherical(24.79948, 11.23957, 0.89856820833498, T)
		const eclip_date = eclipticJ20002eclipticDate(eclip_j2000.lon, eclip_j2000.lat, eclip_j2000.radiusVector, T)
		// test Atrometric RA/DEC => ObsEcLon/ObsEcLat
		expect(eclip_date.lon).toBeCloseTo(27.3576862, 2)
		expect(eclip_date.lat).toBeCloseTo(0.8714905, 2)
	})
})
