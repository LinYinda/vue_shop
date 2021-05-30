import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
axios.defaults.baseURL = 'http://106.53.73.30:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http =axios;

//导入全局样式表
import './assets/css/global.css'

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable);
Vue.use(VueQuillEditor);

//定义格式化时间的过滤器
Vue.filter('dataFormat',function(originVal){
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  //月份0开始，且padstart为不足2位时用0填充
  const m = (dt.getMonth()+1+'').padStart(2,'0');
  const d = (dt.getDate()+'').padStart(2,'0');

  const hh=(dt.getHours()+'').padStart(2,'0');
  const mm=(dt.getMinutes()+'').padStart(2,'0');
  const ss=(dt.getSeconds()+'').padStart(2,'0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
