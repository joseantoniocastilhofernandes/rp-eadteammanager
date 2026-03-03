import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

const FooterContent = () => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
        {`© ${new Date().getFullYear()} Estude Onde Quiser`}
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Link
          href='https://ead.estudeondequiser.com.br'
          target='_blank'
          rel='noopener noreferrer'
          sx={{ fontSize: '0.875rem', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Acessar o EAD
        </Link>
        <Link
          href='https://wa.me/551999393686'
          target='_blank'
          rel='noopener noreferrer'
          sx={{ fontSize: '0.875rem', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Suporte via WhatsApp
        </Link>
      </Box>
    </Box>
  )
}

export default FooterContent
