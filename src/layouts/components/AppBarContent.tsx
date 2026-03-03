import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'

import LogoutIcon from '@mui/icons-material/Logout'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#10b981',
    color: '#10b981',
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: `2px solid #fff`,
    '&::after': {
      position: 'absolute',
      top: 0, left: 0,
      width: '100%', height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}))

const AppBarContent = () => {
  const getUserFromSession = () => {
    if (typeof window === 'undefined') return null
    try {
      const stored = sessionStorage.getItem('loggedUser')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  }

  const user = getUserFromSession()
  const nomeCompleto = user?.nomeCompleto || ''
  const inicial = nomeCompleto.charAt(0).toUpperCase() || '?'

  // Futuramente: buscar foto do WhatsApp via API
  // const fotoUrl = user?.fotoWhatsapp || null

  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser')
    window.location.href = '/'
  }

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 1,
    }}>

      {/* Nome do usuário — oculto em mobile */}
      {nomeCompleto && (
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 0.5 }}>
          <Typography fontSize={13} fontWeight={600} fontFamily='DM Sans, sans-serif' lineHeight={1.3}>
            {nomeCompleto.split(' ')[0]}
          </Typography>
          <Typography fontSize={11} color='text.secondary' fontFamily='DM Sans, sans-serif'>
            Gestor de equipe
          </Typography>
        </Box>
      )}

      {/* Avatar com badge online */}
      <OnlineBadge
        overlap='circular'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant='dot'
      >
        <Avatar
          sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'default',
          }}
          // src={fotoUrl} — descomentar quando integrar WhatsApp API
        >
          {inicial || <PersonOutlineIcon fontSize='small' />}
        </Avatar>
      </OnlineBadge>

      {/* Botão de logout */}
      <Tooltip title='Sair'>
        <IconButton
          size='small'
          onClick={handleLogout}
          sx={{
            ml: 0.5,
            color: 'text.secondary',
            '&:hover': { color: '#ef4444', background: '#fee2e2' },
          }}
        >
          <LogoutIcon fontSize='small' />
        </IconButton>
      </Tooltip>

    </Box>
  )
}

export default AppBarContent
