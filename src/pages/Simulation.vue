<template>
  <v-app light>
    <v-navigation-drawer app clipped fixed v-model="sidebar">
      <p class="text-xs-center hidden-md-and-up mt-4">

        <img
          :src="this.$webp? '/static/img/logo.webp' : '/static/img/logo.png' "
          alt="Logo da Embrapa"
          style="width: 60%;"
        >
      </p>

      <user-wrapper class="my-3 hidden-md-and-up"></user-wrapper>

      <menu-wrapper :synchronized="lastSync" @clicked="menu"></menu-wrapper>

      <p class="text-xs-center hidden-md-and-up">
        <img alt="Logo da Embrapa" src="../assets/embrapa.webp" style="width: 50%;" v-if="this.$webp">
        <img alt="Logo da Embrapa" src="../assets/embrapa.png" style="width: 50%;" v-else>
      </p>

      <p class="text-xs-center hidden-sm-and-down" style="position: absolute; bottom: 0;">
        <img alt="Logo da Embrapa" src="../assets/embrapa.webp" style="width: 60%;" v-if="this.$webp">
        <img alt="Logo da Embrapa" src="../assets/embrapa.png" style="width: 60%;" v-else>
      </p>
    </v-navigation-drawer>

    <v-toolbar app clipped-left fixed prominent>
      <v-toolbar-side-icon @click.stop="sidebar = !sidebar" light></v-toolbar-side-icon>
      <img
        :src="this.$webp? '/static/img/logo.webp' : '/static/img/logo.png' "
        alt="Logo da Embrapa"
        class="ml-2"
        style="width: 150px;"
      >

      <v-spacer></v-spacer>

      <v-btn @click="openSearch" class="mr-3 hidden-sm-and-down" color="purple" outline>
        <v-icon left>search</v-icon>Pesquisar
      </v-btn>

      <v-btn
        @click="sync()"
        class="mr-3 ml-0 hidden-sm-and-down"
        color="indigo"
        outline
        v-if="user && user.authenticated"
      >
        <v-icon left>sync</v-icon>Sincronizar
      </v-btn>

      <v-btn @click="favourites()" class="mr-3 ml-0 hidden-sm-and-down" color="orange" outline>
        <v-icon left v-if="starred">star</v-icon>
        <v-icon left v-if="!starred">star_border</v-icon>Favoritos
      </v-btn>

      <v-btn @click="openSearch" class="hidden-md-and-up" icon>
        <v-icon>search</v-icon>
      </v-btn>

      <v-btn @click="favourites()" class="hidden-md-and-up" icon>
        <v-icon v-if="starred">star</v-icon>
        <v-icon v-if="!starred">star_border</v-icon>
      </v-btn>

      <div class="d-flex align-center" style="margin-left: auto">
        <user-wrapper class="hidden-sm-and-down"></user-wrapper>
      </div>
    </v-toolbar>

    <v-content>
      <v-container fluid grid-list-lg>
        <search-form ref="search" v-on:buscar="goSearch"></search-form>

        <v-layout row wrap>
          <v-flex :key="s['code']" class="px-2" lg6 md6 sm12 v-for="s in simulations" xl4 xs12>
            <v-card class="pb-2">
              <v-card-title primary-title>
                <v-layout row>
                  <div
                    class="subheading"
                    style="max-width:80%"
                  >{{ s.name.length > 60 ? s.name.slice(0,60) + '...' : s.name }}</div>
                  <v-spacer></v-spacer>
                  <v-btn class="ma-0" flat icon style="cursor: default;" v-if="s.isSystem !== 1">
                    <v-icon color="gray" disabled v-if="lastSync < s._update">cloud_upload</v-icon>
                    <v-icon color="green" v-else>cloud_done</v-icon>
                  </v-btn>
                  <v-btn @click="favourite(s)" class="ma-0" icon v-if="s.isSystem === 0">
                    <v-icon color="orange">{{ s.featured === 1 ? 'star' : 'star_border' }}</v-icon>
                  </v-btn>
                  <v-btn class="ma-0" disabled icon slot="activator" v-if="s.isSystem === 1">
                    <v-icon color="grey lighten-1" dark>lock</v-icon>
                  </v-btn>
                </v-layout>
              </v-card-title>
              <v-card-text>
                Bioma:
                <strong :key="index" v-for="(bi, index) in s.biome">{{ bi || 'N/A' }}</strong> -
                Editada em
                <strong>{{ s._update | formatDate }}</strong>.
              </v-card-text>

              <v-card-actions class="px-2">
                <v-layout row wrap>
                  <v-flex sm3 xs6>
                    <v-btn
                      :disabled="s.isSystem === 1"
                      to="/tree"
                      block
                      class="white--text"
                      color="yellow darken-3"
                      large
                      style="min-width: 50px;"
                    >
                      <v-icon dark>send</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex sm3 xs6>
                    <v-btn
                      :disabled="s.isSystem === 1"
                      @click="edit(s)"
                      block
                      class="white--text"
                      color="light-blue darken-3"
                      large
                      style="min-width: 50px;"
                    >
                      <v-icon dark>edit</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex sm3 xs6>
                    <v-btn
                      @click="copy(s)"
                      block
                      class="white--text"
                      color="deep-purple darken-3"
                      large
                      style="min-width: 50px;"
                    >
                      <v-icon dark>content_copy</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex sm3 xs6>
                    <v-btn
                      :disabled="s.isSystem === 1"
                      @click="remove(s)"
                      block
                      class="white--text"
                      color="red darken-3"
                      large
                      style="min-width: 50px;"
                    >
                      <v-icon dark>delete</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>

        <confirm-wrapper ref="confirm"/>

        <message-wrapper ref="message"/>

        <v-dialog max-width="300px" persistent v-model="waitToReport">
          <v-card>
            <v-card-text style="text-align: center;">
              <v-progress-circular :rotate="360" :size="60" color="teal" indeterminate></v-progress-circular>
            </v-card-text>
            <h3 style="text-align: center;">Por favor, aguarde!</h3>

          </v-card>
        </v-dialog>

        <v-dialog max-width="300px" persistent v-model="wait">
          <v-card>
            <v-card-text style="text-align: center;">
              <v-progress-circular :rotate="360" :size="60" color="teal" indeterminate></v-progress-circular>
            </v-card-text>
            <h3 style="text-align: center;">Sincronizando... por favor, aguarde!</h3>

          </v-card>
        </v-dialog>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import manifest from '../../static/manifest.json'

