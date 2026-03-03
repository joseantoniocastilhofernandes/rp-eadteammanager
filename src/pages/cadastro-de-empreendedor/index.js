import { useState } from 'react'
import axios from 'axios'
import { SERVICES_CONTEXT, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'

const MSGS_ERRO = {
  EMAIL_JA_CADASTRADO:  'Este e-mail já está cadastrado no sistema.',
  PATROCINADOR_INVALIDO: 'Sessão inválida. Faça login novamente.',
  SEM_PERMISSAO:        'Você não tem permissão para cadastrar empreendedores.',
  CAMPOS_OBRIGATORIOS:  'Preencha todos os campos obrigatórios.',
  ERRO_INTERNO:         'Erro interno. Tente novamente em instantes.',
}

// Máscara de celular: (00) 00000-0000
function aplicarMascaraCelular(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2)  return `(${nums}`
  if (nums.length <= 7)  return `(${nums.slice(0,2)}) ${nums.slice(2)}`
  if (nums.length <= 11) return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
  return valor
}

export default function CadastroDeEmpreendedor() {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [isDistribuidor, setIsDistribuidor] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(false)

  const handleCelular = (e) => {
    setCelular(aplicarMascaraCelular(e.target.value))
  }

  const handleSubmit = async () => {
    if (!nome.trim() || !email.trim()) {
      setErro(MSGS_ERRO.CAMPOS_OBRIGATORIOS); return
    }
    const emailNorm = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      setErro('Informe um e-mail válido.'); return
    }

    const user = JSON.parse(sessionStorage.getItem('loggedUser') || '{}')
    if (!user?.idUsuario) { window.location.href = '/'; return }

    setErro(null); setSalvando(true)
    try {
      mixpanel.init(MIXPANEL_TOKEN)
      const { data } = await axios.post(`${SERVICES_CONTEXT}/empreendedor/cadastrar`, {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: emailNorm,
        celular: celular.replace(/\D/g, ''), // envia só números
        isLider: isDistribuidor,
        idPatrocinador: user.idUsuario,
      })
      if (data.result?.error) {
        setErro(MSGS_ERRO[data.result.errorCodes?.[0]] || MSGS_ERRO.ERRO_INTERNO)
      } else {
        mixpanel.track('Cadastrou Empreendedor')
        setSucesso(true)
      }
    } catch { setErro(MSGS_ERRO.ERRO_INTERNO) }
    finally { setSalvando(false) }
  }

  const resetar = () => {
    setNome(''); setSobrenome(''); setEmail('')
    setCelular(''); setIsDistribuidor(false); setSucesso(false); setErro(null)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => { window.location.href = '/empreendedores' }}
          sx={{ color: 'var(--gray-500)', minWidth: 0, px: 1 }}
          size='small'
        >
          Voltar
        </Button>
        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
        <Box>
          <Typography variant='h5' fontWeight={700} fontFamily='DM Sans, sans-serif'>
            Adicionar empreendedor
          </Typography>
          <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
            O empreendedor receberá acesso ao EAD automaticamente por e-mail.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

        {/* Formulário */}
        <Box sx={{
          flex: 1, background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
          p: 4,
        }}>
          {sucesso ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'var(--green-accent)', mb: 2 }} />
              <Typography variant='h6' fontWeight={700} fontFamily='DM Sans, sans-serif' mb={1}>
                Empreendedor adicionado!
              </Typography>
              <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif' mb={3}>
                Um e-mail com as instruções de acesso ao EAD foi enviado para <strong>{email}</strong>.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant='outlined' onClick={resetar}>Adicionar outro</Button>
                <Button variant='contained' onClick={() => { window.location.href = '/empreendedores' }}>
                  Ver equipe
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant='body2' fontWeight={600} fontFamily='DM Sans, sans-serif'
                color='text.secondary' textTransform='uppercase' letterSpacing='0.8px' mb={2.5}>
                Dados do empreendedor
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField
                  label='Nome *' value={nome} disabled={salvando} autoFocus
                  onChange={e => { setNome(e.target.value); setErro(null) }}
                  size='small' fullWidth
                />
                <TextField
                  label='Sobrenome' value={sobrenome} disabled={salvando}
                  onChange={e => setSobrenome(e.target.value)}
                  size='small' fullWidth
                />
              </Box>

              <TextField
                label='E-mail *' type='email' value={email} disabled={salvando}
                onChange={e => { setEmail(e.target.value); setErro(null) }}
                size='small' fullWidth sx={{ mb: 2 }}
              />

              <TextField
                label='Celular' value={celular} disabled={salvando}
                onChange={handleCelular}
                size='small' fullWidth sx={{ mb: 3 }}
                placeholder='(00) 00000-0000'
                inputProps={{ inputMode: 'numeric' }}
              />

              <Divider sx={{ mb: 2.5 }} />

              <Typography fontWeight={600} fontSize={13} fontFamily='DM Sans, sans-serif'
                color='text.secondary' textTransform='uppercase' letterSpacing='0.8px' mb={1.5}>
                Qual é o perfil desta pessoa?
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 0.5 }}>
                {/* Card: Empreendedor */}
                <Box
                  component='button'
                  onClick={() => setIsDistribuidor(false)}
                  sx={{
                    border: `2px solid ${!isDistribuidor ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    p: 2,
                    cursor: 'pointer',
                    background: !isDistribuidor ? '#eff6ff' : '#fff',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    outline: 'none',
                    width: '100%',
                    '&:hover': { borderColor: '#2563eb', background: '#eff6ff' },
                  }}
                >
                  <Typography fontSize={22} mb={0.75}>🌱</Typography>
                  <Typography fontWeight={700} fontSize={13.5} fontFamily='DM Sans, sans-serif'
                    color={!isDistribuidor ? '#2563eb' : '#334155'}>
                    Empreendedor
                  </Typography>
                  <Typography variant='caption' color='text.secondary' fontFamily='DM Sans, sans-serif'
                    lineHeight={1.4} display='block' mt={0.25}>
                    Está começando na rede. Estuda e desenvolve habilidades.
                  </Typography>
                </Box>

                {/* Card: Distribuidor */}
                <Box
                  component='button'
                  onClick={() => setIsDistribuidor(true)}
                  sx={{
                    border: `2px solid ${isDistribuidor ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    p: 2,
                    cursor: 'pointer',
                    background: isDistribuidor ? '#eff6ff' : '#fff',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    outline: 'none',
                    width: '100%',
                    '&:hover': { borderColor: '#2563eb', background: '#eff6ff' },
                  }}
                >
                  <Typography fontSize={22} mb={0.75}>🚀</Typography>
                  <Typography fontWeight={700} fontSize={13.5} fontFamily='DM Sans, sans-serif'
                    color={isDistribuidor ? '#2563eb' : '#334155'}>
                    Distribuidor
                  </Typography>
                  <Typography variant='caption' color='text.secondary' fontFamily='DM Sans, sans-serif'
                    lineHeight={1.4} display='block' mt={0.25}>
                    Lidera uma equipe e pode adicionar novos empreendedores.
                  </Typography>
                </Box>
              </Box>

              {erro && (
                <Alert severity='error' sx={{ mt: 2.5, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                  {erro}
                </Alert>
              )}

              {salvando && <LinearProgress sx={{ mt: 2.5, borderRadius: 4 }} />}

              <Button
                variant='contained' fullWidth size='large'
                disabled={salvando} onClick={handleSubmit}
                endIcon={<PersonAddAltIcon />}
                sx={{ mt: 3 }}
              >
                {salvando ? 'Salvando...' : 'Adicionar empreendedor'}
              </Button>
            </>
          )}
        </Box>

        {/* Card informativo lateral */}
        <Box sx={{
          width: 280, flexShrink: 0,
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
          p: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--blue-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SchoolOutlinedIcon sx={{ fontSize: 20, color: 'var(--blue-primary)' }} />
            </Box>
            <Typography fontWeight={700} fontSize={14} fontFamily='DM Sans, sans-serif'>
              O que acontece após o cadastro?
            </Typography>
          </Box>

          {[
            'O empreendedor recebe um e-mail com boas-vindas',
            'O acesso ao EAD é liberado automaticamente',
            'Ele faz login sem senha — só com código por e-mail',
            'Você pode acompanhar o progresso dele aqui',
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: '1px',
                background: 'var(--blue-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'var(--blue-primary)' }}>
                  {i + 1}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif' lineHeight={1.5}>
                {item}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />
          <Chip label='Acesso EAD incluído' size='small'
            sx={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 11 }} />
        </Box>

      </Box>
    </Box>
  )
}
