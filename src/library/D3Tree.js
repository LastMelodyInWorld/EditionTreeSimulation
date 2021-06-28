import * as d3 from 'd3'
import error from './errosMsgs'
import history from './history'

const WIDTH = 1000
const HEIGHT = 800

export const actionsType = {
  add: 'addNode',
  addIn: 'addNodeIn',
  addOut: 'addNodeOut',
  remove: 'removeNode',
  addBalance: 'addBalance',
  removeBalance: 'removeBalance',
  edit: 'editNode',
  undo: 'undo',
  redo: 'redo',
  save: 'save',
  reset: 'reset'
}

export const nodesType = {
  in: 1,
  out: 0
}

const DEFAULT = {
  name: '',
  description: '',
  class: '',
  resource: '',
  duration: '',
  factor: '',
  circleSize: 26,
  nodeh: 60,
  nodew: 80,
  orientationTree: 'top'
}

const orientationTree = {
  top: {
    size: [WIDTH, HEIGHT],
    x: function (d) {
      return d.x
    },
    y: function (d) {
      return d.y
    }
  }
}

class D3Tree {
  constructor () {
    this.circleColor0 = '#009933'
    this.circleColor1 = '#003399'
    this.data = null
    this.root = null
    this.circleSize = DEFAULT.circleSize
    this.nodeh = DEFAULT.nodeh
    this.nodew = DEFAULT.nodew
    this.selectedOrientationTree = DEFAULT.orientationTree
    this.counterBalanceClick = 0
    this.counterBalance = 1
    this.balanceClicked = {
      id: -1,
      d: null
    }
    this.sizeLabel = 5
    this.orientation = orientationTree[this.selectedOrientationTree]
    this.optionSelect = {}
    this.modal = false
  }

  /**
   * Retorna um json com o estado atual da árvore
   */
  getJsonData () {
    return JSON.stringify(this.data)
  }

  /**
   * Configura função que vai apresentar os erros na tela
   */
  setHandleError (error) {
    this.error = error
  }

  /**
   * Configura função que vai ser executada quando o usuário clicar em um nó
   */
  setHandleClickFunction (click) {
    this.handleClickFunction = click
  }

  /**
   * Configura função que vai ser executada quando o usuário clicar em um nó
   */
  setModalstate (state) {
    this.modal = state
  }

  /**
   * Configura os atributos para edição e as cores das classes
   */
  setAttributesSelectAndColor (attributes) {
    this.optionSelect = attributes
    DEFAULT.class = this.optionSelect.class[0].text
    DEFAULT.resource = this.optionSelect.resource[0].text
    DEFAULT.duration = this.optionSelect.duration[0].text
    DEFAULT.factor = this.optionSelect.factor[0].text
  }

  /**
   * Prepara os dados utilizados para desenhar a árvore, caso tenha algo salvo
   * no localstorage esse dado sera carregado
   */
  inicializeData () {
    this.data = {
      name: 'A1',
      description: DEFAULT.description,
      value: 1, //
      class: DEFAULT.class,
      resource: DEFAULT.resource,
      duration: DEFAULT.duration,
      factor: DEFAULT.factor,
      children: [
        {
          name: 'B1',
          description: DEFAULT.description,
          value: 1,
          class: DEFAULT.class,
          resource: DEFAULT.resource,
          duration: DEFAULT.duration,
          factor: DEFAULT.factor,
          children: []
        }
      ]
    }
    this.load()
    history.saveState(this.data)
  }

