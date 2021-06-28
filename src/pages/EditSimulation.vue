<template>
  <v-app light v-if="simulation">
    <v-toolbar app class="mb-0" extended extension-height="46px" ref="toolbar" style="position:relative">
      <v-btn @click.native="backHome" icon>
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-badge class="mx-2 hidden-sm-and-down" color="#9E9E9E" right>
        <v-toolbar-title
          @click="editName(simulation.name)"
          style="font-size: 110%; cursor: pointer;"
        >{{ simulation.name }}</v-toolbar-title>
        <v-icon @click="editName(simulation.name)" dark slot="badge" small>edit</v-icon>
      </v-badge>

      <v-toolbar-title
        @click="editName(simulation.name)"
        class="hidden-md-and-up"
        style="font-size: 110%; cursor: pointer;"
      >{{ simulation.name }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click.native="run()" class="mr-3 hidden-sm-and-down" color="blue" outline>
        <v-icon left>send</v-icon>Simular
      </v-btn>

      <v-btn @click.native="save" class="mr-3 hidden-sm-and-down" color="blue" outline>
        <v-icon left>save</v-icon>Salvar
      </v-btn>

      <v-btn @click.native="cancel" class="mr-3 ml-0 hidden-sm-and-down" color="red" outline>
        <v-icon left>cancel</v-icon>Cancelar
      </v-btn>

      <v-btn @click="editName(simulation.name)" class="hidden-md-and-up" icon>
        <v-icon>edit</v-icon>
      </v-btn>

      <v-btn @click.native="run()" class="hidden-md-and-up" icon>
        <v-icon>send</v-icon>
      </v-btn>
      <v-tabs color="transparent" show-arrows slot="extension" v-model="tab">
        <v-tabs-slider color="black"></v-tabs-slider>
        <v-tab :key="index" v-for="(si, index) in simulation.params" v-model="tab" v-on:click="save()">
          <div @click="this.step = index" style="font-size:90%">{{ si.catname }}</div>
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <v-container class="hidden-md-and-up mx-0" grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex :key="index" v-for="(si, index) in simulation.params[tab].params" xs12>
          <v-layout row>
            <h4>{{ si.name + " (" + si.unity + ")"}}</h4>
          </v-layout>
          <v-layout justify-space-around row>
            <v-subheader class="caption pl-0">{{mascaraValor(si.minimum.toFixed(2))}}</v-subheader>
            <v-slider
              :max="si.maximum"
              :min="si.minimum"
              :value="si.actual"
              class="mt-2"
              thumb-label
              v-on:change="si.actual = $event"
            ></v-slider>
            <!--  -->
            <v-subheader class="caption pr-0">{{mascaraValor(si.maximum.toFixed(2))}}</v-subheader>
          </v-layout>
          <v-layout align-center wrap>
            <v-tooltip class="tip" close-delay="250" max-width="140" right>
              <v-btn color="grey darken-1" flat icon slot="activator">
                <v-icon>info</v-icon>
              </v-btn>
              <span>{{ si.tip + "valor padrāo: " + si.value }}</span>
            </v-tooltip>
            <v-btn @click="si.actual = si.value" class="reset" color="grey darken-1" flat icon>
              <v-icon>cached</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <div>
              <vue-numeric
                :max="si.maximum"
                :min="si.minimum"
                class="mt-0 pt-0"
                id="input-value"
                currency
                decimal-separator=","
                separator="."
                v-bind:precision="2"
                v-model="si.actual"
              ></vue-numeric>
            </div>
            <!-- <v-currency-field v-on:change="teste" ref="field1" class="mt-0 pt-0" style="max-width:140px" v-bind="currency_config" v-model="si.actual"> </v-currency-field> -->
            <!-- <v-text-field v-model="si.actual"></v-text-field> -->
            <!-- <v-text-field class="mt-0 pt-0" :rules="[(si.actual >= si.minimum && si.actual <= si.maximum) || 'Valor Inválido' ]" hide-details single-line style="max-width:140px" v-model="si.actual"></v-text-field> -->
          </v-layout>
          <v-divider></v-divider>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- TELA GRANDE -->
    <v-container class="hidden-sm-and-down mt-3" grid-list-md>
      <v-layout :key="index" row v-for="(si, index) in simulation.params[tab].params" wrap>
        <v-flex xs4>
          <v-subheader class="pl-0 mb-4 ml-1 mr-0">{{ si.name + " (" + si.unity + ")"}}</v-subheader>
        </v-flex>
        <v-flex xs6>
          <v-layout row>
            <v-subheader>{{mascaraValor(si.minimum.toFixed(2))}}</v-subheader>
            <v-slider
              :max="si.maximum"
              :min="si.minimum"
              :value="parseInt(si.actual)"
              thumb-label
              v-on:change="si.actual = parseInt($event)"
            ></v-slider>
            <v-subheader>{{mascaraValor(si.maximum.toFixed(2))}}</v-subheader>
          </v-layout>
        </v-flex>
        <v-flex xs1>
          <v-layout row>
            <vue-numeric
              :max="si.maximum"
              :min="si.minimum"
              class="mb-4"
              currency
              decimal-separator=","
              separator="."
              id="input-value"
              v-bind:precision="2"
              v-model="si.actual"
            ></vue-numeric>
            <!-- <v-currency-field class="pa-0 ma-0" v-model="si.actual"></v-currency-field> -->
            <!-- <v-text-field
              :rules="[(si.actual >= si.minimum && si.actual <= si.maximum) || 'Valor Inválido' ]"
              class="mb-2 pa-0 ma-0"
              flat
              hide-details
              mask="#.###.###.##"
              single-line
              v-model="si.actual"
            ></v-text-field>-->
            <v-layout row>
              <v-tooltip class="tip mb-4" close-delay="250" max-width="140" right>
                <v-btn color="grey darken-1" flat icon slot="activator">
                  <v-icon>info</v-icon>
                </v-btn>
                <span>{{ si.tip + "valor padrāo: " + si.value }}</span>
              </v-tooltip>
              <v-btn @click="si.actual = si.value" class="reset mx-0 pr-3" color="grey darken-1" flat icon>
                <v-icon>cached</v-icon>
              </v-btn>
            </v-layout>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- FIM TELA GRANDE -->
    <!-- DIALOG -->
    <v-layout justify-center row>
      <v-dialog max-width="290" persistent v-model="dialogEdit">
        <v-card>
          <v-toolbar color="deep-purple darken-3" dark flat>
            <v-toolbar-title class="subheading white--text">Editar nome da simulacão</v-toolbar-title>
          </v-toolbar>
          <v-text-field
            :rules="[simulation.name.trim() !== '' || 'Nome Inválido']"
            class="mx-2"
            single-line
            v-model="simulation.name"
          ></v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="simulation.name.trim() !== '' ? false : true"
              @click.native="dialogEdit = false"
              color="deep-purple darken-3"
              flat
            >Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <!-- FIM DIALOG -->
    <v-layout align-end class="mx-2" justify-center row>
      <v-flex class="mx-1" md4 order-md3 order-sm1 sm3 v-if="tab === 0" xs12>
        <v-btn @click.native="cancel" block color="error" outline>
          <v-icon dark left>close</v-icon>Sair
        </v-btn>
      </v-flex>
      <v-flex class="mx-1" md4 order-md3 order-sm1 sm3 v-if="tab > 0" xs12>
        <v-btn @click.native="tab = tab - 1" block color="error" outline v-on:click.exact="save()">
          <v-icon dark left>navigate_before</v-icon>Anterior
        </v-btn>
      </v-flex>
      <v-flex class="mx-1" md4 order-md3 order-sm1 sm3 v-if="tab != simulation.params.length - 1" xs12>
        <v-btn @click.native="tab = tab + 1" block color="success" outline v-on:click.exact="save()">Próximo
          <v-icon dark right>navigate_next</v-icon>
        </v-btn>
      </v-flex>
      <v-flex class="mx-1" md4 order-md3 order-sm1 sm3 v-if="tab === simulation.params.length - 1" xs12>
        <v-btn @click="run()" block color="warning" outline>Simular
          <v-icon dark right>send</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-snackbar
      :multi-line="true"
      :timeout="1100"
      :vertical="false"
      color="success"
      v-model="snackbar"
    >Simulação salva com sucesso!
      <v-btn @click.native="snackbar = false" dark flat>Fechar</v-btn>
    </v-snackbar>
    <v-dialog max-width="300px" persistent v-model="wait">
      <v-card>
        <v-card-text style="text-align: center;">
          <v-progress-circular :rotate="360" :size="100" :value="progress" :width="15" color="teal">{{ progress }}%</v-progress-circular>
        </v-card-text>
        <v-card-title block class="headline" style="text-align: center;">Sincronizando... por favor, aguarde!</v-card-title>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>

var ws = require('../library/services.js').default.methods
import timestamp from 'unix-timestamp'
export default {
  data () {
    return {
      wait: false,
      progress: 0,
      dialogEdit: false,
      bottomNav: 'recent',
      tab: 0,
      params: null,
      step: 0,
      simulation: null,
      snackbar: false,
      rules: {
        name: [
          v => (v && v.trim().length > 0) || 'Insira um nome para sua simulação!',
          v => (v && v.length <= 15) || 'O nome não pode ter mais de 15 caracteres!'
        ],
        farm: [
          v => (v && v.trim().length > 0) || 'Insira o nome da propriedade!',
          v => (v && v.length <= 50) || 'A propriedade não pode ter mais de 50 caracteres!'
        ],
        number: [
          v => (v && !isNaN(v)) || 'Insira um número inteiro!'
        ],
        percent: [
          v => (v && !isNaN(v) && v > 0 && v <= 100) || 'Insira uma porcentagem (0-100%)!'
        ]
      }
    }
  },
  mixins: [
    ws
  ],
  created () {
    var self = this

    return this.$db.simulation.get(this.$route.params.code)
      .then(re => {
        re.params.sort(ws.compareCat)

        re.params.forEach(element => {
          element.params.sort(ws.compare)
        })
        self.simulation = re
      })
  },
  methods: {
    teste () {
      console.log('TESTE DE EVENTO')
    },
    mascaraValor (valor) {
      valor = valor.toString().replace(/\D/g, '')
      valor = valor.toString().replace(/(\d)(\d{8})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{5})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{2})$/, '$1,$2')
      return valor
    },
    run () {
      var self = this

      new Promise((resolve, reject) => {
        self.save()
        self.$refs.toolbar.$el.focus()
        resolve()
      }).then(resolve => {
        if (this.simulation._update > this.$localStorage.get('synchronized')) {
          this.$router.push({ path: '/simulation/' + this.simulation.code, query: { toReport: true } })
        } else {
          this.$router.push({ path: '/reports' + this.simulation.code })
        }
      })
    },
    store () {
      this.simulation.changed = new Date()
      this.$db.simulation.where('code').equals(this.simulation.code).modify(this.simulation).then(() => { this.snackbar = true })
    },
    save () {
      this.simulation._update = Math.floor(timestamp.now())
      console.log(this.simulation.params[0].params[0].actual)

      this.snackbar = true
      this.$db.simulation.put(this.simulation)
    },
    next () {
      if (this.step < this.simulation.params.length) {
        this.step++
      }
    },
    back () {
      if (this.step > 1) {
        this.step--
      }
    },
    backHome () {
      this.save()
      this.$router.push({ path: '/simulation' })
    },
    cancel () {
      this.$router.push({ path: '/simulation' })
    },
    editName (name) {
      this.dialogEdit = true
    },
    number (evt) {
      if (!evt) evt = window.event
      var charCode = (evt.which) ? evt.which : evt.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault()
      } else {
        return true
      }
    }
  },
  filters: {
    round: function (value) {
      if (!value) return ''

      return Math.ceil(value)
    },
    format: function (value) {
      return Number(Math.round(value)).toLocaleString('pt-BR')
    }
  }
}
</script>
<style>
#input-value {
  text-align: center;
  border-radius: 25px;
  border: 1px solid #cacaca;
  width: 120px;
}
</style>
