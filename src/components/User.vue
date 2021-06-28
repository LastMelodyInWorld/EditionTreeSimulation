<template>
  <v-list style="background-color: rgba(186,186,186, 0.2);" class="px-1">
    <v-btn outline color="pink" to="/login" block v-if="!user || !user.authenticated">
      <v-icon left>face</v-icon>
      Login
    </v-btn>
    <v-list-tile v-if="user && user.authenticated">
      <v-list-tile-avatar>
        <img :src="user.picture" :alt="user.name" />
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ user.name }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ user.email }}</v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
export default {
  data () {
    return {
      user: null
    }
  },
  mounted () {
    this.user = this.$localStorage.get('user')
  },
  methods: {
    logged () {
      if (this.user && this.user.authenticated) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
