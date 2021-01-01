<template>
  <div>
    <h3>陰陽合曆</h3>
    西元年度：<input v-model.number="year" type="number"  style="width:60px;">
    <button v-on:click="getSeasonWrap" style="font-size:20pt">計算</button><span>{{message}}</span>
    <section>
      <div v-for= "(month,index) in monthTables" v-bind:key="index">
      <table style="margin:20px">
        <tr><td colspan="7" style="text-align:center;">{{year}}年{{index+1}}&nbsp;&nbsp;&nbsp;月</td></tr>
        <tr  style="background-color:#dddddd">
          <td style="text-align:center;">日</td>
          <td style="text-align:center;">一</td>
          <td style="text-align:center;">二</td>
          <td style="text-align:center;">三</td>
          <td style="text-align:center;">四</td>
          <td style="text-align:center;">五</td>
          <td style="text-align:center;">六</td>
        </tr>
        <tr v-for="(week, index2) in month"  v-bind:key="index2">
          <td v-for="(day, index3) in week"  v-bind:key="index3">
            <div style="text-align:center; width:50px">{{getTwoRows(day)[0]}}</div>
            <div style="text-align:center; width:50px">{{getTwoRows(day)[1]}}</div>
          </td>
        </tr>
      </table>
    </div>
    </section>
    <!--<table v-if="calendar.length > 0">
      <thead>
        <th>節氣/陰曆 </th>
        <th>日期</th>
      </thead>
      <tr v-for="(term, index) in calendar" v-bind:key="index">
        <td><div>{{getTwoRows(term)[0]}}</div><div>{{getTwoRows(term)[1]}}</div></td><td>{{term.date.getMonth()+1}}/{{term.date.getDate()}}</td>
      </tr>
    </table>-->
    <table style="margin:20px" v-if="terms.length > 0">
      <thead>
        <th>節氣</th>
        <th>時刻</th>
      </thead>
     <tr v-for="(term, index) in terms" v-bind:key="index">
        <td>{{term.name}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
    <table style="margin:20px" v-if="shuoWangs.length > 0">
      <thead>
        <th>朔望</th>
        <th>時刻</th>
      </thead>
     <tr v-for="(term, index) in shuoWangs" v-bind:key="index">
        <td>{{term.name}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
    <table style="margin:20px" v-if="eclipses.length > 0">
      <thead>
        <th>蝕況</th>
        <th>起始時刻</th>
      </thead>
     <tr v-for="(term, index) in eclipses" v-bind:key="index">
        <td>{{term.status}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  //import { jieqi, shuoWang, createLunarCalendar } from "./LunarCalendar.js";
  import { createLunarCalendar, getTwoRows } from "./LunarCalendar.js";
  import { Eclipse, eclipseMap, julian } from "./eclipse.js";
  export default {
    name: 'calender',
    data() {
      return {
        year:2020,
        terms:[],
        shuoWangs:[],
        mixedTerms:[],
        calendar:[],
        eclipses:[],
        message:"按計算鍵開始計算日曆，桌上型瀏覽器約需10秒，手機約需30秒",
        monthTables:[]
      }
    },
    computed: {},
    mounted() {
      //this.getSeason()
    },
    methods: {
      getSeasonWrap: function(){
        this.message=`計算中........`
        setTimeout(this.getSeason,0)
      },
      getSeason: async function(){
        //let terms = jieqi(this.year)
        //let ones = shuoWang(this.year).filter(one=>one.name=="初一")
        //this.terms = terms.concat(ones).sort((x,y)=>x.date-y.date)
        //this.message=`計算中`
        //console.log(this.message)
        let calendarData= createLunarCalendar(this.year)
        this.terms =  calendarData.terms //jieqi(this.year) 
        this.shuoWangs = calendarData.shuoWangs //shuoWang(this.year)
        this.mixedTerms = calendarData.mixedTerms
        this.calendar = calendarData.calendar
        let eclipses=[]
        for (let i=0;i< this.shuoWangs.length; i++){
          let jde = julian.DateToJDE(this.shuoWangs[i].date)
          let begin = julian.JDEToDate(jde - 0.5)
          let end = julian.JDEToDate(jde + 0.5)
          //console.log(begin,end)
          let result=[]
          if (this.shuoWangs[i].name=="初一"){
            this.message=`計算 ${this.shuoWangs[i].date} 是否發生日蝕`
            console.log(this.message)
            result = await Eclipse(begin,end,eclipseMap.solar)
          } else {
            this.message=`計算 ${this.shuoWangs[i].date} 是否發生月蝕`
            console.log(this.message)
            result = await Eclipse(begin,end,eclipseMap.moon)
          }
          if (result.length==1 && result[0].status=="正常")
            result = []
          if (result.length >0)
            eclipses = eclipses.concat(result)
          //console.log(eclipses)
        }
        this.eclipses = eclipses
        this.message = "按計算鍵開始計算日曆，桌上型瀏覽器約需10秒，手機約需30秒"
        this.monthTables = this.constructMonthTable()
        console.log(this.monthTables)
      },
      getTwoRows: function (term){
        if (term)
          return getTwoRows(term)
        else 
          return ["",""]
      },
      constructMonthTable: function(){
        let monthTables = []
        for (let m=0;m<12;m++){
          let monthRows = []
          let monthArray = this.calendar.filter(term=> term.date.getMonth()==m)
          let dataArray=[]
          let startWeekDay = monthArray[0].date.getDay()
          for (let i=0;i<startWeekDay; i++)
            dataArray.push(null)
          dataArray = dataArray.concat(monthArray)
          let rows = Math.floor(dataArray.length / 7)
          if (dataArray.length % 7 != 0)
            rows = rows + 1;
          for (let i=0;i<rows;i++){
            monthRows.push(dataArray.slice(i*7,i*7+7))
          }
          console.log(monthRows.length)
          monthTables.push(monthRows)
        }
        return monthTables;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
section {
  display: flex;
  flex-wrap: wrap;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
}

td, th {
  border: 1px solid #000000;
  text-align: left;
  padding: 8px;
}

</style>