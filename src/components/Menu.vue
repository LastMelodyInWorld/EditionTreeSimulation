<template>
  <v-container class="px-0 py-2">
    <v-layout row>
      <v-flex class="px-2" xs12>
        <v-card class="black--text" color="white" flat>
          <v-card-title class="justify-center" style="text-align: center;">
            <strong>Atenção!</strong> Os dados mostrados foram sincronizados com a nuvem em:
            <v-chip class="mt-3" color="deep-purple darken-3" text-color="white">
              <v-avatar>
                <v-icon>schedule</v-icon>
              </v-avatar>
              {{ synchronized | format }}
            </v-chip>
          </v-card-title>
          <v-card-actions class="py-0 px-2">
            <v-btn @click="go('Sincronizar')" block color="black" outline>
              <v-icon left>sync</v-icon>Sincronizar Agora
            </v-btn>
          </v-card-actions>
          <v-card-actions class="py-0">
            <v-switch @change="changeAlwaysSync" color="black" label="Sincronizar automaticamente" v-model="alwaysSync"></v-switch>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout align-space-around class="px-1 mt-1" row>
      <v-flex class="px-1" xs6>
        <v-btn @click.native="go('Configurações')" block outline style="min-width: 50px;">
          <v-icon>settings</v-icon>
        </v-btn>
      </v-flex>
      <v-flex class="px-1" xs6>
        <v-btn @click.native="go('Sobre')" block outline style="min-width: 50px;">
          <v-icon>info</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <!-- <v-layout align-end justify-center row class="mt-2">
      <v-flex>
        <img v-if="this.$webp" src="../assets/embrapa.webp" style="width: 50%">
        <img v-else src="../assets/embrapa.png" style="width: 50%">
      </v-flex>
    </v-layout>-->
    <confirm-wrapper ref="confirm"/>
  </v-container>
</template>

<script>
import moment from 'moment'
import timestamp from 'unix-timestamp'

import ConfirmWrapper from '../components/Confirm.vue'

export default {
  components: {
    ConfirmWrapper
  },
  props: ['synchronized'],
  data () {
    return {
      menu: [
        { name: 'Configurações', icon: 'cog' },
        { name: 'Contato', icon: 'envelope' },
        { name: 'Sobre', icon: 'info-circle' }
      ],
      alwaysSync: false,
      rating: 0
    }
  },
  created () {
    this.alwaysSync = this.$localStorage.get('alwaysSync')
  },
  methods: {
    go (choose) {
      this.$emit('clicked', choose)
    },
    changeAlwaysSync (value) {
      var title, message

      if (value) {
        title = 'Ativar Sincr. Automática'
        message = 'Tem certeza que deseja ATIVAR a sincronização automática? Toda vez que a lista de simulações for mostrada, será realizada uma tentativa de sincronização com o servidor.'
      } else {
        title = 'Desativar Sincr. Automática'
        message = 'Tem certeza que deseja DESATIVAR a sincronização automática? A sincronização dos dados com o servidor será feita apenas quando o aplicativo for iniciado ou se você fizer explicitamente.'
      }

      var self = this

      this.$refs.confirm.open(
        title,
        message, { color: 'deep-purple darken-3', persistent: true }).then((confirm) => {
          if (confirm) {
            self.$localStorage.set('alwaysSync', value)
          } else {
            self.alwaysSync = !value
          }
        })
    }
  },
  filters: {
    format: function (value) {
      // timestamp.now()
      if (!value) return moment(timestamp.toDate(timestamp.now())).format('D/M/YY HH:mm')
      return moment(timestamp.toDate(value)).format('D/M/YY HH:mm')
    }
  }
}
</script>
