// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import Typography from '@mui/material/Typography'

// ** Icons Imports
import Menu from 'mdi-material-ui/Menu'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const hiddenSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {hidden ? (
          <IconButton color='inherit' onClick={toggleNavVisibility} sx={{ ml: -2.75 }}>
            <Menu />
          </IconButton>
        ) : null}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component='img'
            src='/images/logos/logo_fw.png'
            alt='Estude Onde Quiser'
            sx={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
            Estude Onde Quiser
          </Typography>
        </Box>
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default AppBarContent
