import Vue from 'vue'
import Router from 'vue-router'
import VueAnalytics from 'vue-analytics'

var settings = require('../settings/' + process.env.NODE_ENV + '.json')

const options = [
  { path: '/', component: 'Login', name: 'Login', props: false },
  { path: '/tree', component: 'Tree', name: 'tree', props: true },
  {
    path: '/simulation/:code',
    component: 'Simulation',
    name: 'Simulaçōes',
    props: true
  },
  {
    path: '/simulation',
    component: 'Simulation',
    name: 'Simulaçōes',
    props: false
  },
  {
    path: '/reports:simulationCode',
    component: 'Report',
    name: 'Relatórios',
    props: false
  },
  {
    path: '/settings',
    component: 'Settings',
    name: 'Configurações',
    props: false
  },
  { path: '/about', component: 'About', name: 'Sobre', props: false },
  {
    path: '*',
    component: 'Error',
    name: 'Página não encontrada',
    props: false
  },
  // { path: '/natural-mount', component: 'TypeNaturalMount', name: 'Monta Natural', props: true },
  { path: '/edit:code', component: 'EditSimulation', name: 'es', props: true }
  // { path: '/iatf-rt', component: 'TypeIATFRT', name: 'IATF + RT', props: true },
  // { path: '/2-iatf-rt', component: 'Type2IATFRT', name: '2 IATF + RT', props: true }
]

Vue.use(Router)

const routes = options.map(route => {
  return {
    path: route.path,
    component: () => import(`@/pages/${route.component}.vue`),
    name: route.name,
    props: route.props
  }
})

const router = new Router({
  mode: 'history',
  routes
})

Vue.use(VueAnalytics, {
  id: settings.analytics,
  checkDuplicatedScript: true,
  debug: {
    sendHitTask: process.env.NODE_ENV === 'production'
  },
  router
})

export default router
