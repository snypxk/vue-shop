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
// 把axios 挂载到 Vue的原型对象上,使每一个Vue组件都可以通过 this发送AJAX请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
