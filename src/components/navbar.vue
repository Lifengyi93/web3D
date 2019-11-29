<template>
  <div class="navbar">
    <ul id="main">
      <li><router-link  to="/" >加载模型</router-link></li>
      <li><router-link  to="/outLine">模型描边</router-link></li>
      <li><router-link  to="/interact">模型交互</router-link></li>

    </ul>

    <!-- 路由匹配到的组件将显示在这里 -->
    <router-view></router-view>
  </div>
</template>

<script>

</script>

<style>
  .navbar{
    width:100%;
    height:100%;
  }
  #main{
    margin:0;
    height:60px;
    background: rgba(0,0,0,0.5);
  }
  #main li{
    list-style: none;
    float:left;
    height:60px;
    padding:0 20px;
    line-height:60px;
  }

  #main li a{
    color:#fff;
    display: inline-block;
    width:100%;
    text-decoration: none;
  }
</style>