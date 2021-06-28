<template>
  <v-layout justify-center row>
    <v-snackbar :auto-height="true" :multi-line="true" :timeout="30000" :vertical="false" color="gray" v-model="ios">
      <v-btn @click.native="install()" class="px-3" color="white" outline>
        <v-icon dark left>get_app</v-icon>Instalar
      </v-btn>
      <v-btn @click.native="ios = false" flat>Fechar</v-btn>
    </v-snackbar>

    <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="dialog">
      <v-card>
        <v-toolbar color="white">
          <v-toolbar-title>Instalar no Dispositivo</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn @click.native="dialog = false" flat>Fechar</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-img alt="Adicionando à tela inicial no iOS" class="mt-3" contain :src="this.$webp? '/static/img/ios.webp' : '/static/img/ios.png' "/>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import mobile from 'mobile-device-detect'

export default {
  data () {
    return {
      ios: false,
      dialog: false
    }
  },
  mounted () {
    if (mobile.isIOS && window.navigator.standalone !== true && !window.matchMedia('(display-mode: standalone)').matches && this.$localStorage.iosTryInstall) {
      this.ios = true
    }
  },
  methods: {
    install () {
      this.ios = false

      this.dialog = true

      this.$localStorage.set('iosTryInstall', false)
    }
  }
}
</script>
