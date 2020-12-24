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
// 太陽的黃經
function lonofsolar(jde) {
	let radian = solar.apparentVSOP87(earth, jde).lon;
	return (radian * 180 / Math.PI + 360) % 360; // 非常奇怪，加 360 後春分就對了
}
// 月亮的黃經
function lonofmoon(jde) {
	let radian = moonposition.position(jde).lon;
	return (radian * 180 / Math.PI + 360) % 360;
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
 * @returns {Date} middle date of date1 and date2
 */
function middleDate(date1, date2) {
	return new Date((date1.getTime() + date2.getTime()) / 2);
}
/**
 * compute 24 節氣時刻 of the year
 * @param {Number} year (int)
 * @returns [{name:String, date:Date}]
 */
function jieqi(year) {
	let res = [];
	let lastday = new Date(year + 1, 0, 1);
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
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
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
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
/**
 * 計算 year 年度的日曆
 * @param {Number} year (int)
 */
function createLunarCalendar(year) {
	let result = {};
	let terms1 = jieqi(year - 1);
	let terms2 = jieqi(year);
	// can not use [...terms] because Date type is a reference
	// and date in terms will be changed in generateMixedTerms
	result.terms = terms2.map((x) => {
		return { name: x.name, date: new Date(x.date) };
	});
	let terms3 = jieqi(year + 1);
	let first1 = shuoWang(year - 1);
	let first2 = shuoWang(year);
	result.shuoWangs = first2.map((x) => {
		return { name: x.name, date: new Date(x.date) };
	});
	let first3 = shuoWang(year + 1);
	let mixedTerms = generateMixedTerms(first1, first2, first3, terms1, terms2, terms3);
	// 加註日子，只保留year年度內者
	let calendar = constructCalendar(mixedTerms, year);
	result.mixedTerms = mixedTerms;
	result.calendar = calendar;
	return result;
}
/**
 * mixedTerms 中有陰曆月份資料者加註日子，並只保留year年度內的資料
 * @param {*} mixedTerms 
 * @param {Number} year (int)
 */
function constructCalendar(mixedTerms, year) {
	let result = [];
	for (let i = 0; i < mixedTerms.length; i++) {
		if (mixedTerms[i].month) {
			if (mixedTerms[i].names[0] == '初一') {
				mixedTerms[i].day = 1;
			} else {
				mixedTerms[i].day =
					Math.round((mixedTerms[i].date - mixedTerms[i - 1].date) / (1000 * 60 * 60 * 24)) +
					mixedTerms[i - 1].day;
			}
			result.push(mixedTerms[i]);
		}
	}
	return result.filter((x) => x.date.getFullYear() == year);
}
/**
 * 合併去年、今年、明年的節氣與朔望資料(移除望的資料)，時刻調為當日零時，
 * 同樣日期者併成一筆，名稱(names)為陣列。
 * 按日期排序，日期介於去年冬至所在陰曆月(含)與明年冬至陰曆月(不含)之間者加上陰曆月份(month)，
 * 註明是否閏月
 * @param {朔望時刻} first1 去年朔望
 * @param {朔望時刻} first2 今年朔望 
 * @param {朔望時刻} first3 明年朔望 
 * @param {節氣時刻} terms1 去年節氣
 * @param {節氣時刻} terms2 今年節氣
 * @param {節氣時刻} terms3 明年節氣
 * @returns [{names:[String], date:Date, month: int, leap: bool}]
 */
function generateMixedTerms(first1, first2, first3, terms1, terms2, terms3) {
	let terms = first1
		.concat(first2)
		.concat(first3)
		.concat(terms1)
		.concat(terms2)
		.concat(terms3)
		.filter((x) => x.name != '望')
		.map(function(x) {
			x.date.setHours(0, 0, 0, 0);
			return x;
		})
		.sort((x, y) => x.date - y.date);
	let mixedTerms = [];
	let curDate = terms[0].date;
	let curNames = [ terms[0].name ];
	for (let i = 1; i < terms.length; i++) {
		if (terms[i].date - curDate == 0) {
			curNames.push(terms[i].name);
		} else {
			mixedTerms.push({ date: curDate, names: [ ...curNames ] });
			curDate = terms[i].date;
			curNames = [ terms[i].name ];
		}
	}
	mixedTerms.push({ date: curDate, names: [ ...curNames ] });
	// 將 mixedTerms 裡面的資料加上陰曆月份，註明是否閏月
	adjustMixedTerms(mixedTerms);
	return mixedTerms;
}
/**
 * 該陰曆月是否缺中氣
 * @param {節氣初一} mixedTerms 
 * @param {各月初一在mixedTerms的足碼} onesIndexes 
 * @param {該月初一在mixedTerms的足碼} j 
 */
function exitsZhongqi(mixedTerms, onesIndexes, j) {
	let off = onesIndexes.indexOf(j);
	let res = false;
	for (let i = j; i < onesIndexes[off + 1]; i++) {
		for (let n = 0; n < mixedTerms[i].names.length; n++) {
			if (ZhongqiNames.includes(mixedTerms[i].names[n])) return true;
		}
	}
	return res;
}
/**
 * 將 mixedTerms 裡面的資料加上陰曆月份，並註明是否閏月
 * @param {[{date:Date, names:[String]}]} mixedTerms 
 * {[{date:Date, names:[String], month:int, leap:bool}]}
 */
function adjustMixedTerms(mixedTerms) {
	// 將前一年冬至之後一年冬至的資料加上月份資料
	let dongzhiIndexes = []; // 冬至日在 mixedTerms 的 index，預期有3個
	let onesIndexes = []; // // 初一日在 mixedTerms 的 index，預期有36-39個
	for (let i = 0; i < mixedTerms.length; i++) {
		if (mixedTerms[i].names.includes('冬至')) {
			dongzhiIndexes.push(i);
		}
		if (mixedTerms[i].names.includes('初一')) {
			onesIndexes.push(i);
		}
	}
	let dongzhiInOneIndexes = []; // 冬至日對應月份在mixedTerms 的 index,預期有3個
	for (let i = 0; i < dongzhiIndexes.length; i++) {
		for (let j = onesIndexes.length - 1; j >= 0; j--) {
			if (onesIndexes[j] <= dongzhiIndexes[i]) {
				dongzhiInOneIndexes.push(onesIndexes[j]);
				break;
			}
		}
	}
	let leaps = []; // 是否閏年， 預期兩個
	for (let i = 0; i < dongzhiInOneIndexes.length - 1; i++) {
		let onecount = 0;
		for (let j = 0; j < onesIndexes.length; j++) {
			if (onesIndexes[j] >= dongzhiInOneIndexes[i] && onesIndexes[j] < dongzhiInOneIndexes[i + 1]) {
				onecount++;
			}
		}
		if (onecount > 12) leaps.push(true);
		else leaps.push(false);
	}
	for (let i = 0; i < dongzhiInOneIndexes.length - 1; i++) {
		if (leaps[i] == false) {
			// 加入陰曆月份
			let month = 10; // 0-offset
			for (let j = dongzhiInOneIndexes[i]; j < dongzhiInOneIndexes[i + 1]; j++) {
				if (j > dongzhiInOneIndexes[i] && mixedTerms[j].names.includes('初一')) month = (month + 1) % 12;
				mixedTerms[j].month = month + 1; // 1-offset
			}
		} else {
			// 加入陰曆月份，閏月加註
			let month = 10; // 0-offset
			let setleap = false;
			let itemleap = false;
			for (let j = dongzhiInOneIndexes[i]; j < dongzhiInOneIndexes[i + 1]; j++) {
				if (j > dongzhiInOneIndexes[i] && mixedTerms[j].names.includes('初一')) {
					if (!exitsZhongqi(mixedTerms, onesIndexes, j) && !setleap) {
						// 缺中氣只要之潤一次
						itemleap = true;
						setleap = true;
					} else {
						month = (month + 1) % 12;
						itemleap = false;
					}
				}
				mixedTerms[j].month = month + 1; // 1-offset
				mixedTerms[j].leap = itemleap;
			}
		}
	}
}
module.exports = { jieqi, shuoWang, createLunarCalendar };

/*console.log(ZhongqiNames)
let start = Date.now()
console.log(createLunarCalendar(2020))
//console.log(createLunarCalendar(2020).map(function (x) {return {name:x.names.join(","),month:x.month,date:x.date.toString()}}))
let end = Date.now()
console.log(""+(end-start)/1000+" seconds")*/
//jieqi(2019)
//shuoWang(2020)

//let date = new Date(2020,11,23,12,1,2,3)
//console.log(date, date.getTime())
//date.setHours(0,0,0,0)
//console.log(date, date.getTime())

//let date1=new Date(2020,11,23,12,1,2,3)
//let date2=new Date(2020,11,23,12,1,2,3)
//console.log(date1==date2)
//console.log(date1-date2)

//let numbers = [1, 2, 3];
//let numbersCopy = [...numbers];
//console.log(numbersCopy)
//console.log(numbers==numbersCopy)
