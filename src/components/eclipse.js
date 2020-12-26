let { julian, solar, planetposition, data, moonposition } = require('astronomia');
const earth = new planetposition.Planet(data.earth);
const AU = 149597870.700 // 單位：km
const RadiusMoon = 1737.1
const RadiusSun = 696342
/**
 * 將黃道座標轉成直角座標，長度單位為km
 * @param {number} rao - 與原點間之距離，單位km
 * @param {number} lon - 黃經，經度量
 * @param {number} lat - 黃緯，經度量
 * @return {Array} - 直角坐標，單位km
 */
function XYZ(rao,lon,lat){
    let r = rao * Math.cos(lat);
    return [r*Math.cos(lon), r*Math.sin(lon), rao*Math.sin(lat)];
}
/**
 * 算太陽在 jde 日的黃道直角坐標，單位km
 * @param {number} jde - Julian Ephemeris Day (float)
 */
function solarEclipticCoord(jde){
    let p = solar.apparentVSOP87(earth, jde)
    return XYZ(p.range * AU, p.lon, p.lat)
}
/**
 * 算月亮在 jde 日的黃道直角坐標，單位km
 * @param {number} jde - Julian Ephemeris Day (float)
 */
function moonEclipticCoord(jde){
    let p = moonposition.position(jde)
    return XYZ(p.range , p.lon, p.lat)
}
function moonEclipseStatus(jde) {
    function _earthShadowSize(){

    }
    function _moonSize() {
        let p = moonposition.position(jde)
        return Math.arcsin(RadiusMoon/p.range)
    }
    function _moonSeparation(){

    }
    let moonSeparation = _moonSeparation()
    let moonSize = _moonSize()
    let earthShadowSize = _earthShadowSize();
    if (moonSeparation> earthShadowSize + moonSize)
        return "O"
    if (earthShadowSize > moonSize) {
        if (moonSeparation> earthShadowSize - moonSize)
            return "P"  // 月偏食
        else 
            return "F"  // 月全食
    } else {
        if (moonSeparation > moonSize - earthShadowSize)
            return "P"
        else 
            return "C"  // 月亮上有地球完整的圓形影子(可能不會發生)
    }
}


let jde = julian.DateToJDE(new Date())
console.log(solar.apparentVSOP87(earth, jde))
console.log(solarEclipticCoord(jde))
console.log(moonposition.position(jde))
console.log(moonEclipticCoord(jde))
