<template>
  <v-app light>
    <v-toolbar app clipped-left fixed prominent>
      <v-toolbar-title v-text="'Bem-Vind@'"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex lg8 md10 offset-lg2 offset-md1 offset-xl3 sm12 xl6 xs12>
            <v-card class="px-3 py-2">
              <v-img :src="image" aspect-ratio="4.17" max-width="300"></v-img>
              <v-card-text>
                <p align="justify">
                  Você pode efetuar
                  <strong>login</strong> na plataforma para ter mais benefícios. Usuários autenticados podem sincronizar seus dados com a
                  <a
                    href="https://embrapa.br"
                    rel="noopener"
                    target="_blank"
                  >Embrapa</a>, de forma a
                  <strong>recuperá-los em caso de perda ou troca do dispositivo</strong> (computador, celular, tablet, etc). Além disso, seus dados poderão ser utilizados, sempre de forma anônima, em futuras pesquisas científicas para criação de tecnologias inovadoras para a agropecuária.
                </p>
              </v-card-text>
              <dialog-p-p ref="dialog" v-on:aceita="accept"></dialog-p-p>

              <v-btn @click.stop="showpp" block class="white--text" color="purple" large>
                <v-icon dark left>gavel</v-icon>Política de Privacidade
              </v-btn>

              <v-switch class="mt-3" label="Li e aceito os termos." v-model="agree"></v-switch>

              <v-alert
                :value="error"
                class="mx-1"
                icon="warning"
                transition="scale-transition"
                type="error"
              >Ops! Ocorreu um erro ao tentar autenticá-lo(a)! Por favor, tente novamente mais tarde.</v-alert>
              <v-layout align-center justify-center row v-if="agree" wrap>
                <v-flex class="px-1 button-text-align-center" lg6 md6 sm12 xl6 xs12>
                  <g-signin-button :params="googleSignInParams" @error="onSignInError" @success="onSignInSuccess" block>
                    <v-icon dark left v-html="'fab fa-google'"></v-icon>Google
                  </g-signin-button>
                </v-flex>
                <v-flex class="px-1 button-text-align-center" lg6 md6 sm12 xl6 xs12>
                  <fb-signin-button :params="fbSignInParams" @error="onSignInErrorFb" @success="getUserData" block>
                    <v-icon dark left v-html="'fab fa-facebook'"></v-icon>Facebook
                  </fb-signin-button>
                </v-flex>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
        <v-flex xs12>
          <p class="text-xs-center my-4">
            <img v-if="this.$webp" alt="Logo da Embrapa" src="../assets/embrapa.webp" style="width: 150px;">
            <img v-else alt="Logo da Embrapa" src="../assets/embrapa.png" style="width: 150px;">
          </p>
        </v-flex>
      </v-container>
    </v-content>

    <v-dialog max-width="300px" persistent v-model="wait">
      <v-card>
        <v-card-text class="button-text-align-center">
          <v-progress-circular :size="70" :width="7" color="purple lighten-2" indeterminate></v-progress-circular>
        </v-card-text>
        <v-card-title block class="headline button-text-align-center">Autenticando... por favor, aguarde!</v-card-title>
      </v-card>
    </v-dialog>

    <install ref="installIos">
    </install>

  </v-app>
</template>

<script>
/* global FB */
import axios from 'axios'
import install from '../components/Install.vue'
import ConfirmWrapper from '../components/Confirm.vue'
import DialogPP from '../components/Dialog.vue'
import mobile from 'mobile-device-detect'

var settings = require('../settings/' + process.env.NODE_ENV + '.json')
var ws = require('../library/services.js')
const fb = require('../library/fb.js')

