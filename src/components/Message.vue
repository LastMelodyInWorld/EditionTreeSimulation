<template>
  <v-snackbar :timeout="timeout" :color="type" :multi-line="true" :vertical="false" v-model="snackbar" :auto-height="true">
    {{ message }}
    <v-btn dark flat @click.native="snackbar = false">Fechar</v-btn>
  </v-snackbar>
</template>

<script>
  /**
   * Insert component where you want to use it:
   * <message ref="message"></confirm>
   *
   * Call it:
   * this.$refs.message.open('Item saved!', 'success');
   */
  export default {
    data () {
      return {
        snackbar: false,
        message: null,
        type: 'success',
        timeout: 2000
      }
    },
    methods: {
      open (message, type, timeout) {
        this.snackbar = true
        this.message = message
        this.type = type

        if (timeout) {
          this.timeout = timeout
        } else {
          this.timeout = 2000
        }
      }
    }
  }
</script>
