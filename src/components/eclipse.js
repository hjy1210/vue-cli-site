let { julian, solar, planetposition, data, moonposition } = require('astronomia');
//let {jieqi, shuoWang, ZhongqiNames} = require("./base.js");
const earth = new planetposition.Planet(data.earth);
const AU = 149597870.7; // 單位：km
const RadiusMoon = 1737.1;
const RadiusSun = 696342;
const RadiusEarth = 6378.1;
/**
 * 將黃道座標轉成直角座標，長度單位為km
 * @param {number} rao - 與原點間之距離，單位km
 * @param {number} lon - 黃經，經度量
 * @param {number} lat - 黃緯，經度量
 * @return {Array} - 直角坐標，單位km
 */
function XYZ(rao, lon, lat) {
	let r = rao * Math.cos(lat);
	return [ r * Math.cos(lon), r * Math.sin(lon), rao * Math.sin(lat) ];
}
/**
 * distince between p and q in  3-dimension space
 * @param {*} p 
 * @param {*} q 
 */
function distance(p, q) {
	return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]));
}
/**
 * 算太陽在 jde 日的黃道直角坐標，單位km
 * @param {number} jde - Julian Ephemeris Day (float)
 */
function solarEclipticCoord(jde) {
	let p = solar.apparentVSOP87(earth, jde);
	return XYZ(p.range * AU, p.lon, p.lat);
}
/**
 * 算月亮在 jde 日的黃道直角坐標，單位km
 * @param {number} jde - Julian Ephemeris Day (float)
 */
function moonEclipticCoord(jde) {
	let p = moonposition.position(jde);
	return XYZ(p.range, p.lon, p.lat);
}
function subtract(p, q) {
	let res = [];
	for (let i = 0; i < p.length; i++) {
		res.push(p[i] - q[i]);
	}
	return res;
}
function norm(p) {
	return distance(p, [ 0, 0, 0 ]);
}
function scalarProduct(s, p) {
	let res = [];
	for (let i = 0; i < p.length; i++) {
		res.push(s * p[i]);
	}
	return res;
}
function add(p, q) {
	let res = [];
	for (let i = 0; i < p.length; i++) {
		res.push(p[i] + q[i]);
	}
	return res;
}
function dot(p, q) {
	let res = 0;
	for (let i = 0; i < p.length; i++) res += p[i] * q[i];
	return res;
}
function separation(p, q) {
	return Math.acos(dot(p, q) / (norm(p) * norm(q)));
}
/**
 * 算全影頂點 ucenter 與半影頂點 pcenter
 * @param {array} s - 太陽
 * @param {number} rs - 太陽半徑
 * @param {array} o - 遮蔽體
 * @param {number} ro - 遮蔽體半徑
 * @param {boolean} asin - true 時用 Math.arcsin 算夾角
 */
function getConeData(s, rs, o, ro, asin) {
	let o2s = subtract(s, o);
	let dso = norm(o2s); // # 日地/月距
	let sodir = scalarProduct(-1 / dso, o2s);
	let du = ro / (rs - ro) * dso; //# 地/月與ucenter的距離
	let ucenter = add(o, scalarProduct(du, sodir));
	let uarc;
	if (asin) uarc = Math.asin(ro / du);
	else uarc = ro / du;
	let dp = ro / (rs + ro) * dso; //#  地/月與pcenter的距離
	let parc;
	if (asin) parc = Math.asin(ro / dp);
	else parc = ro / dp;
	let pcenter = subtract(o, scalarProduct(dp, sodir));
	return { ucenter, pcenter, uarc, parc, sodir };
}
/**
 * 依據太陽S,遮蔽體O,標的體T的相關資料算得標的體T被陽光照到的狀況
 * @param {Array} S - 太陽
 * @param {Array} O - 遮蔽體 
 * @param {Array} T - 標的體
 * @param {number} rt - 標的體半徑
 * @param {Array} Ucenter - 全影頂點
 * @param {Array} Pcenter - 半影頂點
 * @param {number} uarc - 全影角度
 * @param {number} parc - 半影角度 
 * @param {Array} SOdir - 陽光照射主要方向
 * @return {string} - 標的體T的狀況
 *  "O": 完全沒被遮到
 *  "P": 部分地點沒被全部的太陽照到(有地區落在半影)
 *  "F": 部分地點完全沒被陽光照到(有地區落在本影)
 *  "G": 全部地點完全沒被陽光照到(全部地區落在本影)
 *  "D": 部分地點完全沒被陽光照到，但整個外緣有被照到(有地區落在本影，但整個外緣落在本影外)
 *  "H": 全部地點落在偽本影
 *  "I": 有地區落在偽本影
 *  "J": 有地區落在偽本影，但整個外緣落在偽本影外
 */

function hideStatus(S, O, T, rt, Ucenter, Pcenter, uarc, parc, SOdir) {
	if (dot(subtract(T, O), SOdir) <= 0) return 'O';
	let vp = subtract(T, Pcenter);
	let ptarc = Math.asin(rt / norm(vp)); // 從 Pcenter 看 T 的視角之半
	let psep = separation(subtract(T, Pcenter), SOdir); // Pcenter 往 T 方向與 SO 方向的夾角
	if (psep > parc + ptarc) return 'O';
	let vu = subtract(T, Ucenter);
	let dist = norm(vu);
	if (dot(vu, SOdir) <= 0) {
		// 全影頂點為準，近日側
		if (dist <= rt) return 'F';
		let utarc = Math.asin(rt / dist);
		let usep = separation(vu, subtract([ 0, 0, 0 ], SOdir));
		if (uarc > utarc) {
			if (usep < uarc - utarc) return 'G';
			else if (usep < uarc + utarc) return 'F';
			else return 'P';
		} else {
			if (usep < utarc - uarc) return 'D';
			else if (usep < uarc + utarc) return 'F';
			else return 'P';
		}
	} else {
		// 全影頂點為準，遠日側
		if (dist <= rt) return 'F';
		let utarc = Math.asin(rt / dist);
		let usep = separation(vu, SOdir);
		if (utarc < usep) {
			if (usep < uarc - utarc) return 'H';
			else if (usep < uarc + utarc) return 'I';
			else return 'P';
		} else {
			if (usep < utarc - uarc) return 'I';
			else if (usep < uarc + utarc) return 'J';
			else return 'P';
		}
	}
}

