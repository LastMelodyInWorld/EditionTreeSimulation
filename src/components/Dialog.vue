<template>
  <!-- <div class="text-xs-center"> -->
    <v-dialog v-model="dialog" scrollable width="500">

      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          {{title}}
        </v-card-title>
          <v-card-text v-html="message" style="text-align: justify;">
          </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="accept = dialog = false">
            {{declineText}}
          </v-btn>
          <v-btn color="primary" flat @click="aceita">
            {{confirmText}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  <!-- </div> -->
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      title: null,
      confirmText: null,
      declineText: null,
      message: null,
      accept: false
    }
  },
  methods: {
    open (title, message, confirmText, declineText) {
      this.dialog = true
      this.title = title
      this.message = message
      this.confirmText = confirmText
      this.declineText = declineText
    },
    aceita () {
      this.accept = true
      this.dialog = false
      this.$emit('aceita')
    }
  }
}
</script>
