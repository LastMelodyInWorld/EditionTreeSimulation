<template>

  <v-app light>

    <v-toolbar app clipped-left fixed prominent light>

      <v-btn icon @click.native="cancel">
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-toolbar-title v-text="$route.name"></v-toolbar-title>

      <v-spacer></v-spacer>

    </v-toolbar>

    <v-content>

      <v-container fluid grid-list-lg>
        <v-layout row wrap>

          <v-flex xs12>
            <p class="text-xs-center my-2">
              <!-- <v-img :src="'/static/img/stamp.png'" max-width="300"></v-img> -->
              <img v-if="this.$webp" src="/static/img/stamp.webp" />
              <img v-else src="/static/img/stamp.png" />
            </p>
          </v-flex>

          <v-flex xs12 sm12 md10 offset-md1 lg8 offset-lg2 xl6 offset-xl3 class="my-3">
            <v-card class="px-3 py-2">
              <v-card-text>
                <p>
                  O aplicativo <strong>+Precoce</strong> foi desenvolvido pela
                  <a href="http://embrapa.br/caprinos-e-ovinos" target="_blank">Embrapa Caprinos e Ovinos</a>,
                  em Sobral - CE, e pela
                  <a href="http://embrapa.br/gado-de-corte" target="_blank">Embrapa Gado de Corte</a>,
                  em Campo Grande - MS, com o apoio da <a href="http://www.cnabrasil.org.br" target="_blank">
                  Confederação da Agricultura e Pecuária do Brasil - CNA</a>.
                  É mantido pelo <a href="http://please.cnpgc.embrapa.br" target="_blank">Laboratory
                  for Precision Livestock, Environment and Software Engineering - PLEASE Lab</a>.
                </p>
                <p>
                  Para gerenciar seus dados armazenados nos servidores da Embrapa, acesse a
                  <a :href="settings.api.slice(0, -3)" target="_blank">aplicação Web</a> da plataforma <strong>+Precoce</strong>.
                  Estes dados são mantidos conforme estabelecido em nossa
                  <a href="/static/privacy-policy.html" target="_blank">política de privacidade</a>.
                </p>
                <p>
                  Encontrou algum problema? Por favor, nos avise informando o número da versão abaixo, a
                  mensagem de erro e o modelo do seu <em>smartphone</em> pelo nosso
                  e-mail de suporte:.
                </p>
                <p class="text-xs-center">
                  <a :href="'mailto: ' + settings.support + '?subject=Problemas%20na%20vers%C3%A3o%20' + version + '%20do%20Or%C3%A7amento%20Forrageiro'" target="_blank">{{ settings.support }}</a>
                </p>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12 sm12 md10 offset-md1 lg8 offset-lg2 xl6 offset-xl3 class="my-3">
            <p class="body-2 text-xs-center">Versão {{ version }}</p>
          </v-flex>

        </v-layout>
      </v-container>

    </v-content>

  </v-app>

</template>

<script>
// import VueResponsiveImage from 'vue-responsive-image'

var settings = require('../settings/' + process.env.NODE_ENV + '.json')
var pkg = require('../../package.json')

export default {
  components: {
    // VueResponsiveImage
  },
  data () {
    return {
      // image: '../static/img/stamp.png',
      version: pkg.version,
      settings: settings
    }
  },
  methods: {
    cancel () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