  /**
   * Adiciona o SVG na div fluxograma e centraliza a posição da árvore e
   * habilidade a opção de zoom
   */
  createElementBaseForD3 () {
    let svg = d3
      .select('.fluxograma')
      .append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight)
      .call(
        d3.zoom().on('zoom', function () {
          svg.attr('transform', d3.event.transform)
        })
      )
      .call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(window.innerWidth / 2 - 16, 50).scale(1)
      )
      .append('g')
      .attr(
        'transform',
        'translate(' + (window.innerWidth / 2 - 16) + ',' + 50 + ')'
      )
    svg.append('g').attr('class', 'links')
    svg.append('g').attr('class', 'nodes')
  }

  /**
   * Cria o modelo de desenho das duas flechas no SVG (start-arrow, end-arrow)
   */
  createArrowModelToPath () {
    d3.select('svg')
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25) // Distancia da seta em relação a origem
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#009933')
    d3.select('svg')
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25) // Distancia da seta em relação a origem
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#003399')
  }

  /**
   * Constroi o modelo inicial da árvore
   */
  build () {
    this.inicializeData()
    this.createElementBaseForD3()
    this.createArrowModelToPath()
    this.drawTree()
  }

  /**
   * Desenha a árvore completa
   */
  drawTree () {
    let treeLayout = d3
      .tree()
      .nodeSize([this.nodeh, this.nodew])
      .separation(function (a, b) {
        return a.parent === b.parent ? 1 : 1.25
      })
    this.root = d3.hierarchy(this.data)
    treeLayout(this.root)
    this.drawPath()
    this.drawNodes()
    this.drawBalances()
  }

  /**
   * Destroi a árvore, removendo todos os nodes e conexões
   */
  cleanTree () {
    d3.select('svg g.nodes')
      .selectAll('circle')
      .remove()
    d3.select('svg g.links')
      .selectAll('line')
      .remove()
    d3.select('svg g.nodes')
      .selectAll('text')
      .remove()
  }

  /**
   * Seletores usados para construir e mudar elementos da árvore D3.js
   */
  selectArrowSide (d) {
    return d.target.data.value === nodesType.out
      ? 'url(#end-arrow)'
      : 'url(#start-arrow)'
  }

  selectStrokeColorPath = d => {
    return d.target.data.value === nodesType.out
      ? this.circleColor0
      : this.circleColor1
  };

  selectX1ByType = d => {
    return d.target.data.value === nodesType.in
      ? this.orientation.x(d.target)
      : this.orientation.x(d.source)
  };

  selectY1ByType = d => {
    return d.target.data.value === nodesType.in
      ? this.orientation.y(d.target)
      : this.orientation.y(d.source)
  };

  selectX2ByType = d => {
    return d.target.data.value === nodesType.in
      ? this.orientation.x(d.source)
      : this.orientation.x(d.target)
  };

  selectY2ByType = d => {
    return d.target.data.value === nodesType.in
      ? this.orientation.y(d.source)
      : this.orientation.y(d.target)
  };

  selectCxNode = d => {
    return this.orientation.x(d)
  };

  selectCyNode = d => {
    return this.orientation.y(d)
  };

  selectColorByType = d => {
    return d.data.value === nodesType.out
      ? this.circleColor0
      : this.circleColor1
  };

  /**
   * Seleciona a cor do nó de acordo com o atribuito classe
   */
  selectFillColorNodeByClass = d => {
    let color = 'white'
    this.optionSelect.class.forEach(function (item) {
      if (item.text === d.data.class) {
        color = item.color
        return true
      }
    })
    return color
  };

  /**
   * Muda o preenchimento do nó quando o usuário passa o mouse sobre
   */
  mouseoverNode = node => {
    this.hoverLastColor = d3.select(node).style('stroke')
    this.hoverLastColorClass = d3.select(node).style('fill')
    d3.select(node)
      .attr('fill', 'red')
      .attr('r', this.circleSize)
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .style('stroke-dasharray', '10,4')
  };

  /**
   * Limpa o preenchimento do nó quando o usuário tira o mouse do nó
   */
  mouseoutNode = (node, i, isBalance) => {
    if (this.balanceClicked.id === i) return true
    if (this.modal) return true

    let circle = this.circleSize
    if (isBalance) circle = (circle * 80) / 100

    d3.select(node)
      .attr('fill', this.hoverLastColorClass)
      .attr('r', circle)
      .style('stroke', this.hoverLastColor)
      .style('stroke-width', '4px')
      .style('stroke-dasharray', '0,0')
  };

  /**
   * Defini o nome do rótulo apresentado em cada nó
   */
  selectLabelOfNode = d => {
    if (d.data.idBalance > this.highestIdBalance) {
      this.highestIdBalance = d.data.idBalance
    }

    if (d.data.idBalance > 0 && !d.data.name) return d.data.idBalance

    if (d.data.idBalance > 0) {
      return d.data.name.substring(0, this.sizeLabel - 1)
    }

    return d.data.name.substring(0, this.sizeLabel)
  };

  /**
   * Centraliza o rótulo no eixo X em função da quantidade de letras
   */
  selectXLabel = d => {
    let shift = 0
    if (d.data.idBalance > 0) {
      shift = d.data.name.substring(0, this.sizeLabel - 1).length * 4
    } else shift = d.data.name.substring(0, this.sizeLabel).length * 4

    return shift === 0
      ? this.orientation.x(d) - 5
      : this.orientation.x(d) - shift - 1
  };

  /**
   * Centraliza o rótulo no eixo Y
   */
  selectYLabel = d => {
    return this.orientation.y(d) + 5
  };

  /**
   * Seleciona o contorno do nó balanço, caso seja do tipo não balanço deixa
   * transparente
   */
  selectStrokeColorBalance = d => {
    if (d.data.idBalance > 0) {
      return d.value === 0 ? this.circleColor0 : this.circleColor1
    } else return 'transparent'
  };

  /**
   * Desenha todas as linhas e setas da árvore que conectam os nós
   */
  drawPath () {
    this.links = d3
      .select('svg g.links')
      .selectAll('line.link')
      .data(this.root.links())
      .enter()
      .append('line')
      .classed('link', true)
      .style('marker-end', this.selectArrowSide)
      .style('stroke', this.selectStrokeColorPath)
      .attr('x1', this.selectX1ByType)
      .attr('x2', this.selectX2ByType)
      .attr('y1', this.selectY1ByType)
      .attr('y2', this.selectY2ByType)
  }

  /**
   * Desenha todos os nós da árvore
   */
  drawNodes () {
    let that = this
    let descendants = this.root.descendants()
    this.nodes = d3
      .select('svg g.nodes')
      .selectAll('circle.node')
      .data(descendants)
      .enter()
      .append('circle')
      .attr('cx', this.selectCxNode)
      .attr('cy', this.selectCyNode)
      .attr('r', that.circleSize)
      .style('stroke', this.selectColorByType)
      .attr('fill', this.selectFillColorNodeByClass)
      .style('stroke-width', '4px')
      .on('mouseover', function () {
        const node = this
        that.mouseoverNode(node)
      })
      .on('mouseout', function (_, i) {
        const node = this
        that.mouseoutNode(node, i)
      })
      .on('click', that.handleClickFunction)
  }

  /**
   * Desenha todos os nós balanços da árvore
   */
  drawBalances () {
    let that = this
    let descendants = this.root.descendants()
    this.highestIdBalance = 0

    const selectNodes = d3
      .select('svg g.nodes')
      .selectAll('circle.node')
      .data(descendants)
      .enter()

    selectNodes
      .append('text')
      .attr('font-size', '14px')
      .attr('font-family', 'PT Mono')
      .text(this.selectLabelOfNode)
      .attr('x', this.selectXLabel)
      .attr('y', this.selectYLabel)
      .attr('fill', this.selectColorByType)

    selectNodes
      .append('circle')
      .attr('cx', this.selectCxNode)
      .attr('cy', this.selectCyNode)
      .attr('r', (this.circleSize * 80) / 100)
      .style('stroke', this.selectStrokeColorBalance)
      .attr('fill', 'transparent')
      .style('stroke-width', '4px')
      .on('mouseover', function () {
        const node = this
        that.mouseoverNode(node)
      })
      .on('mouseout', function (_, i) {
        const node = this
        const isBalance = true
        that.mouseoutNode(node, i, isBalance)
      })
      .on('click', that.handleClickFunction)

    this.counterBalance = this.highestIdBalance + 1
  }

  /**
   * Redesenha a árvore após alguma modificação em algum nó
   */
  redrawTree (notSaveState) {
    if (!notSaveState) {
      history.saveState(this.data)
    }
    this.cleanTree()
    this.drawTree()
  }

  /**
   * Adiciona um novo nó filho ao nó selecionado
   */
  addChildrenNode (selected, i, nodeType) {
    if (!this.checkIfHavePermission(selected, nodeType)) {
      return false
    }

    let newNodeData = {
      children: [],
      value: nodeType,
      idBalance: 0,
      name: '',
      description: '',
      class: DEFAULT.class,
      resource: selected.data.resource,
      duration: DEFAULT.duration,
      factor: DEFAULT.factor
    }

    // Cria um novo nó com base em newNodeData usando d3.hierarchy()
    let newNode = d3.hierarchy(newNodeData)

    // Adiciona propriedades(filho, pai, altura) ao nó
    newNode.depth = selected.depth + 1
    newNode.height = selected.height - 1
    newNode.parent = selected
    newNode.id = Date.now()

    // Caso o nó selecionado não tenha filho criar os vetores para armazenar-los
    if (!selected.children) {
      selected.children = []
      selected.data.children = []
    }
    selected.children.push(newNode)
    selected.data.children.push(newNode.data)
    this.redrawTree()
  }

  /**
   * Remove o nó selecionado da árvore
   */
  removeChildrenNode (d) {
    if (d.depth === 0 || d.depth === 1) {
      this.msgAlertUser(error.cannotRemoveDefault)
      return false
    }

    if (d.data.idBalance > 0) {
      this.msgAlertUser(error.mustRemoveBalanceBefore)
      return false
    }

    if (this.checkIfIsCantRemoveNode(d)) {
      this.msgAlertUser(error.cannotRemoveLastChild)
      return false
    }

    if (d.children) {
      this.msgAlertUser(error.cannotRemoveIfHaveChildrens)
      return false
    }

    const index = d.parent.children.indexOf(d)
    d.parent.children.splice(index, 1)
    d.parent.data.children.splice(index, 1)

    this.redrawTree()
  }

  /**
   * Reseta a variavel responsavel por controlar qual foi o primeiro clique no
   * momento da criação do balanço
   */
  resetNodeTypeToBalanceSelect (notSaveState) {
    this.balanceClicked.id = null
    this.balanceClicked.d = null
    if (notSaveState) this.redrawTree(true)
    else this.redrawTree()
  }

  /**
   * Reseta a variável responsavel por controlar qual foi o primeiro clique no
   * momento da criação do balanço e redesenha a árvore após o segundo clique
   */
  joinBalance (balance1, balance2) {
    let descendants = this.root.descendants()
    let newId = 0
    let target = 0

    if (balance1.data.idBalance > balance2.data.idBalance) {
      target = balance1.data.idBalance
      newId = balance2.data.idBalance
    } else {
      target = balance2.data.idBalance
      newId = balance1.data.idBalance
    }

    descendants.forEach(d => {
      if (d.data.idBalance === target) d.data.idBalance = newId

      // Corrigi os id após remover um balanço
      if (d.data.idBalance > target) d.data.idBalance -= 1

      // Copia os dados do segundo clique para todos nós do balanço
      if (d.data.idBalance === newId) this.copyBalanceData(d, balance1)
    })

    this.counterBalance -= 1
  }

  /**
   * Copia os atribuitos do segundo nó clicado para o primeiro nó no momento
   * da criação do balanço
   */
  copyBalanceData (nodeClicked1, nodeClicked2) {
    nodeClicked1.data.name = nodeClicked2.data.name
    nodeClicked1.data.description = nodeClicked2.data.description
    nodeClicked1.data.class = nodeClicked2.data.class
    nodeClicked1.data.duration = nodeClicked2.data.duration
  }

  /**
   * Adiciona ao nó o tipo balanço, caso as regras de negócio sejam satisfeitas
   */
  changeNodeTypeToBalance (d, id) {
    this.counterBalanceClick += 1

    if (this.counterBalanceClick === 2) {
      this.counterBalanceClick = 0

      if (
        d.depth === 0 ||
        d.depth === 1 ||
        this.balanceClicked.d.depth === 0 ||
        this.balanceClicked.d.depth === 1
      ) {
        this.msgAlertUser(error.cannotAddBalanceInDefaultNodes)
        this.resetNodeTypeToBalanceSelect(true)
        return false
      }

      if (d.data.resource !== this.balanceClicked.d.data.resource) {
        this.msgAlertUser(error.cannotHaveBalanceWithDifferentRessources)
        this.resetNodeTypeToBalanceSelect(true)
        return false
      }

      if (
        d.data.idBalance > 0 &&
        d.data.idBalance === this.balanceClicked.d.data.idBalance
      ) {
        this.msgAlertUser(error.cannotCreateBalanceIfIsAlready)
        this.resetNodeTypeToBalanceSelect(true)
        return false
      }

      if (
        d.data.idBalance > 0 &&
        this.balanceClicked.d.data.idBalance > 0 &&
        d.data.value !== this.balanceClicked.d.data.value
      ) {
        // União de balanço
        this.joinBalance(d, this.balanceClicked.d)
        this.resetNodeTypeToBalanceSelect()
        return true
      }

      if (this.balanceClicked.d.data.idBalance > 0) {
        this.msgAlertUser(error.firstClickCannotBeBalance)
        this.resetNodeTypeToBalanceSelect(true)
        return false
      }

      if (!this.balanceClicked.d.children) {
        if (!d.children) {
          this.msgAlertUser(error.mustHaveChildren)
          // console.log("d value: " + d.data.value);
          // console.log("d lastvalue: " + this.balanceClicked.d.data.value);
          this.resetNodeTypeToBalanceSelect(true)
          return false
        }

        if (d.children && d.data.value !== this.balanceClicked.d.data.value) {
          this.msgAlertUser(error.mustStartwithChildren)
          this.resetNodeTypeToBalanceSelect(true)
          return false
        }
      } else {
        if (!d.children) {
          this.msgAlertUser(error.mixedMustBeDifferent)
          this.resetNodeTypeToBalanceSelect(true)
          return false
        }

        if (d.data.value === this.balanceClicked.d.data.value) {
          this.msgAlertUser(error.mixedMustBeDifferent)
          this.resetNodeTypeToBalanceSelect(true)
          return false
        }
      }

      if (d.data.idBalance > 0) {
        this.balanceClicked.d.data.idBalance = d.data.idBalance
      } else {
        d.data.idBalance = this.counterBalance
        this.balanceClicked.d.data.idBalance = this.counterBalance
        this.counterBalance += 1
      }

      this.copyBalanceData(this.balanceClicked.d, d)
      this.resetNodeTypeToBalanceSelect()
    } else {
      this.balanceClicked.id = id
      this.balanceClicked.d = d
    }
  }

  /**
   * Remove o nó o tipo balanço, caso as regras de negócio sejam satisfeitas
   */
  removeNodeTypeToBalance (d) {
    if (d.data.idBalance <= 0) return false

    const target = d.data.idBalance
    let descendants = this.root.descendants()
    let count = 0

    descendants.forEach(function (d) {
      if (d.data.idBalance === target) count++
    })

    if (count > 2 && d.children) {
      this.msgAlertUser(error.cannotRemoveFatherBalanceBigger2)
      return false
    }

    if (count > 2 && !d.children) {
      d.data.idBalance = 0
    } else {
      descendants.forEach(function (d) {
        if (d.data.idBalance === target) d.data.idBalance = 0

        // Corrigi os id após remover um balanço
        if (d.data.idBalance > target) d.data.idBalance -= 1
      })

      this.counterBalance -= 1
    }

    this.redrawTree()
  }

  /**
   * Verifica se tem permissão para adicionar um novo nó
   */
  checkIfHavePermission (fatherNode, newNodeType) {
    var fatherType = fatherNode.data.value

    // Não é possível incluir novas Arestas ao Vértice raiz
    if (fatherNode.depth === 0) {
      this.msgAlertUser(error.cannotInclude)
      return false
    }

    if (!fatherNode.children && fatherType !== newNodeType) {
      this.msgAlertUser(error.mustIsEqualFather)
      return false
    }

    return true
  }

  /**
   * Verifica se tem permissão para remover o nó
   */
  checkIfIsCantRemoveNode (node) {
    const qtdBrother = node.parent.children.length
    const typeFather = node.parent.data.value
    const typeNode = node.data.value
    const nodeTypeFather = node.parent.children.filter(
      n => n.data.value === typeFather
    )

    if (typeNode !== typeFather) {
      return false
    }

    if (nodeTypeFather.length === 1 && qtdBrother > 1) {
      return true
    }

    return false
  }

  /**
   * Salva o json com dados da árvore no localstorage
   */
  save () {
    localStorage.data = JSON.stringify(this.data)
  }

  /**
   * Carrega o json com dados da árvore do localstorage
   */
  load () {
    if (localStorage.data) {
      this.data = JSON.parse(localStorage.data)
    }
  }

  /**
   * Remove os dados da árvore do localstorage e redesenha a árvore
   */
  clean () {
    if (localStorage.data) {
      localStorage.removeItem('data')
    }
    this.counterBalance = 1
    this.inicializeData()
    this.redrawTree()
  }

  /**
   * Desfaz uma modificação realizada na árvore
   */
  undo () {
    if (history.canUndo()) history.undo()
    this.data = history.getState()
    this.redrawTree(true)
  }

  /**
   * Refaz uma modificação desfeita na árvore
   */
  redo () {
    if (history.canRedo()) history.redo()
    this.data = history.getState()
    this.redrawTree(true)
  }

  /**
   * Mensagem de alerta apresentada de acordo com as regras de negócio
   */
  msgAlertUser (msg) {
    this.error({
      type: 'warning',
      title: 'Oops...',
      text: msg
    })
  }

  /**
   * Gera uma chave para nó simples com o formatado da plataforma P+P
   */
  addKeyNode (d, numVertices, nodes) {
    let newNode = {
      chave: `n_${numVertices}_${d.data.name}_${d.data.description}`,
      formula: d.data.duration,
      stages: d.data.class
    }
    nodes.push(newNode)
  }

  /**
   * Gera uma chave para nó balanço com o formatado da plataforma P+P
   */
  addKeyBalance (d, numVertices, nodes) {
    if (!d.children) {
      let nodeName = `${d.data.value}_${d.data.idBalance}`
      let node = nodes.find(node => node.chave === nodeName)
      if (!node) {
        let newNode = {
          chave: `s${d.data.value}_${d.data.idBalance}_${d.data.name}_${d.data.description}`,
          formula: d.data.duration,
          stages: d.data.class
        }
        nodes.push(newNode)
      } else {
        console.log('balance=>terminal=>encontrou')
      }
    } else {
      let newNode = {
        chave: `b_${d.data.idBalance}_${d.data.name}_${d.data.description}`,
        formula: d.data.duration,
        stages: d.data.class
      }
      nodes.push(newNode)
    }
  }

  generateJsonPP () {
    let descendants = this.root.descendants()
    let links = this.root.links()

    let simulationData = {}
    let numVertices = 0

    simulationData.graph = {}
    simulationData.graph.nodes = []
    simulationData.graph.flow = []

    descendants.forEach(d => {
      numVertices = numVertices + 1

      if (!d.data.idBalance || d.data.idBalance === 0) {
        // É um nó simples
        this.addKeyNode(d, numVertices, simulationData.graph.nodes)
      } else {
        // É um nó balanço
        this.addKeyBalance(d, numVertices, simulationData.graph.nodes)
      }
    })

    console.log('====================')
    console.log(simulationData)
    console.log('====================')
  }

  readJsonPP (json) {
    /**
     * Codigo para reverter a chave gerada com junção do n_id_name_descricao
     * let test = newNode.chave.split("_");
     */
  }
}

export default D3Tree