const moonStatus = {
	O: '正常',
	P: '半影月蝕',
	F: '月偏食',
	G: '月全食',
	D: '月環食',
	H: '半影月蝕',
	I: '半影月蝕',
	J: '半影月蝕'
};
const earthStatus = {
	O: '正常',
	P: '日偏蝕',
	F: '日全食',
	G: '全境日全食',
	D: '日全食',
	H: '全境日環蝕',
	I: '日環蝕',
	J: '日環蝕'
};

function moonEclipseStatus(jde) {
	let o = [ 0, 0, 0 ];
	let s = solarEclipticCoord(jde);
	let t = moonEclipticCoord(jde);
	let rs = RadiusSun;
	let ro = RadiusEarth;
	let { ucenter, pcenter, uarc, parc, sodir } = getConeData(s, rs, o, ro, true);
	let status = hideStatus(s, o, t, RadiusMoon * 1.01, ucenter, pcenter, uarc, parc, sodir);
	return moonStatus[status];
}
function solarEclipseStatus(jde) {
	let o = moonEclipticCoord(jde);
	let s = solarEclipticCoord(jde);
	let t = [ 0, 0, 0 ];
	let rs = RadiusSun;
	let ro = RadiusMoon;
	let { ucenter, pcenter, uarc, parc, sodir } = getConeData(s, rs, o, ro, true);
	let status = hideStatus(s, o, t, RadiusEarth, ucenter, pcenter, uarc, parc, sodir);
	return earthStatus[status];
}
let eclipseMap = { solar: solarEclipseStatus, moon: moonEclipseStatus };
// https://eclipse.gsfc.nasa.gov/
function Eclipse(beginDate, endDate, eclipseStatus) {
	return new Promise((resolve) => {
		let result = [];
		let begin = new Date(beginDate);
		begin.setSeconds(0);
		let end = new Date(endDate);
		end.setSeconds(0);
		// console.log(begin, end)
		let minutes = Math.floor((end - begin) / (1000 * 60));
		// console.log(minutes)
		let jde = julian.DateToJDE(begin);
		let data = [];
		for (let i = 0; i <= minutes; i++) {
			data.push({ jde, date: julian.JDEToDate(jde), status: eclipseStatus(jde) });
			jde += 1 / 24 / 60;
		}
		//console.log(data)
		//console.log(""+data[0].date, data[0].status)
		result.push({ date: data[0].date, status: data[0].status });
		for (let i = 1; i < data.length; i++) {
			let origStatus = data[i - 1].status;
			if (data[i].status != origStatus) {
				// console.log(""+data[i].date, data[i].status)
				let jde = julian.DateToJDE(data[i - 1].date);
				let changed = false;
				for (let j = 1; j < 60; j++) {
					jde += 1 / 24 / 60 / 60;
					let status = eclipseStatus(jde);
					if (status != origStatus) {
						//console.log(""+julian.JDEToDate(jde), status)
						result.push({ date: julian.JDEToDate(jde), status: status });
						changed = true;
						break;
					}
				}
				if (!changed)
					//console.log(""+data[i].date, data[i].status)
					result.push({ date: data[i].date, status: data[i].status });
			}
		}
		resolve(result);
	});
}

module.exports = { Eclipse, eclipseMap, julian };
/*
function InspectDu(year, name) {
    let terms = shuoWang(year).filter(x=>x.name==name)
    if (name=="望") {
        for (let i=0;i<terms.length;i++) {
            let jde = julian.DateToJDE(terms[i].date)
            let psun = solarEclipticCoord(jde)
            let pmoon = moonEclipticCoord(jde)
            let dso = distance(psun, [0,0,0])
            let du = dso*RadiusEarth/(RadiusSun-RadiusEarth)
            let dm = distance(pmoon,[0,0,0])
            console.log(`dm=${dm}, du=${du}, dm-du=${dm-du}`)
        }
    } else if (name=="初一") {
        for (let i=0;i<terms.length;i++) {
            let jde = julian.DateToJDE(terms[i].date)
            let psun = solarEclipticCoord(jde)
            let pmoon = moonEclipticCoord(jde)
            let dso = distance(psun, pmoon)
            let du = dso*RadiusMoon/(RadiusSun-RadiusMoon)
            let de = distance(pmoon,[0,0,0])
            console.log(`de=${de}, du=${du}, de-du=${de-du}`)
        }

    }
}

let jde = julian.DateToJDE(new Date())
console.log(solar.apparentVSOP87(earth, jde))
console.log(solarEclipticCoord(jde))
console.log(moonposition.position(jde))
console.log(moonEclipticCoord(jde))
InspectDu(2020,"望")  // du 遠遠在月亮之外，不會月環食
console.log("\n")
InspectDu(2020,"初一") // du 與月地距互有領先，有時地球還包住外公切線焦點*/
//console.log(Eclipse(new Date(2020,5,21,11), new Date(2020,5,21,18), eclipseMap.solar))
//console.log(Eclipse(new Date(2020,5,6,0), new Date(2020,5,6,6), eclipseMap.moon))
