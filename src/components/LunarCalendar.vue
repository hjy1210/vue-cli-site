<template>
  <div>
    <h2>Calendar</h2>
    西元年度：<input v-model.number="year" type="number" >
    <button v-on:click="getSeason">計算</button><span>{{message}}</span>
    
    <table v-if="calendar.length > 0">
      <thead>
        <th>節氣/陰曆 </th>
        <th>日期</th>
      </thead>
     <tr v-for="(term, index) in calendar" v-bind:key="index">
        <td>{{term.names.join(",")}}:{{term.leap?"潤":""}}{{term.month}}/{{term.day}} </td>
        <td>{{term.date.getFullYear()}}/{{term.date.getMonth()+1}}/{{term.date.getDate()}}</td>
      </tr>
    </table>
    <table v-if="terms.length > 0">
      <thead>
        <th>節氣</th>
        <th>時刻</th>
      </thead>
     <tr v-for="(term, index) in terms" v-bind:key="index">
        <td>{{term.name}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
    <table v-if="shuoWangs.length > 0">
      <thead>
        <th>朔望</th>
        <th>時刻</th>
      </thead>
     <tr v-for="(term, index) in shuoWangs" v-bind:key="index">
        <td>{{term.name}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
    <table v-if="eclipses.length > 0">
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
  import { createLunarCalendar } from "./LunarCalendar.js";
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
        message:"按計算鍵開始計算日曆，約需10秒(桌上型瀏覽器)"
      }
    },
    computed: {},
    mounted() {
      //this.getSeason()
    },
    methods: {
      getSeason: async function(){
        //let terms = jieqi(this.year)
        //let ones = shuoWang(this.year).filter(one=>one.name=="初一")
        //this.terms = terms.concat(ones).sort((x,y)=>x.date-y.date)
        this.message=`計算中`
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
            result = await Eclipse(begin,end,eclipseMap.solar)
          } else {
            this.message=`計算 ${this.shuoWangs[i].date} 是否發生月蝕`
            result = await Eclipse(begin,end,eclipseMap.moon)
          }
          if (result.length==1 && result[0].status=="正常")
            result = []
          if (result.length >0)
            eclipses = eclipses.concat(result)
          //console.log(eclipses)
        }
        this.eclipses = eclipses
        this.message = "按計算鍵開始計算日曆，約需10秒(桌上型瀏覽器)"
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>