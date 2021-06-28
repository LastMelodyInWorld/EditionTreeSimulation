import axios from 'axios'
var settings = require('../settings/' + process.env.NODE_ENV + '.json')
var bf = require('../library/blowfish.js')
var CryptoJS = require('crypto-js')
var querystring = require('querystring')

var timestamp = Math.floor(Date.now() / 1000)

var appID = settings.app
var appPK = settings.token

var secret = '' + CryptoJS.MD5(appPK + timestamp)
secret = secret.substr(0, 16)

var ws = {
  methods: {

    removeAccents (text) {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    },

    similarity (s1, s2) {
      var longer = s1
      var shorter = s2
      if (s1.length < s2.length) {
        longer = s2
        shorter = s1
      }
      var longerLength = longer.length
      if (longerLength === 0) {
        return 1.0
      }
      return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength)
    },

    mascaraValor (valor) {
      valor = valor.toString().replace(/\D/g, '')
      valor = valor.toString().replace(/(\d)(\d{8})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{5})$/, '$1.$2')
      valor = valor.toString().replace(/(\d)(\d{2})$/, '$1,$2')
      return valor
    },

    compareCat (a, b) {
      if (a.catname < b.catname) { return -1 }
      if (a.catname > b.catname) { return 1 }
      return 0
    },

    compare (a, b) {
      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    },

    editDistance (s1, s2) {
      s1 = s1.toLowerCase()
      s2 = s2.toLowerCase()

      var costs = []
      for (var i = 0; i <= s1.length; i++) {
        var lastValue = i
        for (var j = 0; j <= s2.length; j++) {
          if (i === 0) { costs[j] = j } else {
            if (j > 0) {
              var newValue = costs[j - 1]
              if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                newValue = Math.min(Math.min(newValue, lastValue),
                  costs[j]) + 1
              }
              costs[j - 1] = lastValue
              lastValue = newValue
            }
          }
        }
        if (i > 0) { costs[s2.length] = lastValue }
      }
      return costs[s2.length]
    },

    removeNonActiveSimulations (schema) {
      schema.where('active').equals(0).delete().then(res => {
        console.log('simulacoes nao ativas removida do banco local')
      })
    },
    // methods to indexedDB
    saveSimulationsOnDB (schema, array, updated) {
      for (var item of array) {
        item.active = parseInt(item.active)
        if (item.active) {
          schema.put({
            code: (item.code === null ? item.system : item.code),
            biome: item.biome,
            system: item.system,
            isSystem: item.code === null ? 1 : 0,
            featured: (item.featured === true ? 1 : 0),
            params: JSON.parse(JSON.stringify(item.params)),
            phase: item.phase,
            size: item.size,
            program: item.program,
            product: item.product,
            protocol: item.protocol,
            name: item.name,
            technology: item.technology,
            _create: item._create,
            _update: updated,
            active: item.active,
            runned: null
          })
        }
      }
    },
    // metodo responsavel por salvar um tipo de meta dados em um schema recebido
    saveMetaDataOnDB (schema, array) {
      for (var item of array) {
        schema.put({
          id: item.id,
          name: item.name
        })
      }
    },
    async syncMetaDada (db) {
      this.saveMetaDataOnDB(db.biomes, await this.getBiomes())
      this.saveMetaDataOnDB(db.phase, await this.getPhases())
      this.saveMetaDataOnDB(db.proccess, await this.getPhases())
      this.saveMetaDataOnDB(db.product, await this.getProducts())
      this.saveMetaDataOnDB(db.program, await this.getPrograms())
      this.saveMetaDataOnDB(db.technology, await this.getTechnologies())
    },
    // end methods to indexedDB
    setHeader () {
      var appSignature = CryptoJS.HmacSHA1(timestamp + appID, appPK)
      let config
      var usuario = JSON.parse(localStorage.user)

      if (usuario.authenticated) {
        var usrSignature = CryptoJS.HmacSHA1(timestamp + usuario.id, usuario.pk)
        config = {
          // mode: 'no-cors',
          headers: {
            // 'Access-Control-Allow-Origin': '*',
            'x-embrapa-auth-timestamp': timestamp,
            'x-embrapa-auth-application-id': appID,
            'x-embrapa-auth-application-signature': appSignature,
            'x-embrapa-auth-client-id': usuario.id, // o ID que esta vindo
            'x-embrapa-auth-client-signature': usrSignature
          }
        }
      } else {
        config = {
          // mode: 'no-cors',
          headers: { // CASO O USUARIO NAO ESTEJA LOGADO, O CABECALHO E DIFERENTE
            // 'Access-Control-Allow-Origin': '*',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-embrapa-auth-timestamp': timestamp,
            'x-embrapa-auth-application-id': appID,
            'x-embrapa-auth-application-signature': appSignature
          }
        }
      }
      return config
    },
    getPkFromBackEnd (token, validity, email, drive, mobile) {
      var tk = bf.blowfish.encrypt(token, secret, { cipherMode: 0, outputType: 0 })
      var data = {
        driver: drive,
        token: tk,
        device: mobile.osName + ' ' + mobile.osVersion + ' (' + mobile.browserName + ' ' + mobile.browserVersion + ')'
      }
      const config = this.setHeader()

      return new Promise((resolve, reject) => {
        axios.post(settings.api + '/register', querystring.stringify(data), config).then(req => {
          resolve(req.data)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    getTokenDecriptBlow (token) {
      return bf.blowfish.decrypt(token, secret, { cipherMode: 0, outputType: 0 })
    },
    deleteSimulation (id) {
      this.call('/simulation/delete/' + id)
    },

    // metodo responsavel por empilhar e enviar todas as simnulacoes
    // para o backend
    put (sim) {
      let promises = []
      let simulationSend = {}

      sim.forEach(s => {
        simulationSend['name'] = s.name
        simulationSend['system'] = s.system
        simulationSend['active'] = s.active
        simulationSend['_create'] = s._create
        simulationSend['_update'] = s._update

        for (var item in s.params) {
          for (var item2 in s.params[item].params) {
            var code = s.params[item].params[item2].code
            var value = s.params[item].params[item2].actual
            var str = 'params[' + code + ']'
            simulationSend[str] = value
          }
        }

        const config = this.setHeader()

        promises.push(axios.post(settings.api + '/simulation/modify/' + s.code, querystring.stringify(simulationSend), config))
      })
      console.log('#3 - Sending all items edited from last sync: ' + promises.length)

      axios.all(promises)
        .then(res => {
          console.log('simulacoes persistidas com sucesso')
        })
        .catch(rej => {
          console.log(rej)
        })
    },
    send (obj) {
      // metodo chamado para requisicoes via post
      return new Promise((resolve, reject) => {
        axios({
          method: 'post',
          url: 'http://localhost:9080/run',
          data: obj
        })
          .then(r => {
            resolve(r.data)
          })
          .catch(reject)
      })
    },
    call (str) {
      return new Promise((resolve, reject) => {
        var header = this.setHeader()
        axios.get(settings.api + str, header).then(response => {
          resolve(response.data)
        })
          .catch((error) => {
            reject(error)
          })
      })
    },
    getStatus () {
      return new Promise((resolve, reject) => {
        var header = this.setHeader()
        header['timeout'] = 3000

        axios.get(settings.api + '/status', header).then(response => {
          resolve(response.data)
        })
          .catch((error) => {
            reject(error)
          })
      })
    },
    async getSimulations () {
      return await this.call('/simulation/list')
    },
    getBiomes () {
      return this.call('/biome/list/0')
    },
    async getSystems () {
      return await this.call('/system/list/0')
    },
    async getSystemParameters () {
      return await this.call('/system/parameter/')
    },
    getPhases () {
      return this.call('/phase/list/0')
    },
    getProcesses () {
      return this.call('/proccess/list/0')
    },
    getPrograms () {
      return this.call('/program/list/0')
    },
    getResources () {
      return this.call('/resource/list/0')
    },
    getTechnologies () {
      return this.call('/technology/list/0')
    },
    getProducts () {
      return this.call('/product/list/0')
    }
  }
}

export default ws
