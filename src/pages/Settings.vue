<template>
  <v-app light>
    <v-toolbar app clipped-left fixed light prominent>
      <v-btn @click.native="cancel" icon>
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-toolbar-title v-text="$route.name"></v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex class="my-3" lg8 md10 offset-lg2 offset-md1 offset-xl3 sm12 xl6 xs12>
            <v-card class="px-3 py-2">
              <v-card-title class="headline">Trocar Usuário
                <v-spacer/>
                <v-icon large>supervisor_account</v-icon>
              </v-card-title>
              <v-card-text>Clique no botão abaixo para
                <strong>remover suas informações de autenticação</strong> e logar com outro usuário:
              </v-card-text>
              <v-card-actions class="hidden-sm-and-down">
                <v-spacer></v-spacer>
                <v-btn @click="cleanup" color="error">
                  <v-icon left>swap_horiz</v-icon>Trocar Usuário
                </v-btn>
              </v-card-actions>
              <v-card-actions class="hidden-md-and-up">
                <v-btn @click="cleanup" block color="error">
                  <v-icon left>swap_horiz</v-icon>Trocar Usuário
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex class="my-3" lg8 md10 offset-lg2 offset-md1 offset-xl3 sm12 xl6 xs12>
            <v-card class="px-3 py-2">
              <v-card-title class="headline">Contato
                <v-spacer/>
                <v-icon large>chat</v-icon>
              </v-card-title>
              <v-card-text>Clique no botão abaixo para
                <strong>entrar em contato</strong> ou
                <strong>reportar algum problema técnico</strong>:
              </v-card-text>
              <v-card-actions class="hidden-sm-and-down">
                <v-spacer></v-spacer>
                <v-btn @click="email" color="info">
                  <v-icon left>mail</v-icon>Enviar e-Mail
                </v-btn>
              </v-card-actions>
              <v-card-actions class="hidden-md-and-up">
                <v-btn @click="email" block color="info">
                  <v-icon left>mail</v-icon>Enviar e-Mail
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex class="my-3" lg8 md10 offset-lg2 offset-md1 offset-xl3 sm12 xl6 xs12>
            <p class="body-2 text-xs-center">Versão {{ version }}</p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <confirm-wrapper ref="confirm"/>

    <dialog-wrapper ref="dialog"/>
  </v-app>
</template>

<script>
import ConfirmWrapper from '../components/Confirm.vue'
import DialogWrapper from '../components/Dialog.vue'

var settings = require('../settings/' + process.env.NODE_ENV + '.json')
var pkg = require('../../package.json')

export default {
  components: {
    ConfirmWrapper,
    DialogWrapper
  },
  data () {
    return {
      version: pkg.version
    }
  },
  beforeCreate () {
    if (!this.$localStorage.get('user').authenticated) {
      this.$router.push('/')
    }
  },
  methods: {
    cancel () {
      this.$router.push({ path: '/' })
    },
    email () {
      window.open('mailto: ' + settings.support + '?subject=Problemas%20na%20vers%C3%A3o%20' + pkg.version + 'do%2BPrecoce', '_blank')
    },
    cleanup () {
      var self = this

      var lastSync = this.$localStorage.get('synchronized')

      self.$db.simulation
        .where('_update').above(lastSync).toArray()
        .then(simulations => {
          if (simulations.length > 0) {
            self.$refs.dialog.open(
              'Ação Necessária',
              'Existem simulações que foram alteradas no dispositivo. Para remover suas informações deste disposito, primeiro você deve SINCRONIZAR seus dados com a nuvem!',
              'Fechar')
          } else {
            self.$refs.confirm.open(
              'Trocar Usuário',
              'Tem certeza de que deseja LIMPAR TODOS OS DADOS DO APLICATIVO NESTE DISPOSITIVO e TROCAR O USUÁRIO? Você não irá perder nenhuma simulação já sincronizada com a nuvem, podendo visualizá-las quando logar novamente neste ou em outro dispositivo. Simulações em edição (não sincronizadas) serão perdidas de forma irreversível.',
              { color: 'error' }).then((confirm) => {
                if (confirm) {
                  self.$db.simulation.clear()

                  self.$localStorage.set('user', {
                    authenticated: false,
                    id: 0,
                    name: '',
                    email: '',
                    picture: '',
                    language: '',
                    timezone: ''
                  })

                  self.$localStorage.set('synchronized', 0)

                  self.$localStorage.set('alwaysSync', true)

                  // self.$localStorage.set('iosTryInstall', true)

                  self.$root.$data.trySync = true

                  self.$router.push({ path: '/' })
                }
              })
          }
        })
    }
  }
}
</script>
