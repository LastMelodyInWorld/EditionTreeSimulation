<template>

  <v-app light>

    <v-toolbar app clipped-left fixed prominent light>

      <v-btn icon @click.native="cancel">
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-toolbar-title v-text="$route.name"></v-toolbar-title>

    </v-toolbar>

    <v-content>

      <v-container fluid grid-list-lg>
        <v-layout row wrap>

          <v-flex xs12>
            <p class="text-xs-center my-2">
              <img src="/static/img/404.png" />
            </p>
          </v-flex>

          <v-flex xs12 sm12 md10 offset-md1 lg8 offset-lg2 xl6 offset-xl3 class="my-3">
            <v-card class="px-3 py-2">
              <v-card-text>

                 <h1 class="text-xs-center">
                    OPS! Erro 404 <br>
                    Página não encontrada!
                </h1>
                <p>
                  Encontrou algum problema? Por favor, nos avise informando o número da versão abaixo, a
                  mensagem de erro e o modelo do seu <em>smartphone</em> pelo nosso
                  e-mail de suporte:
                </p>
                <p class="text-xs-center">
                  <a @click="email()">{{ settings.support }}</a>
                </p>
              </v-card-text>
            </v-card>
            <!--
            <v-img src="/static/img/partners.png" class="mt-5" />
            -->
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
  // components: {
  //   VueResponsiveImage
  // },
  data () {
    return {
      version: pkg.version,
      settings: settings
    }
  },
  methods: {
    email () {
      window.open('mailto: ' + settings.support + '?subject=Problemas%20na%20vers%C3%A3o%20' + pkg.version + 'do%2BPrecoce', '_blank')
    },
    cancel () {
      this.$router.push('/')
    }
  }
}
</script>
