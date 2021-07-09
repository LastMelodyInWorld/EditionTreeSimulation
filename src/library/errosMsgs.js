const error = {
  cannotRemoveDefault: 'Não é possível excluir os dois primeiros vértices.',
  cannotRemoveLastChild:
    'Não é possível excluir o último filho de mesmo tipo enquanto houver outro de tipo oposto.',
  cannotRemoveIfHaveChildrens: 'Não é possível excluir vértice com filhos.',
  cannotInclude: 'Não é possível adicionar vértice na raiz.',
  mustIsEqualFather:
    'O primeiro filho adicionado deve ser de mesmo tipo do pai.',
  cannotRemoveFatherBalanceBigger2:
    'Não pode remover nó pai de um balanço composto por mais de 2 nós.',
  cannotAddBalanceInDefaultNodes:
    'Não é possível adicionar balanço aos dois primeiros vértices.',
  cannotHaveBalanceWithDifferentRessources:
    'Não é possível adicionar balanço com recursos diferentes.',
  mustRemoveBalanceBefore:
    'Não é possível excluir vértice associado a balanço.',
  cannotCreateBalanceIfIsAlready:
    'Não é possível adicionar um vértice que já pertence ao balanço.',
  isNotBalance: 'Não é possível excluir balanço de vértice que não é balanço.',
  cannotAddNodeInBalanceChildren:
    'Não é possível adicionar vértice a terminal de balanço.',
  cannotFirstClickedNonTerminal:
    'Balanço tem que começar com terminal.',
  cannotClickedTwoNonTerminal:
    'Balanço não pode ser feito em dois nós terminais.'
}

export default error
