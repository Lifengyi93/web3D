import Vue from 'vue'
import Router from 'vue-router'

//组件模块
import HelloWorld from '@/components/HelloWorld'
import outLine from '@/components/outLine'
import Interact from '@/components/interact'

Vue.use(Router)

export default new Router({
  routes:[
    {path:'/',name:'HelloWorld',component:HelloWorld},
    {path:'/outLine',name:'outLine',component:outLine},
    {path:'/interact',name:'interact',component:Interact}
  ]
})