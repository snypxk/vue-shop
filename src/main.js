import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global css
import './assets/css/global.css'
// 导入第三方字体图标
import './assets/fonts/iconfont.css'

// 导入 axios 发送AJAX请求
import axios from 'axios'
// 配置基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 给 axios 设置请求拦截器: 
/* 
  每一个请求都先经过该拦截器, 通过axios请求拦截器添加token, 保证拥有获取数据的权限
  原因: 
    在<<电商管理管理后台API接口文档>>中明确提出:
    需要授权的 API, 必须在请求头中使用 Authorization 字段提供 token 令牌.
*/
axios.interceptors.request.use(config => {
  // 为请求头对象，添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 把axios 挂载到 Vue的原型对象上,使每一个Vue组件都可以通过 this发送AJAX请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
