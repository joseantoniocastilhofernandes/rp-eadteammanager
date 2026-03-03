import { ThemeColor } from 'src/@core/layouts/types'

type ThemeConfig = {
  templateName: string
  mode: 'light' | 'dark'
  routingLoader: boolean
  disableRipple: boolean
  navigationSize: number
  menuTextTruncate: boolean
  contentWidth: 'full' | 'boxed'
  responsiveFontSizes: boolean
  themeColor: ThemeColor
}

const themeConfig: ThemeConfig = {
  templateName: 'Estude Onde Quiser',
  mode: 'light',
  routingLoader: true,
  disableRipple: false,
  navigationSize: 260,
  menuTextTruncate: true,
  contentWidth: 'boxed',
  responsiveFontSizes: true,
  themeColor: 'primary',
}

export default themeConfig
