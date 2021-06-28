import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import App from './App'
import router from './router'
import GSignInButton from 'vue-google-signin-button'
import FBSignInButton from 'vue-facebook-signin-button'
import VueIdb from 'vue-idb'
import Airbrake from 'airbrake-js'
var settings = require('./settings/' + process.env.NODE_ENV + '.json')
import VueNumeric from 'vue-numeric'
import VueWebP from 'v-webp'
import icons from 'material-design-icons-iconfont'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

Vue.use(VueSweetalert2)
Vue.use(VueNumeric)
Vue.use(icons)
Vue.use(VueWebP)
Vue.use(VueIdb)
Vue.use(FBSignInButton)
Vue.use(GSignInButton)
Vue.use(Vuetify)
Vue.config.productionTip = false

import storage from 'vue-localstorage'

Vue.use(storage)
Vue.use(storage, {
  name: 'ls',
  bind: true
})

var errbit = new Airbrake({
  projectId: 1,
  projectKey: settings.tracking.key,
  host: settings.tracking.host,
  environment: process.env.NODE_ENV
})

Vue.prototype.$err = async function (error) {
  var pkg = require('../package.json')

  var params = {
    version: pkg.version
  }

  if (error !== null && typeof error === 'object') {
    if (
      error.response !== null &&
      typeof error.response !== 'undefined' &&
      error.response.data !== null &&
      typeof error.response.data !== 'undefined'
    ) {
      params.info = error.response.data
    }

    if (error.name !== null && typeof error.name !== 'undefined') {
      params.name = error.name
    }
  }

  await errbit.notify({
    error: error,
    params
  })
}

/* eslint-disable no-unused-vars */
import db from './db'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  data: {
    trySync: true
  }
})
