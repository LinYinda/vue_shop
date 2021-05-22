import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Message,
  Input,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  MenuItem,
  Submenu
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
//  使用挂载，$message可以随便改

Vue.prototype.$message = Message;