import moment from 'moment'
import {
  uuid
} from 'vue-idb'
import mobile from 'mobile-device-detect'
import UserWrapper from '../components/User.vue'
import MenuWrapper from '../components/Menu.vue'
import ConfirmWrapper from '../components/Confirm.vue'
import MessageWrapper from '../components/Message.vue'
import SearchForm from '../components/SearchForm.vue'
import timestamp from 'unix-timestamp'

var ws = require('../library/services.js')

export default {
  components: {
    MenuWrapper,
    UserWrapper,
    ConfirmWrapper,
    MessageWrapper,
    SearchForm
  },
  mixins: [
    ws
  ],
  data () {
    return {
      waitToReport: false,
      lastSync: null,
      mobile: mobile,
      uuid: null,
      starred: false,
      manifest: manifest,
      sidebar: false,
      wait: false,
      fromLogin: false,
      dialogs: {
        create: false,
        delete: false
      },
      valid: false,
      user: null,
      search: {
        display: false,
        text: '',
        checkbox: []
      },
      simulations: null,
      name: '',
      type: ''
    }
  },
  beforeMount () {
    this.user = this.$localStorage.get('user')
  },
  mounted () {
    var sy = this.$localStorage.get('alwaysSync')
    this.lastSync = this.$localStorage.get('synchronized')
    var self = this

    if (this.$route.params.code !== undefined && this.$route.query.toReport) { // caso esteja vindo de uma tela de edicao de simulacoes
      var p = new Promise((resolve, reject) => {
        self.sync(resolve)
      })
      p.then(resolve => {
        self.$router.push({
          path: '/reports' + self.$route.params.code, query: { online: true }
        })
      }).catch(rej => {
        this.refresh()
      })
    } else if (sy) {
      try {
        this.sync()
      } catch (error) {
        this.refresh()
      }
    } else if (this.lastSync === 0) {
      this.sync()
    } else {
      this.refresh()
    }
  },
  methods: {
    goSearch () {
      var self = this
      var p = new Promise((resolve, reject) => {
        this.$db.simulation
          .where('active').equals(1)
          .reverse().sortBy('_create')
          .then(simulations => {
            this.simulations = simulations

            resolve()
          })
      })

      p.then(resolve => {
        var simulacoesFiltradas = []
        var busca = this.$refs.search.busca

        if (!busca.active) return

        self.simulations.forEach(sim => {
          let similarityOfNames = ws.default.methods.similarity(sim.name, busca.name)

          sim.name = ws.default.methods.removeAccents(sim.name)

          busca.name = ws.default.methods.removeAccents(busca.name)

          let upper = sim.name.toUpperCase().includes(busca.name.toUpperCase())

          if (!sim.isSystem && busca.simulations.indexOf(0) === -1) {
            return
          } else if (sim.isSystem && busca.simulations.indexOf(1) === -1) {
            return
          } else if (sim.size === '_SMALL_' && busca.size.indexOf(0) === -1) {
            return
          } else if (sim.size === '_MEDIU_' && busca.size.indexOf(1) === -1) {
            return
          } else if (sim.size === '_LARGE_' && busca.size.indexOf(2) === -1) {
            return
          }

          let biome
          let technology
          let program
          let product
          let phase

          if (busca.biome) {
            sim.biome.forEach(bio => {
              biome = busca.biome.indexOf(bio)
            })
          }

          if (busca.technology) {
            sim.technology.forEach(tech => {
              technology = busca.technology.indexOf(tech)
            })
          }

          if (busca.program) {
            sim.program.forEach(prog => {
              program = busca.program.indexOf(prog)
            })
          }

          if (busca.product) {
            sim.product.forEach(prod => {
              product = busca.product.indexOf(prod)
            })
          }

          phase = busca.phase.filter(value => sim.phase.indexOf(value) !== -1)

          if (similarityOfNames > 0.3 || upper || sim.name === '') {
            if
            ((biome !== -1 || !busca.biome) && (technology !== -1 || !busca.technology) && (program !== -1 || !busca.program) && (product !== -1 || !busca.product) &&
              phase.length > 0) {
              simulacoesFiltradas.push(sim)
            }
          }
        })

        if (simulacoesFiltradas.length === 0) {
          self.$refs.message.open('Nenhuma simulação encontrada', 'error')
          return
        }

        self.simulations = simulacoesFiltradas
        return self.simulations
      })
    },
    favourite (card) {
      card.featured = card.featured === 1 ? 0 : 1
      this.$db.simulation.where('code').equals(card.code).modify({
        featured: card.featured
      })
    },
    favourites () {
      this.starred = !this.starred
      this.refresh()
    },
    openSearch () {
      // nao esquecer de colocar o ref no elemento html
      this.$refs.search.open()
    },
    refresh (callback) {
      this.simulations = null

      // metodo chamado apenas pela funcao sync e pelo metodo que favourite
      this.dialogs.create = false

      if (this.starred) {
        this.$db.simulation
          .where('[featured+active]').equals([1, 1])
          .reverse().sortBy('_create')
          .then(simulations => {
            this.simulations = simulations
          })
      } else {
        this.$db.simulation
          .where('active').equals(1)
          .reverse().sortBy('_create')
          .then(simulations => {
            this.simulations = simulations
          })
      }

      if (callback) {
        callback()
      }
    },
    menu (choose) {
      console.log('Menu option choosed: ' + choose)

      switch (choose) {
        case 'Sincronizar':
          this.sidebar = false

          this.sync()

          break

        case 'Configurações':
          this.sidebar = false

          this.$router.push({
            path: '/settings'
          })

          break

        case 'Sobre':
          this.sidebar = false

          this.$router.push({
            path: '/about'
          })

          break
      }
    },
    sync (callback) {
      this.wait = true
      var self = this
      this.lastSync = this.$localStorage.get('synchronized')

      var err = function (error) {
        self.$root.$data.trySync = false
        self.wait = false

        console.log(error)
        self.$refs.message.open('Atenção! Erro ao tentar sincronizar. Por favor, tente novamente mais tarde.', 'error')
        self.refresh()
      }
      var now = Math.floor(timestamp.now())

      console.log('#1 - Trying to connect in remote server.')
      var status = ws.default.methods.getStatus()
      status.then(response => {
        console.log('lastsync:' + this.lastSync)
        self.$db.simulation
          .where('_update').above(self.lastSync).toArray()
          .then(sim => {
            if (sim.length > 0) {
              console.log('Enviando ' + sim.length + ' simulacoes para o servidor')
              // envio todas as simulacoes atualizadas p cima
              ws.default.methods.put(sim)
            }
            if (self.lastSync > 0) {
              // caso lastSync seja === 0
              // nao ha necessidade de chamar o metodo de remocao pois o metodo saveSimulationsOnDB
              // nao persiste as simulacoes nao ativas, caso essas sejam retornadas pelo servidor
              ws.default.methods.removeNonActiveSimulations(self.$db.simulation)
              // remove non active simulations
            }
            var simulation = ws.default.methods.call('/simulation/all/' + self.lastSync)
            simulation.then(response => {
              self.$localStorage.set('synchronized', now)
              self.lastSync = now
              ws.default.methods.saveSimulationsOnDB(self.$db.simulation, response, now)

              self.refresh()
              self.synchronized = now
              this.wait = false
              if (callback) {
                callback()
              }
            })
          })
      }).catch(err)
    },
    report (simulation) {
      this.waitToReport = true
      var self = this
      let online = ws.default.methods.getStatus()

      // ws.default.methods.send(simulation) // send para teste do novo backend

      online.then(resolve => {
        console.log('ESTOU ONLINE')
        // caso a simulacao esteja desatualizada no servidor
        // ou seja nova simulacao
        if (simulation._create === simulation._update || this.lastSync < simulation._update) {
          let p = new Promise((resolve, reject) => {
            self.waitToReport = false
            self.sync(resolve)
          })
          p.then(resolve => {
            self.$router.push({
              path: '/reports' + simulation.code, query: { online: true }
            })
          })
            .catch(rej => {
              this.$refs.message.open('Servidor indisponível, verifique sua conexão com a internet', 'error')
            })
        } else {
          self.waitToReport = false
          self.$router.push({
            path: '/reports' + simulation.code, query: { online: true }
          })
        }
      }).catch(reject => {
        console.log('ESTOU OFFLINE')
        self.waitToReport = false
        if (simulation.runned && this.lastSync >= simulation._update) { // report da simulation ja foi cacheada
          self.$router.push({
            path: '/reports' + simulation.code, query: { online: false }
          })
        } else {
          this.$refs.message.open('Servidor indisponível, verifique sua conexão com a internet', 'error')
        }
      })
    },
    edit (simulation) {
      simulation._update = Math.floor(timestamp.now())

      this.$router.push({
        path: '/edit' + simulation.code
      })
    },
    copy (simulation) {
      var now = Math.floor(timestamp.now())
      this.$refs.confirm.open(
        'Copiar Simulação',
        'Tem certeza de que deseja duplicar a simulação "' + simulation.name + '"?', {
          color: 'deep-purple darken-3'
        }).then((confirm) => {
          if (confirm) {
            const newSimulation = { ...simulation } // duplicando objeto

            newSimulation.code = uuid()
            newSimulation.name = 'Cópia de ' + simulation.name
            newSimulation.params = simulation.params

            newSimulation._create = now
            newSimulation._update = now
            newSimulation.active = 1
            newSimulation.isSystem = 0
            newSimulation.featured = 0

            this.$db.simulation
              .add(newSimulation)
              .then(() => this.$router.push({ path: '/edit' + newSimulation.code
              }))
          }
        })
    },
    remove (simulation) {
      this.$refs.confirm.open(
        'Apagar Simulação',
        'Tem certeza de que deseja apagar a simulação "' + simulation.name + '"? Esta ação é irreversível!', {
          color: 'red'
        }).then((confirm) => {
          if (confirm) {
            let index = this.simulations.indexOf(simulation)
            this.simulations.splice(index, 1)

            simulation.active = 0
            simulation._update = Math.floor(timestamp.now())

            this.$db.simulation.where('code')
              .equals(simulation.code)
              .modify(simulation)
              .then(() => {
                this.$refs.message.open('Simulação apagada com sucesso!', 'success')
              })
          }
        })
    }
  },
  filters: {
    formatDate: function (value) {
      if (!value) return ''

      return moment(value * 1000).format('D/M/YYYY')
    }
  }
}
</script>

