let {jieqi, shuoWang, ZhongqiNames} = require("./base.js");
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
 * mixedTerms 在 [start, end) 足碼範圍是否有中氣?
 * @param {Array} mixedTerms - 節氣所望陣列
 * @param {int} start - 在mixedTerms的起始足碼
 * @param {int} end - 在mixedTerms的起始足碼
 * @return {boolean} - ture 代表有中氣
 */
function exitsZhongqi(mixedTerms, start , end) {
	let res = false;
	for (let i = start; i < end; i++) {
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
					let index = onesIndexes.indexOf(j)
					if (!exitsZhongqi(mixedTerms, j, onesIndexes[index+1]) && !setleap) {
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
module.exports = { createLunarCalendar };

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
