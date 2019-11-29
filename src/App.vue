<template>
  <div id="app">
<!--    <HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <nav-bar></nav-bar>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import navBar from './components/navbar'

export default {
  name: 'app',
  components: {
    navBar
  }
}
</script>

<style>
  html,body{
    width:100%;
    height:100%;
  }
  body{
    margin:0;
    padding:0;
    background: url("../public/allbg.jpg") no-repeat top center;
    background-size: 100% 100%;
    overflow: hidden;
  }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width:100%;
  height:100%;
}
</style>