export default {
  mixins: [
    ws, fb
  ],
  components: {
    install,
    ConfirmWrapper,
    DialogPP
  },
  data () {
    return {
      image: this.$webp ? '../static/img/logo.webp' : '/static/img/logo.png',
      logo: this.$webp ? '../assets/embrapa.webp' : '../assets/embrapa.png',
      mobile: mobile,
      fbSignInParams: {
        scope: 'email',
        return_scopes: true
      },
      privacy: '',
      ios: false,
      agree: false,
      wait: false,
      error: false,
      facebookProfile: {
        id: '',
        name: '',
        email: '',
        accessToken: '',
        validity: ''
      },
      settings: settings,
      googleSignInParams: {
        client_id: settings.auth.google
      }
    }
  },
  created () {
    if (this.$localStorage.user.authenticated) { // Se o usuario ja esta autenticado, vai p/ tela de simulacoes
      this.$router.push({ path: '/simulation' })
    }
  },
  mounted () {
    this.getPrivacyPolicyByFile()
    // if (this.mobile.isIOS) {
    //   this.ios = true
    // }
  },
  methods: {
    // installIOS () {
    //   this.ios = false

    //   this.install = true

    //   this.$localStorage.set('iosTryInstall', false)
    // },
    onSignInErrorFb (error) {
      console.log('OH NOES', error)
    },
    getFacebookStatus () {
      return new Promise((resolve, reject) => {
        FB.getLoginStatus(
          function (response) {
            if (response.status === 'connected') {
              resolve(response)
            }
          })
      })
        .catch(reject => {
          console.log(reject)
        })
    },
    getFacebookNameAndEmail () {
      return new Promise((resolve, reject) => {
        // nome, email
        FB.api('/me', 'GET', { fields: 'id,name,email' },
          userInformation => {
            resolve(userInformation)
          }
        )
      })
    },
    getFacebookPic (id) {
      return new Promise((resolve, reject) => {
        FB.api(
          '/' + id + '/picture?type=square',
          'GET',
          { 'redirect': 'false' },
          function (response) {
            resolve(response)
          }
        )
      })
    },
    async getUserData () { // Login com Facebook
      var self = this
      var err = function (error) {
        console.log(error)
        console.log(JSON.stringify(error.response.data))
        self.wait = false
        self.error = 'Ops! Ocorreu um erro ao tentar autenticá-lo(a)! Por favor, tente novamente mais tarde.'
      }

      this.wait = true
      var status = await this.getFacebookStatus()
      var nameAndEmail = await this.getFacebookNameAndEmail()
      var urlProfilePic = await this.getFacebookPic(status.authResponse.userID)

      var pk = Promise.resolve(ws.default.methods.getPkFromBackEnd(status.authResponse.accessToken, status.authResponse.expiresIn, nameAndEmail.email, 'Facebook', this.mobile))
      pk.then(req => {
        var user = JSON.parse(localStorage.getItem('user'))
        user.authenticated = true
        user.email = nameAndEmail.email
        user.id = req.id
        user.pk = ws.default.methods.getTokenDecriptBlow(req.pk)
        user.name = nameAndEmail.name
        user.picture = urlProfilePic.data.url
        localStorage.setItem('user', JSON.stringify(user))
        ws.default.methods.syncMetaDada(this.$db)
        this.wait = false

        if (self.mobile.isMobile) {
          this.$localStorage.set('alwaysSync', false)
        } else {
          console.log('not mobile')
          this.$localStorage.set('alwaysSync', true)
        }

        this.$router.push({ path: '/simulation/' })
      })
        .catch(err)
    },
    onSignInSuccess (googleUser) { // Login com Google
      var self = this
      var err = function (error) {
        console.log(error)
        // console.log(JSON.stringify(error.response.data))
        self.wait = false
        self.error = 'Ops! Ocorreu um erro ao tentar autenticá-lo(a)! Por favor, tente novamente mais tarde.'
      }

      this.wait = true
      var profile = googleUser.getBasicProfile(true)
      var user = googleUser.getAuthResponse(true)
      // as informacoes nome, email, pic estao sendo pegadas direto do google com a variavel googleUser
      // futuramente essas informacoes podem ser pegadas do titan api
      var token = user.access_token

      var validity = user.expires_in
      var email = profile.getEmail()
      var name = profile.getName()
      var urlpic = profile.getImageUrl()
      var pk = Promise.resolve(ws.default.methods.getPkFromBackEnd(token, validity, email, 'Google', this.mobile))
      pk.then(req => {
        var user = JSON.parse(localStorage.getItem('user'))

        user.authenticated = true
        user.email = email
        user.id = req.id
        user.pk = ws.default.methods.getTokenDecriptBlow(req.pk)
        user.name = name
        user.picture = urlpic
        localStorage.setItem('user', JSON.stringify(user))
        ws.default.methods.syncMetaDada(this.$db)

        if (self.mobile.isMobile) {
          console.log('mobile')
          console.log(self.mobile)

          this.$localStorage.set('alwaysSync', false)
        } else {
          console.log('not mobile')
          this.$localStorage.set('alwaysSync', true)
        }
        this.wait = false
        this.$router.push({ path: '/simulation' })
      }).catch(err)
    },
    onSignInError (error) {
      // `error` contains any error occurred.
      console.log('OH NOES', error)
    },
    getPrivacyPolicyByFile () {
      var url = '../static/privacy-policy.html'
      var vm = this

      axios.get(url).then(
        function (r) {
          vm.privacy = r.data
        })
    },
    showpp () {
      this.$refs.dialog.open('Politica de Privacidade', this.privacy, 'Aceito', 'Não Aceito')
    },
    accept () {
      this.agree = true
    },
    cancel () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
<style>
.img-footer {
  display: block;
  margin: 0 auto;
  width: 150px;
}
.button-text-align-center {
  text-align: center;
}
.g-signin-button {
  user-select: none;
  margin: 1%;
  display: inline-block;
  width: 100%;
  padding: 9px 8px;
  border-radius: 3px;
  background-color: #c62828;
  color: #fff;
  cursor: pointer;
}
.fb-signin-button {
  user-select: none;
  width: 100%;
  margin: 1%;
  display: inline-block;
  padding: 9px 8px;
  border-radius: 3px;
  background-color: #4267b2;
  color: #fff;
  cursor: pointer;
}
.fb-signin-button:hover {
  background-color: #4a76ce;
}
.g-signin-button:hover {
  background-color: #f23030;
}
</style>
