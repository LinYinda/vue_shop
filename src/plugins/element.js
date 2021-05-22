import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Message,
  Input
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//使用挂载，$message可以随便改
Vue.prototype.$message = Message;
