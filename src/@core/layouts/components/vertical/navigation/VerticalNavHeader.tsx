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
  display: 'none',
}))

const StyledLink = styled('a')({
  display: 'none',
})

const LogoBadge = styled('img')({
  height: 28,
  width: 'auto',
  maxWidth: 140,
  objectFit: 'contain',
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
            <LogoBadge src='/images/logos/logo_fw.png' alt='Estude Onde Quiser' />
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
