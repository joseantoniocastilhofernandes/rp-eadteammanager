import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import ShieldAccountOutline from 'mdi-material-ui/ShieldAccountOutline'

import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  let user = null
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('loggedUser')
      if (stored) user = JSON.parse(stored)
    } catch {}
  }

  const isAdmin = user?.idNivelDeAcesso >= 6

  const items: VerticalNavItemsType = [
    {
      title: 'Minha equipe',
      icon: HomeOutline,
      path: '/empreendedores',
    },
    {
      title: 'Adicionar empreendedor',
      icon: AccountPlusOutline,
      path: '/cadastro-de-empreendedor',
    },
  ]

  if (isAdmin) {
    items.push({
      title: 'Gestão de acessos',
      icon: ShieldAccountOutline,
      path: '/admin',
    })
  }

  return items
}

export default navigation
