import { useState } from 'react'

/**
 * Arrastar e soltar para reordenar listas.
 *
 * Usa os eventos nativos do HTML5 em vez de uma biblioteca: a lista é
 * simples, vertical e curta, e não vale acrescentar dependência ao projeto
 * por causa disso.
 *
 * Uso:
 *   const arrastar = useReordenar(itens, (novaOrdem) => salvar(novaOrdem))
 *   <div {...arrastar.props(item.id, indice)}>
 *
 * O salvar recebe o array de ids na ordem nova, e só é chamado quando a
 * posição realmente mudou.
 */
export function useReordenar(itens, aoSoltar, { chave = 'id' } = {}) {
  const [arrastando, setArrastando] = useState(null)
  const [alvo, setAlvo] = useState(null)

  const reordenar = (de, para) => {
    const copia = [...itens]
    const [movido] = copia.splice(de, 1)
    copia.splice(para, 0, movido)

    return copia
  }

  const props = (id, indice) => ({
    draggable: true,
    onDragStart: (e) => {
      setArrastando(indice)
      e.dataTransfer.effectAllowed = 'move'
      // Firefox só inicia o arrasto se houver dado no dataTransfer
      e.dataTransfer.setData('text/plain', String(id))
    },
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (indice !== alvo) setAlvo(indice)
    },
    onDrop: (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (arrastando === null || arrastando === indice) {
        setArrastando(null)
        setAlvo(null)

        return
      }
      const nova = reordenar(arrastando, indice)
      setArrastando(null)
      setAlvo(null)
      aoSoltar(nova.map((i) => i[chave]), nova)
    },
    onDragEnd: () => {
      setArrastando(null)
      setAlvo(null)
    },
    style: {
      opacity: arrastando === indice ? 0.4 : 1,
      borderTop: alvo === indice && arrastando !== null && arrastando !== indice
        ? '2px solid var(--mui-palette-primary-main, #666)'
        : '2px solid transparent',
      transition: 'opacity .15s',
    },
  })

  return { props, arrastando }
}
