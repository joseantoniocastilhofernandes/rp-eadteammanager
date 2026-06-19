// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from 'mdi-material-ui/Menu'

// ** Layout Imports
import VerticalLayout from 'src/@core/layouts/VerticalLayout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

interface Props {
  children: ReactNode
}

const Header = ({ hidden, toggleNavVisibility }: { hidden: boolean, toggleNavVisibility: () => void }) => (
  <div style={{
    width: '100%',
    height: 64,
    background: 'linear-gradient(90deg, #1e3a5f 0%, #1d4ed8 60%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    zIndex: 1300,
    position: 'relative',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {hidden && (
        <IconButton color='inherit' onClick={toggleNavVisibility} sx={{ ml: -1, color: '#fff' }}>
          <Menu />
        </IconButton>
      )}
      <img src='/images/logos/logo_fw.png' alt='logo' style={{ height: 28, width: 'auto' }} />
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
        Estude Onde Quiser
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <NotificationDropdown />
      <UserDropdown />
    </div>
  </div>
)

const UserLayout = ({ children }: Props) => {
  const { settings, saveSettings } = useSettings()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  return (
    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={VerticalNavItems()}
      verticalAppBarContent={(props) => (
        <Header hidden={hidden} toggleNavVisibility={props.toggleNavVisibility} />
      )}
    >
      {children}
    </VerticalLayout>
  )
}

export default UserLayout
