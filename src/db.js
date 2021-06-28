
import Vue from 'vue'
import VueIdb from 'vue-idb'

Vue.use(VueIdb)

export default new VueIdb({
  version: 1,
  database: 'mais-precoce',
  schemas: [
    {simulation: 'code, updated, isSystem, featured, name, _create, _update, active,[active+isSystem] ,[featured+active], [biome+technology+phase]'},
    {biomes: 'id, name'},
    {phase: 'id, name'},
    {proccess: 'id, name'},
    {product: 'id, name'},
    {program: 'id, name'},
    {resource: 'id, name'},
    {technology: 'id, name'}
  ]
})
