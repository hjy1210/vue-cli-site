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
	return (radian * 180 / Math.PI + 360) % 360;    // 非常奇怪，加 360 後春分就對了
}
// 月亮的黃經
function lonofmoon(jde) {
	let radian = moonposition.position(jde).lon;
	return (radian * 180 / Math.PI + 360) % 360;
}
function jie(date){
    return Math.floor(lonofsolar(julian.DateToJDE(date))/15)
}
function _shuoWang(date){
    let lon1 = lonofsolar(julian.DateToJDE(date))
    let lon2 = lonofmoon(julian.DateToJDE(date))
    let lon = (lon2-lon1+720) % 360
    return Math.floor(lon/180)
}
function inJie(date1, date2){
    let lon1 = lonofsolar(julian.DateToJDE(date1))
    let lon2 = lonofsolar(julian.DateToJDE(date2))
    let jie1 = Math.floor(lon1/15)
    let jie2 = Math.floor(lon2/15)
    if (jie1!=jie2){
        return jie2 % 24
    } else {
        return -1
    }
}
function inShuoWang(date1,date2){
    let lon11 = lonofsolar(julian.DateToJDE(date1))
    let lon12 = lonofsolar(julian.DateToJDE(date2))
    let lon21 = lonofmoon(julian.DateToJDE(date1))
    let lon22 = lonofmoon(julian.DateToJDE(date2))
    let lon1=(lon21-lon11+720)%360
    let lon2=(lon22-lon12+720)%360
    let jie1 = Math.floor(lon1/180)
    let jie2 = Math.floor(lon2/180)
    if (jie1!=jie2){
        return jie2 % 2
    } else {
        return -1
    }
}
function getTomorrow(date) {
	let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	d.setDate(d.getDate() + 1);
	return d;
}
const ShuoWangNames = ["初一","望"]
const JieqiNames=["春分","清明","穀雨","立夏","小滿","芒種","夏至","小暑","大暑","立秋",
    "處暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","驚蟄"]
function middleDate(date1, date2) {
    return new Date((date1.getTime()+date2.getTime())/2)
}

function jieqi(year) {
    let res=[]
    let lastday = new Date(year + 1, 0, 1);
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
        let tomorrow=getTomorrow(today)
        let value = inJie(today,tomorrow)
        if (value>=0){
            let left = new Date(today)
            let right = new Date(tomorrow)
            while (right-left>500) {
                let jie1 = jie(left)
                let middle = middleDate(left, right)
                let jie0 = jie(middle)
                if (jie0==jie1)
                  left = middle
                else 
                  right = middle
            }
            res.push({name:JieqiNames[value],date:middleDate(left, right)})
        }
    }
    return res
}
function shuoWang(year) {
    let res=[]
    let lastday = new Date(year + 1, 0, 1);
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
        let tomorrow=getTomorrow(today)
        let value = inShuoWang(today,tomorrow)
        if (value>=0){
            let left = new Date(today)
            let right = new Date(tomorrow)
            let sw1 = _shuoWang(left)
            while (right-left>500) {
                let middle = middleDate(left, right)
                let sw0 = _shuoWang(middle)
                if (sw0==sw1)
                  left = middle
                else 
                  right = middle
            }
            res.push({name:ShuoWangNames[value],date:middleDate(left, right)})
        }
    }
    return res
}
function createLunarCalendar(year){
    let terms1 = jieqi(year-1)
    let terms2 = jieqi(year)
    let terms3 = jieqi(year+1)
    let first1 = shuoWang(year-1)
    let first2 = shuoWang(year)
    let first3 = shuoWang(year+1)
    let terms = first1.concat(first2).concat(first3).concat(terms1).concat(terms2).concat(terms3)
        .filter(x=>x.name!="望")
        .sort((x,y)=>x.date-y.date)
    return terms
}
module.exports = {jieqi, shuoWang, createLunarCalendar}

//let start = Date.now()
//console.log(createLunarCalendar(2020).map(function (x) {return {name:x.name,date:x.date.toString()}}))
//let end = Date.now()
//console.log(""+(end-start)/1000+" seconds")
//jieqi(2019)
//shuoWang(2020)

// https://ssd.jpl.nasa.gov/horizons.cgi 可查許多資料，抱括太陽到地心的赤經資料
//Ephemeris Type [change] : 	OBSERVER
//Target Body [change] : 	Sun [Sol] [10]
//Observer Location [change] : 	Geocentric [500]
//Time Span [change] : 	Start=2020-9-22 13:30, Stop=2020-9-22 13:31, Intervals=60
//Table Settings [change] : 	QUANTITIES=1,2,31
//Display/Output [change] : 	default (formatted HTML)

/*
console.log(earth)
// 計算2020年的節氣，與中央氣象局的資料完全相符
for (let i=0; i<12; i++){
    console.log(julian.JDEToDate(solstice.longitude(2020, earth, i* Math.PI/6)))
}

// meeus 2009 p.79 2002 deltaT = 64.3
let date = new Date(2002,0,1)
let diff = julian.DateToJDE(date) - julian.DateToJD(date)
console.log(julian.DateToJDE(date), julian.DateToJD(date), diff*86400)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
// Date constructor with string is not encouraged due to browser differences and inconsistencies.
date = new Date('2000-01-01T00:00:00Z')
let date1 = new Date(Date.UTC(2000,0,1))
console.log(`new Date('2000-01-01T00:00:00Z')=${new Date('2000-01-01T00:00:00Z').toUTCString()}\nnew Date(Date.UTC(2000,0,1))=${new Date(Date.UTC(2000,0,1)).toUTCString()}`)
let tjd = julian.DateToJD(date)
console.log(julian.CalendarGregorianToJD(2000,1,1), tjd)
console.log(date, tjd, tjd/36525, base.J2000Century(tjd))
console.log((tjd-2451545)/36525)
console.log(-1/36525/2)
*/
//console.log(""+middleDate(new Date(2020,11,22), new Date(2020,11,23)))