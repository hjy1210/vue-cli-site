let { julian, solar, planetposition, data, moonposition } = require('astronomia');
const earth = new planetposition.Planet(data.earth);

/**
 * converts a Gregorian year, month, day, hour, minute, second to Julian Ephemeris Day.
 *
 * Negative years are valid, back to JD 0.  The result is not valid for
 * dates before JD 0.
 * 
 * @param {Number} year (int)
 * @param {Number} month (int) 
 * @param {Number} day (int) 
 * @param {Number} hour (int) 
 * @param {Number} minute (int) 
 * @param {Number} second (float) 
 * @returns {Number} Julian Ephemeris Day (float)
 
function jde(year, month, day = 1, hour = 0, minute = 0, second = 0) {
	const date = new Date(year, month - 1, day, hour, minute, second); // monthindex=month-1 is 0-offset
	return julian.DateToJDE(date);
}
// 太陽的赤經(不夠準確)
function lonofsolar0(jde) {
	let radian = solar.apparentLongitude(base.J2000Century(jde));
	return (radian * 180 / Math.PI) % 360;
}*/

/**
 * 太陽的黃經
 * get solor's longitude in degree in [0,360)
 * @param {number} jde - Julian Ephericis Day
 * @return {number} - solor's longitude in degree
 */
function lonofsolar(jde) {
	let radian = solar.apparentVSOP87(earth, jde).lon;
	return (radian * 180 / Math.PI + 360) % 360; // 非常奇怪，加 360 後春分就對了
}
function latofsolar(jde) {
	let radian = solar.apparentVSOP87(earth, jde).lat;
	return radian * 180 / Math.PI;
}

/**
 * 月亮的黃經
 * get moon's longitude in degree in [0,360)
 * @param {number} jde - Julian Ephericis Day
 * @return {number} - solor's longitude in degree
 */
function lonofmoon(jde) {
	let radian = moonposition.position(jde).lon;
	return (radian * 180 / Math.PI + 360) % 360;
}
function latofmoon(jde) {
	let radian = moonposition.position(jde).lat;
	return radian * 180 / Math.PI;
}
function jieIndex(date) {
	return Math.floor(lonofsolar(julian.DateToJDE(date)) / 15);
}
function shuoWangIndex(date) {
	let lon1 = lonofsolar(julian.DateToJDE(date));
	let lon2 = lonofmoon(julian.DateToJDE(date));
	let lon = (lon2 - lon1 + 720) % 360;
	return Math.floor(lon / 180);
}
function inJie(date1, date2) {
	let lon1 = lonofsolar(julian.DateToJDE(date1));
	let lon2 = lonofsolar(julian.DateToJDE(date2));
	let jie1 = Math.floor(lon1 / 15);
	let jie2 = Math.floor(lon2 / 15);
	if (jie1 != jie2) {
		return jie2 % 24;
	} else {
		return -1;
	}
}
function inShuoWang(date1, date2) {
	let lon11 = lonofsolar(julian.DateToJDE(date1));
	let lon12 = lonofsolar(julian.DateToJDE(date2));
	let lon21 = lonofmoon(julian.DateToJDE(date1));
	let lon22 = lonofmoon(julian.DateToJDE(date2));
	let lon1 = (lon21 - lon11 + 720) % 360;
	let lon2 = (lon22 - lon12 + 720) % 360;
	let jie1 = Math.floor(lon1 / 180);
	let jie2 = Math.floor(lon2 / 180);
	if (jie1 != jie2) {
		return jie2 % 2;
	} else {
		return -1;
	}
}
function getTomorrow(date) {
	let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	d.setFullYear(date.getFullYear());
	d.setDate(d.getDate() + 1);
	return d;
}
const ShuoWangNames = [ '初一', '望' ];
const JieqiNames = [
	'春分',
	'清明',
	'穀雨',
	'立夏',
	'小滿',
	'芒種',
	'夏至',
	'小暑',
	'大暑',
	'立秋',
	'處暑',
	'白露',
	'秋分',
	'寒露',
	'霜降',
	'立冬',
	'小雪',
	'大雪',
	'冬至',
	'小寒',
	'大寒',
	'立春',
	'雨水',
	'驚蟄'
];
const ZhongqiNames = JieqiNames.filter((x, i) => i % 2 == 0);
/**
 * compute middle date of date1 and date2
 * @param {Date} date1 
 * @param {Date} date2
 * @returns {Date} - middle date of date1 and date2
 */
