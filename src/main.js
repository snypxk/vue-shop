import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global css
import './assets/css/global.css'
// 导入第三方字体图标
import './assets/fonts/iconfont.css'
// 导入 vue-table-with-tree-grid 在Cate.vue中使用
import TreeTable from 'vue-table-with-tree-grid'
// 导入 富文本编辑器 [运行依赖: vue-quill-editor]
import VueQuillEditor from 'vue-quill-editor'
// 导入 富文本编辑器 的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

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

// 注册全局组件: 第三方插件的组件: vue-table-with-tree-grid
Vue.component('tree-table', TreeTable)
// 将'富文本编辑器'注册为全局可用的组件
Vue.use(VueQuillEditor)

// 注册全局过滤器
/* ===== 时间过滤器 ===== */
/* 使用方式: 日期时间值 | dataFormat */
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  /* 
  ES2017 引入了字符串补全长度的功能. 如果某个字符串不够指定长度, 会在头部或尾部补全.
  两个参数:
    第一个参数用来指定字符串[是指补全了字符串后]的最小长度,
      [如果原字符串的长度，等于或大于指定的最小长度，则返回原字符串]
      [如果用来补全的字符串与原字符串，两者的长度之和超过了指定的最小长度，则会截去超出位数的补全字符串]
    第二个参数是用来补全的字符串.
      [如果省略第二个参数，默认使用'空格'补全长度]
  padStart():用于头部补全.  
  padEnd():  用于尾部补全.
  eg: 
    'loveyou'.padStart(5, 'ABC') => loveyou
    'loveyou'.padStart(10, 'ABC') => ABCloveyou
    'loveyou'.padStart(15, 'ABC') => ABCABCABloveyou
  */
  // 月份加 1的原因是: getMonth()的值定义是: 0-11
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  // 返回的时间格式是: yyyy-mm-dd hh:mm:ss
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
