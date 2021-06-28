<template>
  <router-view></router-view>
</template>

<script>

import UpdateWrapper from './components/Update.vue'

export default {
  components: {
    UpdateWrapper
  },
  created () {
    if (!this.$localStorage.user.authenticated) {
      this.$router.push('/')
    }
  },
  data () {
    return {
    }
  },
  methods: {
  },
  localStorage: {
    user: {
      type: Object,
      default: {
        authenticated: false,
        name: '',
        email: '',
        picture: '',
        id: '',
        pk: ''
      }
    },
    iosTryInstall: {
      type: Boolean,
      default: true
    },
    synchronized: {
      type: Number,
      default: 0
    },
    alwaysSync: {
      type: Boolean,
      default: false
    }
  }
}
</script>
