import Vue from 'vue'
// element-ui 设置了按需导入,因此在页面中使用到哪些控件,则需要在这里导入对应的控件
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
