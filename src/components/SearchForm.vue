<template>
  <v-layout justify-center row>
    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialogSearchForm">
      <v-card>
        <v-toolbar color="white" light>
          <v-btn @click.native="close" icon>
            <v-icon>close</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn @click.native="clear" flat>
              <v-icon dark>find_replace</v-icon>Limpar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn @click.native="search" flat>
              <v-icon dark>search</v-icon>Pesquisar
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-subheader>Parametros de Busca</v-subheader>
        <!-- TODO: FALTA COLOCAR OS ITEMS -->
        <v-form style="padding:0px 12px 0px 12px">
          <v-text-field :counter="10" label="Nome" required v-model="busca.name"></v-text-field>
          <v-select multiple :items="productsCp" label="product" v-model="busca.product"></v-select>
          <v-select multiple :items="biomesCp" label="Biomas" v-model="busca.biome"></v-select>
          <v-select multiple :items="technologiesCp" label="Tecnologias" v-model="busca.technology"></v-select>
          <v-select multiple :items="programsCp" label="programs" v-model="busca.program"></v-select>
        </v-form>
        <v-divider></v-divider>
        <v-container grid-list-md justify-space-between align-content-start>
          <v-layout justify-space-between row wrap>
            <v-flex xs4>
              <v-subheader>Fases</v-subheader>
              <v-switch color="blue" hide-details label="Cria" v-model="fases" value="Cria"></v-switch>
              <v-switch color="blue" hide-details label="Recria" v-model="fases" value="Recria"></v-switch>
              <v-switch color="blue" hide-details label="Engorda" v-model="fases" value="Engorda"></v-switch>
            </v-flex>
            <v-flex xs4>
              <v-subheader>Tamanho</v-subheader>
              <v-switch color="blue" hide-details label="Pequeno" v-model="size" :value="0"></v-switch>
              <v-switch color="blue" hide-details label="Médio" v-model="size" :value="1"></v-switch>
              <v-switch color="blue" hide-details label="Grande" v-model="size" :value="2"></v-switch>
            </v-flex>
            <v-flex xs4>
              <v-subheader>Simulações</v-subheader>
              <v-switch color="blue" hide-details label="Minhas" v-model="simulations" :value=0></v-switch>
              <v-switch color="blue" hide-details label="Padrão" v-model="simulations" :value=1></v-switch>
              <!-- <v-switch class="mb-2" color="blue" hide-details label="Favoritas" v-model="simulations" :value=2></v-switch> -->
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
var ws = require('../library/services.js')

export default {
  mixins: [
    ws
  ],
  computed: {
    biomesCp () {
      return this.biomes.map(bioma => ({ text: bioma.name, value: bioma.name }))
    },
    productsCp () {
      return this.products.map(product => ({ text: product.name, value: product.id }))
    },
    technologiesCp () {
      return this.technologies.map(technologie => ({ text: technologie.name, value: technologie.id }))
    },
    programsCp () {
      return this.programs.map(program => ({ text: program.name, value: program.id }))
    }
  },
  data () {
    return {

      text: 'center',
      fases: ['Cria', 'Recria', 'Engorda'],
      size: [0, 1, 2],
      simulations: [0, 1, 2], // 0: minhas, 1: padrao, 2: favoritas
      dialogSearchForm: false,
      notifications: false,
      sound: false,
      widgets: false,
      biomes: [{}],
      products: [{}],
      technologies: [{}],
      programs: [{}],
      busca: {
        name: '',
        product: null,
        biome: null,
        technology: null,
        program: null,
        simulations: null,
        // biome: [],
        // technology: [],
        // program: [],
        phase: null,
        size: null,
        active: false
      }
    }
  },
  methods: {
    async open () {
      var self = this

      this.$db.biomes.toArray().then(response => {
        self.biomes = response
      }).catch(error => {
        console.log(error)
      })

      this.$db.product.toArray().then(response => {
        self.products = response
      }).catch(error => {
        console.log(error)
      })

      this.$db.technology.toArray().then(response => {
        self.technologies = response
      }).catch(error => {
        console.log(error)
      })

      this.$db.program.toArray().then(response => {
        self.programs = response
      }).catch(error => {
        console.log(error)
      })

      this.dialogSearchForm = true
    },
    close () {
      this.dialogSearchForm = false
    },
    clear () {
      this.busca = {
        name: '',
        product: null,
        biome: null,
        technology: null,
        program: null,
        phase: null,
        size: null,
        simulations: null,
        active: false // diz se a busca está ativa
      }
      this.$emit('buscar')
      this.dialogSearchForm = false
    },
    search () {
      this.busca.simulations = this.simulations
      this.busca.size = this.size
      this.busca.phase = this.fases
      this.busca.active = true

      this.$emit('buscar')

      this.dialogSearchForm = false
    }
  }
}
</script>
