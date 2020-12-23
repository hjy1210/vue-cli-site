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
function jieqi(year) {
    let res=[]
    let lastday = new Date(year + 1, 0, 1);
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
        let tomorrow=getTomorrow(today)
        if (inJie(today,tomorrow)>=0){
            //console.log(""+today)
            for (let hour=0;hour<24;hour++){
                let hour1=new Date(today)
                hour1.setHours(hour,0,0)
                let hour2=new Date(today)
                hour2.setHours(hour+1,0,0)
                if (inJie(hour1,hour2)>=0){
                    //console.log(""+hour1)
                    for (let minute=0;minute<60;minute++){
                        let minute1=new Date(hour1)
                        minute1.setHours(hour,minute,0)
                        let minute2=new Date(hour1)
                        minute2.setHours(hour,minute+1,0)
                        if (inJie(minute1,minute2)>=0){
                            //console.log(""+minute1)
                            for (let second=0; second<60; second++){
                                let second1=new Date(minute1)
                                second1.setHours(hour,minute,second)
                                let second2=new Date(minute1)
                                second2.setHours(hour,minute,second+1)
                                if (inJie(second1,second2)>=0){
                                    //console.log(JieqiNames[inJie(second1,second2)]+second1)
                                    res.push({name:JieqiNames[inJie(second1,second2)],date:second1})
                                    break
                                }
                            }
                            break
                        }
                    }
                    break
                }
            }
        }
    }
    return res
}
function shuoWang(year) {
    let res=[]
    let lastday = new Date(year + 1, 0, 1);
	for (let today = new Date(year, 0, 1); today < lastday; today = getTomorrow(today)) {
        let tomorrow=getTomorrow(today)
        if (inShuoWang(today,tomorrow)>=0){
            //console.log(""+today)
            for (let hour=0;hour<24;hour++){
                let hour1=new Date(today)
                hour1.setHours(hour,0,0)
                let hour2=new Date(today)
                hour2.setHours(hour+1,0,0)
                if (inShuoWang(hour1,hour2)>=0){
                    //console.log(""+hour1)
                    for (let minute=0;minute<60;minute++){
                        let minute1=new Date(hour1)
                        minute1.setHours(hour,minute,0)
                        let minute2=new Date(hour1)
                        minute2.setHours(hour,minute+1,0)
                        if (inShuoWang(minute1,minute2)>=0){
                            //console.log(""+minute1)
                            for (let second=0; second<60; second++){
                                let second1=new Date(minute1)
                                second1.setHours(hour,minute,second)
                                let second2=new Date(minute1)
                                second2.setHours(hour,minute,second+1)
                                if (inShuoWang(second1,second2)>=0){
                                    //console.log(ShuoWangNames[inShuoWang(second1,second2)]+second1)
                                    res.push({name:ShuoWangNames[inShuoWang(second1,second2)],date:second1})
                                    break
                                }
                            }
                            break
                        }
                    }
                    break
                }
            }
        }
    }
    return res
}
module.exports = {jieqi, shuoWang}
/*let today=new Date(2020,0,1)
for (let i=0;i<40;i++){
    console.log(""+today)
    today=getTomorrow(today)
}*/

//jieqi(2020);
//jieqi(2019)
//shuoWang(2020)
/*
for (let i=-5;i<6;i++){
    let tjde=jde(2020,12,15,0,17+i)
    console.log(17+i,lonofmoon(tjde),lonofsolar(tjde),lonofmoon(tjde)-lonofsolar(tjde))
}
for (let i=-5;i<6;i++){
    let tjde=jde(2020,12,30,11,28+i)
    console.log(28+i,lonofmoon(tjde),lonofsolar(tjde),lonofmoon(tjde)-lonofsolar(tjde))
}

// https://ssd.jpl.nasa.gov/horizons.cgi 可查許多資料，抱括太陽到地心的赤經資料
//Ephemeris Type [change] : 	OBSERVER
//Target Body [change] : 	Sun [Sol] [10]
//Observer Location [change] : 	Geocentric [500]
//Time Span [change] : 	Start=2020-9-22 13:30, Stop=2020-9-22 13:31, Intervals=60
//Table Settings [change] : 	QUANTITIES=1,2,31
//Display/Output [change] : 	default (formatted HTML)

console.log("算春分")
for (let i=-5;i<6;i++){
    let jds = jde(2020,3,20,11,49+i)
    console.log(49+i,lonofsolar(jds))
}
console.log("算秋分")
for (let i=-5;i<6;i++){
    console.log(31+i,lonofsolar(jde(2020,9,22,21,31+i)))
}
*/
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
