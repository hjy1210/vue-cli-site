# vue-cli-site

## Project setup

```{node}
npm install
```

### Compiles and hot-reloads for development

```{node}
npm run serve
```

### Compiles and minifies for production

```{node}
npm run build
```

### Lints and fixes files

```{node}
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Scaffold

Execute `vue create vue-cli-site` in parent directory to create this project.

### Debug: Use Vue.js devtools in chrome

1. 用 Chrome 瀏覽到網頁
2. 在 devtools|F12 > sources|pages|top|webpack > click selected vue component > component source appeared > can set break point now


## LunarCalendar.vue

在 VSCode 按 ctrl+shift+p，取 generator-vue-component:new component 得 LunarCalendar.vue 的骨架，
撰寫 LunarCalendar.js，目的要製作農曆。

LunarCalendar.js 依賴 astronomia 模組。用 solar.apparentVSOP87 得太陽的黃經黃緯，用 moonposition.position
得月亮的黃經黃緯，綜合兩者可算得24節氣日與朔望日，從而算出農曆。

地球的轉速有些微的擾動，轉得慢些一日就較長，因此日常我們用的時間並不均勻，加上長期而言變慢，推算天體運動需要使用均勻的時間如 TDT(Terrestrial Dynamical Time) 或 TDB(Barycentric Dynamical Time)，兩者相差非常微小。
日常我們用的時間是UT(Universal Time)，TD(TDT/TDB) 與 UT 的差距(DeltaT=TD-UT)靠觀察得知，差距有時高達兩分鐘。

TD, UT 分別對應於 JDE, JD。
JDE, JD 皆以西元前4713年1月1日格林威治中午12:00為原點，單位為日。

```{node}
// meeus 2009 p.79 2002 deltaT = 64.3, deltaT = JDE -JD
let date = new Date(2002,0,1)
let diff = julian.DateToJDE(date) - julian.DateToJD(date)
console.log(julian.DateToJDE(date), julian.DateToJD(date), diff*86400)
```

[MDN Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
提到：Date constructor with string is not encouraged due to browser differences and inconsistencies.

```{node}
let date = new Date('2000-01-01T00:00:00Z')
let date1 = new Date(Date.UTC(2000,0,1))
console.log(`new Date('2000-01-01T00:00:00Z')=${new Date('2000-01-01T00:00:00Z').toUTCString()}\nnew Date(Date.UTC(2000,0,1))=${new Date(Date.UTC(2000,0,1)).toUTCString()}`)
```

[Horizons](https://ssd.jpl.nasa.gov/horizons.cgi) 可查許多資料，抱括太陽到地心的黃經資料。下面設定可查在 2020-9-22 13:30 到 2020-9-22 13:31 期間(每秒一筆)太陽的黃經黃緯。

```{data}}
Ephemeris Type [change] : OBSERVER
Target Body [change] : Sun [Sol] [10]
Observer Location [change] : Geocentric [500]
Time Span [change] : Start=2020-9-22 13:30, Stop=2020-9-22 13:31, Intervals=60
Table Settings [change] :  QUANTITIES=1,2,31
Display/Output [change] :  default (formatted HTML)
```

用下面的片段城市，計算2020年的中氣，與中央氣象局的資料完全相符

```{node}
for (let i=0; i<12; i++){
    console.log(julian.JDEToDate(solstice.longitude(2020, earth, i* Math.PI/6)))
}
```
