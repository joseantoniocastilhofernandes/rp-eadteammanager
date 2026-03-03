import { ReactNode } from 'react'
import Link from 'next/link'
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { Settings } from 'src/@core/context/settingsContext'
import themeConfig from 'src/configs/themeConfig'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
  verticalNavMenuBranding?: (props?: any) => ReactNode
}

const MenuHeaderWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(4.5),
  transition: 'padding .25s ease-in-out',
  minHeight: theme.mixins.toolbar.minHeight,
  backgroundColor: theme.palette.primary.main,
}))

const StyledLink = styled('a')({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  gap: '10px',
})

const LogoBadge = styled(Box)({
  width: 32, height: 32,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
})

const VerticalNavHeader = (props: Props) => {
  const { verticalNavMenuBranding: userVerticalNavMenuBranding } = props

  return (
    <MenuHeaderWrapper className='nav-header'>
      {userVerticalNavMenuBranding ? (
        userVerticalNavMenuBranding(props)
      ) : (
        <Link href='/empreendedores' passHref>
          <StyledLink>
            <LogoBadge>🎓</LogoBadge>
            <Typography sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.3px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {themeConfig.templateName}
            </Typography>
          </StyledLink>
        </Link>
      )}
    </MenuHeaderWrapper>
  )
}

export default VerticalNavHeader