function middleDate(date1, date2) {
	return new Date((date1.getTime() + date2.getTime()) / 2);
}
/**
 * 計算年度 year 的 24 節氣時刻
 * @param {Number} year (int)
 * @return {[{name:String, date:Date}]} 節氣時刻陣列 
 */
function jieqi(year) {
	let res = [];
	let lastday = new Date(year + 1, 0, 1);
	let today = new Date(year, 0, 1);
	lastday.setFullYear(year + 1);
	today.setFullYear(year);
	for (; today < lastday; today = getTomorrow(today)) {
		let tomorrow = getTomorrow(today);
		let value = inJie(today, tomorrow);
		if (value >= 0) {
			let left = new Date(today);
			let right = new Date(tomorrow);
			while (right - left > 500) {
				let jie1 = jieIndex(left);
				let middle = middleDate(left, right);
				let jie0 = jieIndex(middle);
				if (jie0 == jie1) left = middle;
				else right = middle;
			}
			res.push({ name: JieqiNames[value], date: middleDate(left, right) });
		}
	}
	return res;
}

/**
 * compute 朔望時刻 of the year
 * @param {Number} year (int)
 * @returns [{name:String, date:Date}]
 */
function shuoWang(year) {
	let res = [];
	let lastday = new Date(year + 1, 0, 1);
	let today = new Date(year, 0, 1);
	lastday.setFullYear(year + 1);
	today.setFullYear(year);

	for (; today < lastday; today = getTomorrow(today)) {
		let tomorrow = getTomorrow(today);
		let value = inShuoWang(today, tomorrow);
		if (value >= 0) {
			let left = new Date(today);
			let right = new Date(tomorrow);
			let sw1 = shuoWangIndex(left);
			while (right - left > 500) {
				let middle = middleDate(left, right);
				let sw0 = shuoWangIndex(middle);
				if (sw0 == sw1) left = middle;
				else right = middle;
			}
			res.push({ name: ShuoWangNames[value], date: middleDate(left, right) });
		}
	}
	return res;
}
module.exports = { jieqi, shuoWang, ZhongqiNames, getTomorrow, lonofsolar };
/*
let jdes = [1721789.5684809217, 1721790.0684809217, 1721790.5684809217]
jdes = [1721789.5684809217, 1721790.0684809217, 1721790.5684809217]
let dates = jdes.map(x=>julian.JDEToDate(x))
console.log(dates,""+dates)
dates = jdes.map(x=>julian.JDEToDate(x+0.3))
console.log(dates,""+dates)
*/
if (__dirname == 'E:\\vue-cli-site\\src\\componen') {
	let lons = [];
	for (let i = 0; i < 12; i++) {
		let day = new Date(Date.UTC(2020, i, 1));
		let jde = julian.DateToJDE(day);
		lons.push(lonofsolar(jde));
	}
	console.log(lons);

	let lats = [];
	for (let i = 0; i < 12; i++) {
		let day = new Date(Date.UTC(2020, i, 1));
		let jde = julian.DateToJDE(day);
		lats.push(latofsolar(jde));
	}
	console.log(lats);
	lons = [];
	for (let i = 0; i < 12; i++) {
		let day = new Date(Date.UTC(2020, i, 1));
		let jde = julian.DateToJDE(day);
		lons.push(lonofmoon(jde));
	}
	console.log(lons);

	lats = [];
	for (let i = 0; i < 12; i++) {
		let day = new Date(Date.UTC(2020, i, 1));
		let jde = julian.DateToJDE(day);
		lats.push(latofmoon(jde));
	}
	console.log(lats);
}
