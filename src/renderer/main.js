import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App'
import router from './router'
import store from './store'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faFolder,faArrowUp} from '@fortawesome/free-solid-svg-icons'
import {} from '@fortawesome/free-regular-svg-icons'

import {faFile} from '@fortawesome/pro-light-svg-icons'

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
library.add(faFolder,faFile,faArrowUp)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(ElementUI);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
