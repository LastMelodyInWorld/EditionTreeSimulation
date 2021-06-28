<template>
  <v-app light>
    <v-toolbar tabs>
      <v-toolbar-side-icon @click.native="cancel">
        <v-icon>arrow_back</v-icon>
      </v-toolbar-side-icon>
      <v-toolbar-title v-text="$route.name"></v-toolbar-title>

      <v-tabs color="transparent" show-arrows slot="extension" v-model="tab">
        <v-tabs-slider color="black"></v-tabs-slider>

        <v-tab :key="index" v-for="(si, index) in this.resultOfSimulation[0]">
          <div @click="this.step = index" style="font-size:90%">{{ si.name }}</div>
        </v-tab>
      </v-tabs>

      <v-spacer></v-spacer>
      <v-btn @click="info" icon>
        <v-icon>info</v-icon>
      </v-btn>

      <v-btn @click="dialog = true" icon v-if="simulations.length > 0">
        <v-icon>queue</v-icon>
      </v-btn>
    </v-toolbar>

    <v-tabs-items class="v-tabs-items" touchless v-model="tab">
      <v-tab-item :key="index" lazy v-for="(si, index) in this.dados">
        <v-text-field
          append-icon="search"
          class="mx-2"
          hide-details
          label="Pesquisar"
          single-line
          style="max-width: 400px;"
          v-model="search"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="si"
          :pagination.sync="pag"
          :search="search"
          hide-actions
          item-key="name"
        >
          <template slot="headerCell" slot-scope="props">
            <v-tooltip bottom>
              <span
                slot="activator"
                style="font-weight: bold; font-family: sans-serif; color: black; font-size: 13px"
              >{{ props.header.text.length > 20 ? props.header.text.slice(0, 17) + "..." : props.header.text }}</span>
              <span>{{ props.header.text }}</span>
            </v-tooltip>
          </template>

          <template slot="items" slot-scope="props">
            <tr>
              <td style="min-width:150px;">{{ props.item.name }}</td>
              <td
                :key="ind"
                style="max-width:150px;"
                v-for="(v, ind) in props.item.values"
              >{{ mascaraValor(v.toFixed(2)) }}</td>
            </tr>
          </template>
          <v-alert
            :value="true"
            color="error"
            icon="warning"
            slot="no-results"
          >Nenhum item com "{{ search }}" foi encontrado.</v-alert>
        </v-data-table>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog scrollable v-model="dialog" width="500">
      <v-card max-height="450">
        <v-card-title class="headline grey lighten-2" primary-title>Selecione uma simulação</v-card-title>
        <v-card-text style="text-align: justify;">
            <div v-for="(si, index) in simulations" :key="index">
              <v-checkbox class="ma-0" v-model="appendedSimulations" :label="si.name" :value="si.code"></v-checkbox>
            </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false" color="black" flat>Cancelar</v-btn>
          <v-btn @click="appendMultSimulation()" color="black" flat>Confirma</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <message-wrapper ref="message"/>

    <v-snackbar :multi-line="true" :timeout="0" :vertical="true" color="yellow darken-4" v-model="alertToConnect">
      <v-layout row>
        <p>As informações podem estar desatualizadas. Verifique sua conexão com a internet!</p>
        <v-btn @click="alertToConnect = false" dark flat>Fechar</v-btn>
      </v-layout>
    </v-snackbar>

    <v-dialog max-width="300px" persistent v-model="wait">
      <v-card>
        <v-card-text style="text-align: center;">
          <v-progress-circular :rotate="360" :size="60" color="teal" indeterminate></v-progress-circular>
        </v-card-text>
        <h3 style="text-align: center;">Carregando simulação</h3>
      </v-card>
    </v-dialog>

    <info ref="infoSimulation"></info>
  </v-app>
</template>

<script>
var ws = require('../library/services.js')
import Info from '../components/Info.vue'
import MessageWrapper from '../components/Message.vue'

