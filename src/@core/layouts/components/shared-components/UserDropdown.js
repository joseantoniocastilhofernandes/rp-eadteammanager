import { useState, Fragment } from 'react'

import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import GroupsIcon from '@mui/icons-material/Groups'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'

import { MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null)

  const user = (() => {
    try {
      const s = sessionStorage.getItem('loggedUser')

      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })()

  const nomeCompleto = user?.nomeCompleto || 'Usuário'

  const styles = {
    py: 2, px: 4, width: '100%',
    display: 'flex', alignItems: 'center',
    color: 'text.primary', textDecoration: 'none',
    '& svg': { fontSize: '1.375rem', color: 'text.secondary' }
  }

  const logout = () => {
    mixpanel.init(MIXPANEL_TOKEN)
    mixpanel.track('Logout')
    mixpanel.reset()
    sessionStorage.removeItem('loggedUser')
    window.location.href = '/'
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={e => setAnchorEl(e.currentTarget)}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar alt={nomeCompleto} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
          {nomeCompleto.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                {nomeCompleto.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <Box sx={{ ml: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>{nomeCompleto}</Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {user?.idNivelDeAcesso >= 6 ? 'Administrador' : 'Líder'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mt: 0, mb: 1 }} />

        <MenuItem sx={{ p: 0 }} onClick={() => { window.location.href = '/empreendedores'; setAnchorEl(null) }}>
          <Box sx={styles}>
            <GroupsIcon sx={{ marginRight: 2 }} />
            Minha equipe
          </Box>
        </MenuItem>

        <Divider />

        <MenuItem sx={{ py: 2 }} onClick={logout}>
          <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          Sair
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
