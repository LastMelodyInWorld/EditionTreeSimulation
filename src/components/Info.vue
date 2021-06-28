<template appear-active-class="body">
  <v-layout justify-center row>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="infoDialog">
      <v-card v-if="simulation">
        <v-toolbar color="white" extended extension-height="46px" light>
          <v-btn @click.native="infoDialog = false" icon>
            <v-icon>close</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar-title v-text="this.simulation.name"></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn @click="print" icon>
            <v-icon>print</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card ref="toPrint">
          <v-card flat>
            <v-card-title>
              <div>
                <span class="subheading">
                  <strong>{{ simulation.name }}</strong>
                </span>
                <br>
                <span>
                  Tamanho:
                  <strong>??</strong>
                </span>
                <br>
                <span>
                  Fases:
                  <strong :key="index" v-for="(bi, index) in simulation.phase">{{ bi }}</strong>
                  <!-- <strong>{{ simulation.phase }}</strong> -->
                </span>
                <br>
                <span>
                  Produtos:
                  <strong :key="index" v-for="(bi, index) in simulation.product">{{ bi }}</strong>
                  <!-- <strong>{{ simulation.phase }}</strong> -->
                </span>
                <br>
                <span>
                  Programas:
                  <strong :key="index" v-for="(bi, index) in simulation.program">{{ bi }}</strong>
                  <!-- <strong>{{ simulation.phase }}</strong> -->
                </span>
                <br>
                <span>
                  Biomas:
                  <strong :key="index" v-for="(bi, index) in simulation.biome">{{ bi }}</strong>
                  <!-- <strong>{{ simulation.biome }}</strong> -->
                </span>
                <br>
                <span>
                  Tecnologias:
                  <strong :key="index" v-for="(bi, index) in simulation.technology">{{ bi }}</strong>
                  <!-- <strong>{{ simulation.technology }}</strong> -->
                </span>
                <br>
                <span>
                  Sistema:
                  <strong>{{ systemName }}</strong>
                </span>
                <br>
              </div>
            </v-card-title>
            <v-card-actions></v-card-actions>
          </v-card>
          <v-card>
            <v-card-title>
              <span>
                <strong>Protocolo</strong>
              </span>
              <br>
            </v-card-title>
            <v-card-text style="text-align: justify;" v-html="simulation.protocol"></v-card-text>
          </v-card>
          <v-data-iterator
            :items="simulation.params"
            :pagination.sync="pag"
            content-tag="v-layout"
            hide-actions
            row
            wrap
          >
            <v-flex md12 slot="item" slot-scope="props" xs12>
              <v-card>
                <v-card-title>
                  <h4>{{ props.item.catname }}</h4>
                </v-card-title>
                <v-divider></v-divider>

                <v-data-table
                  :headers="headers"
                  :items="props.item.params"
                  :pagination.sync="pag"
                  hide-actions
                  item-key="name"
                >
                  <template slot="items" slot-scope="props">
                    <tr>
                      <td style= "white-space: nowrap; min-width: 260px">{{ props.item.name + " (" + props.item.unity + ")" }}</td>
                      <td>{{ mascaraValor(props.item.actual.toFixed(2)) }}</td>
                      <td>{{ mascaraValor(props.item.value.toFixed(2)) }}</td>
                      <td>{{ mascaraValor(props.item.minimum.toFixed(2)) }}</td>
                      <td>{{ mascaraValor(props.item.maximum.toFixed(2)) }}</td>
                    </tr>
                  </template>
                </v-data-table>
                <v-divider dark></v-divider>
              </v-card>
            </v-flex>
          </v-data-iterator>
        </v-card>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
var ws = require('../library/services.js').default
import { Printd } from 'printd'

export default {
  mixins: [
    ws
  ],
  data () {
    return {
      pag: {
        descending: false,
        page: 0,
        rowsPerPage: -1 // -1 for All
      },
      si: '',
      headers: [{
        text: 'Parâmetro',
        value: 'name',
        align: 'left',
        sortable: false,
        fixed: true,
        width: '300px'
      },
      { text: 'Atual', sortable: false, value: 'actual' },
      { text: 'Padrão', sortable: false, value: 'value' },
      { text: 'Mínimo', sortable: false, value: 'minimum' },
      { text: 'Máximo', sortable: false, value: 'maximum' }
      ],
      step: 0,
      drawer: false,
      systemName: null,
      simulation: '',
      infoDialog: false
    }
  },
  mounted () {
    this.Printd = window.printd
    this.d = new Printd()
  },
  methods: {
    print () {
      // elemento card que esta com referencia toPrint
      this.d.print(this.$children[0].$children[0].$children[0].$children[1].$el)
    },
    nextStep (index) {
      this.step = index
    },
    menu () {
      this.drawer = true
    },
    open () {
      this.infoDialog = true
    }
  }
}
</script>