export default {
  components: {
    Info, MessageWrapper
  },
  data () {
    return {
      simulationsToAppend: [],
      appendedSimulations: [],
      codeAppended: [],
      wait: false,
      alertToConnect: false,
      pag: {
        descending: false,
        page: 0,
        rowsPerPage: -1 // -1 for All
      },
      search: '',
      simulation: null,
      dialog: false,
      simulations: [],
      dados: null,
      mainSimulation: null,
      resultOfSimulation: [], // array que guarda todos os resultados das simulacoes
      headers: [{
        text: '',
        value: 'name',
        align: 'left',
        sortable: false,
        fixed: true,
        width: '20%'
      }],
      tab: 0
    }
  },
  mounted () {
    var self = this
    this.wait = true
    var lastSync = this.$localStorage.get('synchronized')

    this.$db.simulation.get(this.$route.params.simulationCode)
      .then(re => {
        self.mainSimulation = re
        self.updateHeaders(self.mainSimulation)

        if (self.mainSimulation.runned && !self.$route.query.online) {
          // exibir msg de alerta
          self.alertToConnect = true
          self.resultOfSimulation.push(self.mainSimulation.runned)
          self.preProcessing()
          self.wait = false
        } else {
          var sm = ws.default.methods.call('/simulation/run/' + this.$route.params.simulationCode)
          sm.then(res => {
            self.setAsRunned(res)
            self.resultOfSimulation.push(res)
            self.preProcessing()
            self.wait = false
          })
          .catch(rej => {
            self.$refs.message.open('Atenção! Falha ao realizar a simulação. Por favor, tente novamente mais tarde.', 'error')
            setTimeout(function () { self.$router.push({path: '/simulation'}) }, 4000)
          })
        }
      })

    self.$db.simulation
      .where(['active', 'isSystem']).equals([1, 0])
      .reverse().sortBy('_create')
      .then(simulations => {
        simulations.forEach(element => {
          if (element.code === this.$route.params.simulationCode || element._update > lastSync || !element.runned) {
            let index = simulations.indexOf(element)
            if (index > -1) {
              simulations.splice(index, 1)
            }
          }
        })

        self.simulations = simulations
      })

    return
  },
  methods: {
    info () {
      var self = this

      var p = new Promise((resolve, reject) => {
        // self.$refs.infoSimulation.resultSimulation = self.resultOfSimulation[0]
        self.$refs.infoSimulation.simulation = self.mainSimulation
        self.$db.simulation.get(this.mainSimulation.system)
          .then(system => {
            self.$refs.infoSimulation.systemName = system.name
            resolve()
          })
      })

      p.then(resolve => {
        self.$refs.infoSimulation.open()
      })
    },

    setAsRunned (runned) {
      let sim = this.$db.simulation.get(this.$route.params.simulationCode)
      sim.then(res => {
        res.runned = runned
        this.$db.simulation.put(res)
      })
    },
    mascaraValor (valor) {
      valor = valor.toString().replace(/\D/g, '')
      valor = valor.toString().replace(/(\d)(\d{8})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{5})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{2})$/, '$1,$2')
      return valor
    },

    removeFromCode (code) {
      var self = this
      this.$db.simulation.get(code).then(res => {
        let obj
        self.headers.forEach(el => {
          if (el.text === res.name) {
            obj = el
          }
        })
        let index = self.headers.indexOf(obj)
        this.dados.forEach(dados => {
          dados.forEach(sub => {
            sub.values.splice(index - 1, 1)
            self.resultOfSimulation.splice(index - 1, 1)
          })
        })
        self.headers.splice(index, 1)
      })
    },

    appendMultSimulation () {
      var self = this
      console.log(this.simulationsToAppend)

      new Promise((resolve) => {
        self.appendedSimulations.forEach(el => {
          self.$db.simulation.get(el).then(res => {
            let flag = true

            self.simulationsToAppend.forEach(ep => {
              if (ep.code === res.code) {
                flag = false
              }
            })

            if (flag) {
              self.simulationsToAppend.push(res)
              self.appendSimulation(el)
            }
          })
        })
        resolve()
      }).then(res => {
        let toRemove = []

        self.simulationsToAppend.forEach(el2 => {
          if (self.appendedSimulations.indexOf(el2.code) === -1) {
            toRemove.push(el2)
            this.removeFromCode(el2.code)
          }
        })
        toRemove.forEach(el => {
          self.simulationsToAppend.splice(self.simulationsToAppend.indexOf(el), 1)
        })
      })

      this.dialog = false
    },

    // metodo chamado para adicionar uma simulacao na tela de comparacao de simulacoes
    appendSimulation (code) {
      var self = this

      // caso a chamada der errado, fazer um tratamento
      var sm = ws.default.methods.call('/simulation/run/' + code)

      return sm.then(res => {
        self.resultOfSimulation.push(res)
        self.preProcessing()
        self.updateHeaders(code)
        self.dialog = false

        // self.simulation = null
      }).catch(rej => {
        let sim = this.$db.simulation.get(code)
        sim.then(res => {
          // todo colocar msg de aviso
          if (res.runned) {
            self.resultOfSimulation.push(res.runned)
            self.preProcessing()
            self.updateHeaders(res)
            self.dialog = false
            self.alertToConnect = true
          }
        })
      })
    },

    // metodo responsavel por fazer o pre processamento de dados
    preProcessing () {
      var zord = []

      for (let index = 0; index < this.resultOfSimulation.length; index++) { // para cada simulacao
        let simu = this.resultOfSimulation[index]

        for (let index2 = 0; index2 < simu.length; index2++) {
          const element = simu[index2] // area
          var temp = []

          for (let index3 = 0; index3 < element.ind.length; index3++) {
            const el = element.ind[index3]

            if (index === 0) {
              temp.push({
                'name': el.name,
                'values': [el.value]
              })
            } else {
              zord[index2][index3].values.push(el.value)
            }
          }

          if (index === 0) {
            zord.push(temp)
          }
        }
        this.dados = zord
      }
    },

    updateHeaders (simulation) {
      // esse metodo pode receber um objeto ou um codigo de simulacao
      // console.log(typeof (simulation))
      // console.log(simulation)

      if (typeof (simulation) === 'object') {
        this.headers.push({
          text: simulation.name,
          value: 'value',
          align: 'left',
          sortable: false,
          width: '160px'
        })
      } else {
        var self = this

        this.$db.simulation.get(simulation)
          .then(re => {
            self.headers.push({
              text: re.name,
              value: 'value',
              align: 'left',
              sortable: false,
              width: '160px'
            })
          })
      }
    },
    cancel () {
      this.$router.push({
        path: '/'
      })
    }
  }
}
</script>

