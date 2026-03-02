import { useState, useEffect } from 'react'
import axios from 'axios'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import MuiCard from '@mui/material/Card'

import EmailOutline from 'mdi-material-ui/EmailOutline'
import KeyOutline from 'mdi-material-ui/KeyOutline'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'
import { SERVICES_CONTEXT, setLoggedUser, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const MSGS_ERRO = {
  OTP_INVALIDO:                 'Código inválido. Verifique e tente novamente.',
  OTP_EXPIRADO:                 'Código expirado. Solicite um novo.',
  OTP_MAX_TENTATIVAS:           'Muitas tentativas incorretas. Solicite um novo código.',
  LOGINERROR_USUARIO_BLOQUEADO: 'Usuário bloqueado. Entre em contato com o seu patrocinador.',
  EMAIL_NAO_CADASTRADO:         'Este e-mail não está cadastrado no sistema.',
  RATE_LIMIT:                   'Muitas tentativas. Aguarde alguns minutos.',
  ERRO_INTERNO:                 'Erro interno. Tente novamente em instantes.',
}

const LoginPage = () => {
  const [etapa, setEtapa] = useState('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [emailErro, setEmailErro] = useState(false)
  const [reenvioSegundos, setReenvioSegundos] = useState(0)

  useEffect(() => {
    mixpanel.init(MIXPANEL_TOKEN)
    mixpanel.track('LoginPage_viewed')
    const user = sessionStorage.getItem('loggedUser')
    if (user) window.location.href = '/empreendedores'
  }, [])

  useEffect(() => {
    if (reenvioSegundos <= 0) return
    const t = setTimeout(() => setReenvioSegundos(s => s - 1), 1000)

    return () => clearTimeout(t)
  }, [reenvioSegundos])

  const solicitarOTP = async () => {
    const emailNorm = email.trim().toLowerCase()
    if (!emailNorm) { setEmailErro(true); setErro('Informe seu e-mail.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) { setEmailErro(true); setErro('E-mail inválido.'); return }
    setEmailErro(false); setErro(null); setCarregando(true)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/otp/solicitar`, { email: emailNorm })
      if (data.result?.error) {
        setErro(MSGS_ERRO[data.result.errorCodes?.[0]] || MSGS_ERRO.ERRO_INTERNO)
      } else {
        setEtapa('otp')
        setReenvioSegundos(60)
      }
    } catch { setErro(MSGS_ERRO.ERRO_INTERNO) }
    finally { setCarregando(false) }
  }

  const verificarOTP = async () => {
    if (!codigo.trim()) { setErro('Informe o código recebido por e-mail.'); return }
    setErro(null); setCarregando(true)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/otp/verificar`, {
        email: email.trim().toLowerCase(),
        codigo: codigo.trim(),
      })
      if (data.result?.error) {
        const cod = data.result.errorCodes?.[0]
        setErro(MSGS_ERRO[cod] || MSGS_ERRO.ERRO_INTERNO)
        if (cod === 'OTP_EXPIRADO' || cod === 'OTP_MAX_TENTATIVAS') {
          setTimeout(() => { setEtapa('email'); setCodigo(''); setErro(null) }, 2500)
        }
      } else {
        const user = data.result.user
        if (user.idNivelDeAcesso < 5) { setErro('Você não tem permissão para acessar este sistema.'); return }
        setLoggedUser(user)
        mixpanel.identify(user.idUsuario)
        mixpanel.track('LoginPage_userloged_successfully')
        mixpanel.people.set({ first_name: user.nomeCompleto, Email: user.email, idUsuario: user.idUsuario })
        window.location.href = '/empreendedores'
      }
    } catch { setErro(MSGS_ERRO.ERRO_INTERNO) }
    finally { setCarregando(false) }
  }

  return (
    <Box className='content-center' sx={{ backgroundColor: '#356fc0' }}>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center' }}>
            <Typography variant='h6' sx={{ fontWeight: 600, textAlign: 'center' }}>
              Gestão da Formação de Novos Distribuidores Royal Prestige
            </Typography>
          </Box>

          {etapa === 'email' ? (
            <>
              <Box sx={{ mb: 6 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>Seja bem-vindo! 👋🏻</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Digite seu e-mail para receber o código de acesso.
                </Typography>
              </Box>
              <Stack spacing={4}>
                <TextField fullWidth autoFocus label='E-mail' type='email' value={email} error={emailErro}
                  disabled={carregando}
                  onChange={e => { setEmail(e.target.value); setEmailErro(false); setErro(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') solicitarOTP() }}
                  InputProps={{ startAdornment: <InputAdornment position='start'><EmailOutline /></InputAdornment> }}
                />
                {erro && <Alert severity='error'>{erro}</Alert>}
                {carregando && <Stack spacing={1}><LinearProgress /><Typography variant='caption' sx={{ textAlign: 'center' }}>Enviando código...</Typography></Stack>}
                <Button fullWidth size='large' variant='contained' disabled={carregando} onClick={solicitarOTP}>
                  Enviar código
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Box sx={{ mb: 6 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>Verifique seu e-mail</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Enviamos um código para <strong>{email}</strong>
                </Typography>
              </Box>
              <Stack spacing={4}>
                <TextField fullWidth autoFocus label='Código de acesso' value={codigo} disabled={carregando}
                  onChange={e => { setCodigo(e.target.value); setErro(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') verificarOTP() }}
                  inputProps={{ maxLength: 6, style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' } }}
                  InputProps={{ startAdornment: <InputAdornment position='start'><KeyOutline /></InputAdornment> }}
                />
                {erro && <Alert severity='error'>{erro}</Alert>}
                {carregando && <Stack spacing={1}><LinearProgress /><Typography variant='caption' sx={{ textAlign: 'center' }}>Verificando código...</Typography></Stack>}
                <Button fullWidth size='large' variant='contained' disabled={carregando} onClick={verificarOTP}>
                  Entrar
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button size='small' variant='text' onClick={() => { setEtapa('email'); setCodigo(''); setErro(null) }}>
                    ← Trocar e-mail
                  </Button>
                  <Button size='small' variant='text' disabled={reenvioSegundos > 0 || carregando}
                    onClick={() => { setCodigo(''); solicitarOTP() }}>
                    {reenvioSegundos > 0 ? `Reenviar em ${reenvioSegundos}s` : 'Reenviar código'}
                  </Button>
                </Box>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default LoginPage
