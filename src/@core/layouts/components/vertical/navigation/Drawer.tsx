import { ReactNode } from 'react'
import { styled, useTheme } from '@mui/material/styles'
import MuiSwipeableDrawer, { SwipeableDrawerProps } from '@mui/material/SwipeableDrawer'
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  hidden: boolean
  navWidth: number
  settings: Settings
  navVisible: boolean
  children: ReactNode
  setNavVisible: (value: boolean) => void
  saveSettings: (values: Settings) => void
}

const SwipeableDrawer = styled(MuiSwipeableDrawer)<SwipeableDrawerProps>({
  overflowX: 'hidden',
  transition: 'width .25s ease-in-out',
  '& ul': { listStyle: 'none' },
  '& .MuiListItem-gutters': { paddingLeft: 4, paddingRight: 4 },
  '& .MuiDrawer-paper': {
    left: 'unset',
    right: 'unset',
    overflowX: 'hidden',
    transition: 'width .25s ease-in-out, box-shadow .25s ease-in-out'
  }
})

// Desktop: div simples no fluxo normal, sem position fixed
const DesktopSidebar = styled('div')(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  borderRight: '1px solid #e2e8f0',
  backgroundColor: theme.palette.background.default,
  '& ul': { listStyle: 'none' },
  '& .MuiListItem-gutters': { paddingLeft: 4, paddingRight: 4 },
}))

const Drawer = (props: Props) => {
  const { hidden, children, navWidth, navVisible, setNavVisible } = props
  const theme = useTheme()

  if (!hidden) {
    return (
      <DesktopSidebar className='layout-vertical-nav'>
        {children}
      </DesktopSidebar>
    )
  }

  return (
    <SwipeableDrawer
      className='layout-vertical-nav'
      variant='temporary'
      open={navVisible}
      onOpen={() => setNavVisible(true)}
      onClose={() => setNavVisible(false)}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: navWidth } }}
      sx={{
        '& .MuiDrawer-paper': {
          borderRight: '1px solid #e2e8f0',
          backgroundColor: theme.palette.background.default,
        }
      }}
    >
      {children}
    </SwipeableDrawer>
  )
}

export default Drawer
