<template>
  <v-app id="inspire">
    <TreeMenu
      :TypeOfActionSelectedNow="TypeOfActionSelectedNow"
      @setTypeClickTree="setTypeClickTree"
      @executeModelCommand="executeModelCommand"
    />

    <TreeModal
      :modal="modal"
      :optionSelect="optionSelect"
      :selectedNode="selectedNode"
      @confirmEditNode="confirmEditNode"
    />

    <v-content>
      <div class="fluxograma" ref="fluxograma"></div>
    </v-content>
  </v-app>
</template>

<script>
import TreeMenu from '../components/TreeMenu'
import TreeModal from '../components/TreeModal'
import D3TreeClass, { actionsType, nodesType } from '../library/D3Tree'
const tree = new D3TreeClass()

export default {
  components: { TreeMenu, TreeModal },
  data () {
    return {
      optionSelect: {
        class: [],
        resource: [],
        duration: [],
        factor: []
      },
      selectedNode: null,
      modal: false,
      TypeOfActionSelectedNow: actionsType.addIn
    }
  },
  mounted: function () {
    // Carrega os dados dos atributos(class,resource,duration,factor) do backend
    this.loadAtributesBackend()
    // Configura qual função será acionada para mostrar os erros na tela
    tree.setHandleError(this.$swal)
    // Configura qual função será acionada ao clicar em um nó da árvore
    tree.setHandleClickFunction(this.handleOnclickFunction)
    // Ajusta a árvore para utilizar os atributos do select fornecido pelo backend
    // E configura qual cor vai representar cada classe
    tree.setAttributesSelectAndColor(this.optionSelect)
    // Constroi a árvore na div fluxograma
    tree.build()
  },
  methods: {
    /**
     * Executa o tipo de clique escolhido no menu no nó selecionado
     * @param selected representa os dados do nó selecionado
     * @param index representa a identicação do nó selecionado
     */
    handleOnclickFunction (selected, index) {
      switch (this.TypeOfActionSelectedNow) {
        case actionsType.addIn:
          tree.addChildrenNode(selected, index, nodesType.in)
          break
        case actionsType.addOut:
          tree.addChildrenNode(selected, index, nodesType.out)
          break
        case actionsType.remove:
          tree.removeChildrenNode(selected, index)
          break
        case actionsType.addBalance:
          tree.changeNodeTypeToBalance(selected, index)
          break
        case actionsType.removeBalance:
          tree.removeNodeTypeToBalance(selected, index)
          break
        case actionsType.edit:
          this.selectedNode = selected
          this.modal = true
          // Não limpa o nó selecionado caso o modal esteja aberto
          tree.setModalstate(true)
          break
        default:
          tree.addChildrenNode(selected, index, nodesType.in)
      }
    },

    /**
     * Evento acionado pelo componente treeMenu
     * Seleciona o tipo de clique que será executado ao clicar no nó
     * @param type identifica o tipo de clique selecionado
     */
    setTypeClickTree (type) {
      this.TypeOfActionSelectedNow = type
    },

    /**
     * Evento acionado pelo componente treeMenu
     * Executa um comando de modificação na árvore (redo, undo, save, reset)
     * @param command identifica o tipo de commando executado
     */
    executeModelCommand (command) {
      switch (command) {
        case actionsType.undo:
          tree.undo()
          break
        case actionsType.redo:
          tree.redo()
          break
        case actionsType.save:
          this.saveTreeBackend()
          break
        case actionsType.reset:
          this.removeTreeBackend()
          break
      }
    },

    /**
     * Evento acionado pelo componente treeModal
     * Redesenha a árvore e fecha o modal após a edição do nó
     * @param isNotModified não salva o histórico de modificação caso seja true
     */
    confirmEditNode (isNotModified) {
      tree.redrawTree(isNotModified)
      this.modal = false
      tree.setModalstate(false)
    },

    /**
     * Busca no backend as opções de atribuitos disponíveis para os selects do
     * modal e repassa essas informações para o component TreeModal via props
     */
    loadAtributesBackend () {
      // TODO: Adicionar aqui no futuro código para pegar opções do backend

      this.optionSelect = {
        class: [
          { text: 'Sem Classe', color: 'white' },
          { text: 'Classe 1', color: '#FFF9C4' },
          { text: 'Classe 2', color: '#B3E5FC' },
          { text: 'Classe 3', color: '#B39DDB' }
        ],
        resource: [
          { text: 'Recurso 1' },
          { text: 'Recurso 2' },
          { text: 'Recurso 3' }
        ],
        duration: [
          { text: 'Duração 1' },
          { text: 'Duração 2' },
          { text: 'Duração 3' }
        ],
        factor: [{ text: 'Fator 1' }, { text: 'Fator 2' }, { text: 'Fator 3' }]
      }
    },

    /**
     * Salva no backend da aplicação o estado atual árvore construida
     */
    saveTreeBackend () {
      // TODO: Adicionar aqui no futuro código para salvar árvore no backend
      // Por enquanto esta apenas salvando no localstorage
      tree.save()
      tree.generateJsonPP()
    },

    /**
     * Destroy no backend da aplicação o estado atual árvore construida
     */
    removeTreeBackend () {
      // TODO: Adicionar aqui no futuro código para exluir árvore no backend
      // Por enquanto esta apenas removendo do localstorage
      tree.clean()
    }
  }
}
</script>

<style>
.fluxograma {
  /* border: solid; */
  padding: 0;
  margin: 0;
  font-family: "PT Mono", monospace;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 3px;
}
</style>