const error = {
  cannotRemoveDefault: 'Aresta definida por padrão e não pode ser removida!',
  cannotRemoveLastChild:
    'O último filho de uma aresta de um tipo só pode ser excluído se não tiver nenhum filho do outro tipo!',
  cannotRemoveIfHaveChildrens: 'Não pode remover aresta com filhos!',
  cannotInclude: 'Não é possível incluir novas Arestas ao Vértice raiz!',
  mustIsEqualFather:
    'A primeira aresta filha deve ter o tipo igual a aresta pai!',
  cannotHaveChildren: 'Primeiro nó balanço não pode ter filhos',
  mustHaveChildren: 'Segundo nó balanço deve ter filhos',
  mustStartwithChildren: 'Balanço misto deve começar com nó não terminal',
  mixedMustBeDifferent:
    'Balanço que começa com nó não terminal deve ser misto e ter segundo nó não terminal de tipo contrário',
  cannotStartBalanceWithBalance:
    'O balanço deve sempre começar de um nó não balanço',
  cannotRemoveFatherBalanceBigger2:
    'Não pode remover nó pai de um balanço composto por mais de 2 nós',
  cannotAddBalanceInDefaultNodes:
    'Não pode adicionar balanço em aresta definida por padrão',
  cannotHaveBalanceWithDifferentRessources:
    'Não pode ter balanço com recursos diferentes',
  mustRemoveBalanceBefore: 'Não pode remover nó antes de remover o balanço',
  cannotCreateBalanceIfIsAlready:
    'Não pode adicionar no balanço um nó que já pertence ao balanço',
  firstClickCannotBeBalance:
    'o primeiro clique do balanço só pode ser nó balanço em caso de balanço misto'
}

export default error
