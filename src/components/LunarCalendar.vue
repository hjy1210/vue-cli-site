<template>
  <div>
    <h2>Calendar</h2>
    年度：<input v-model.number="year" type="number" >
    <button v-on:click="getSeason">Get Season data</button>
    <table>
      <thead>
        <th> 節氣 </th>
        <th>時刻</th>
      </thead>
     <tr v-for="(term, index) in terms" v-bind:key="index">
        <td>{{term.name}}</td>
        <td>{{term.date}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  import { jieqi, shuoWang } from "./LunarCalendar.js";
  export default {
    name: 'calender',
    data() {
      return {
        year:2019,
        terms:[],
        ones:[]
      }
    },
    computed: {},
    mounted() {
      this.getSeason()
    },
    methods: {
      getSeason: function(){
        let terms = jieqi(this.year)
        let ones = shuoWang(this.year).filter(one=>one.name=="初一")
        this.terms = terms.concat(ones).sort((x,y)=>x.date-y.date)
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