import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined'

import {
  carregarAula, editarAula, excluirAula, trocarVideoDaAula, statusDaAula, mensagemDeErro,
} from 'src/services/gestaoCursos'
import { enviarVideo, formatarDuracao } from 'src/services/uploadVideo'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

function situacao(status, duracao) {
  if (status === 'processando') {
    return {
      icone: <HourglassEmptyIcon sx={{ color: 'warning.main' }} />,
      texto: 'Preparando o vídeo',
      detalhe: 'A conversão leva alguns minutos. Você pode sair desta tela.',
    }
  }
  if (status === 'erro') {
    return {
      icone: <ErrorOutlineIcon sx={{ color: 'error.main' }} />,
      texto: 'O vídeo falhou',
      detalhe: 'Envie o arquivo novamente.',
    }
  }
  if (status === 'enviando') {
    return {
      icone: <VideocamOffOutlinedIcon sx={{ color: 'text.disabled' }} />,
      texto: 'Sem vídeo',
      detalhe: 'Esta aula ainda não tem vídeo enviado.',
    }
  }

  return {
    icone: <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />,
    texto: 'Vídeo pronto',
    detalhe: formatarDuracao(duracao) || null,
  }
}

const EditarAula = () => {
  const router = useRouter()
  const { idCurso, idAula } = router.query

  const [aula, setAula] = useState(null)
  const [nome, setNome] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [progresso, setProgresso] = useState(null)
  const [confirmar, setConfirmar] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    if (idAula) buscar()
  }, [idAula])

  // enquanto processa, pergunta de novo
  useEffect(() => {
    if (aula?.statusVideo !== 'processando') return
    const timer = setInterval(async () => {
      try {
        const info = await statusDaAula(idAula)
        if (info.status !== 'processando') {
          setAula((a) => ({ ...a, statusVideo: info.status, duracaoSegundos: info.duracaoSegundos }))
        }
      } catch { /* tenta de novo */ }
    }, 10000)

    return () => clearInterval(timer)
  }, [aula?.statusVideo, idAula])

  const buscar = async () => {
    setCarregando(true)
    try {
      const dados = await carregarAula(idAula)
      setAula(dados.aula)
      setNome(dados.aula.nome)
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const salvarNome = async () => {
    if (!nome.trim() || nome.trim() === aula.nome) return
    setSalvando(true)
    setErro('')
    try {
      await editarAula(idAula, nome.trim())
      setAula((a) => ({ ...a, nome: nome.trim() }))
      setAviso('Título salvo.')
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setSalvando(false)
    }
  }

  const escolherArquivo = () => {
    inputRef.current.value = ''
    inputRef.current.click()
  }

  const aoEscolherArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setErro('')
    setAviso('')
    setProgresso(0)
    try {
      const novo = await trocarVideoDaAula(idAula)
      await enviarVideo(arquivo, novo.upload, {
        titulo: aula.nome,
        aoProgredir: setProgresso,
      })
      setProgresso(null)
      setAula((a) => ({ ...a, idVideo: novo.idVideo, statusVideo: 'processando', duracaoSegundos: null, urlPlayer: novo.urlPlayer }))
      setAviso('Vídeo enviado. Estamos preparando para exibição.')
    } catch (err) {
      setProgresso(null)
      setErro(mensagemDeErro(err) || 'O envio falhou. Tente novamente.')
    }
  }

  const remover = async () => {
    try {
      await excluirAula(idAula)
      router.push(`/cursos/${idCurso}`)
    } catch (err) {
      setErro(mensagemDeErro(err))
      setConfirmar(false)
    }
  }

  if (carregando) return <Box sx={{ py: 6 }}><LinearProgress /></Box>
  if (!aula) return <Alert severity='error' sx={fonte}>{erro || 'Aula não encontrada.'}</Alert>

  const info = situacao(aula.statusVideo, aula.duracaoSegundos)
  const enviando = progresso !== null

  return (
    <Box sx={{ maxWidth: 820 }}>
      <input ref={inputRef} type='file' accept='video/*' style={{ display: 'none' }} onChange={aoEscolherArquivo} />

      <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 0.5 }}>
        <IconButton size='small' onClick={() => router.push(`/cursos/${idCurso}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ ...fonte, fontWeight: 700 }}>Editar aula</Typography>
      </Stack>

      <Breadcrumbs sx={{ ...fonte, ml: 5, mb: 4 }}>
        <Link
          component='button' underline='hover' color='inherit'
          onClick={() => router.push(`/cursos/${idCurso}`)}
          sx={{ ...fonte, fontSize: 14 }}
        >
          {aula.nomeCurso}
        </Link>
        <Typography sx={{ ...fonte, fontSize: 14, color: 'text.secondary' }}>
          {aula.nomeModulo}
        </Typography>
      </Breadcrumbs>

      {erro && <Alert severity='error' onClose={() => setErro('')} sx={{ mb: 3, ...fonte }}>{erro}</Alert>}
      {aviso && <Alert severity='success' onClose={() => setAviso('')} sx={{ mb: 3, ...fonte }}>{aviso}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography sx={{ ...fonte, fontWeight: 600, mb: 2 }}>Título da aula</Typography>
          <Stack direction='row' spacing={2}>
            <TextField
              fullWidth value={nome} onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && salvarNome()}
              helperText='É o que o aluno vê na lista de aulas'
            />
            <Box>
              <Button
                variant='contained' startIcon={<SaveOutlinedIcon />}
                onClick={salvarNome} disabled={salvando || !nome.trim() || nome.trim() === aula.nome}
                sx={{ ...fonte, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Salvar
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
            <Typography sx={{ ...fonte, fontWeight: 600 }}>Vídeo</Typography>
            <Button
              variant='outlined' startIcon={<SwapHorizIcon />}
              onClick={escolherArquivo} disabled={enviando}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              {aula.statusVideo === 'enviando' ? 'Enviar vídeo' : 'Trocar vídeo'}
            </Button>
          </Stack>

          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 3 }}>
            {info.icone}
            <Box>
              <Typography sx={{ ...fonte, fontWeight: 500 }}>{info.texto}</Typography>
              {info.detalhe && (
                <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                  {info.detalhe}
                </Typography>
              )}
            </Box>
          </Stack>

          {enviando && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                Enviando {progresso}% — não feche esta página
              </Typography>
              <LinearProgress variant='determinate' value={progresso} sx={{ mt: 0.5, borderRadius: 1 }} />
            </Box>
          )}

          {aula.urlPlayer && aula.statusVideo === 'pronto' && !enviando && (
            <Box
              sx={{
                position: 'relative', width: '100%', pt: '56.25%',
                borderRadius: 1, overflow: 'hidden', bgcolor: '#000',
              }}
            >
              <Box
                component='iframe'
                src={aula.urlPlayer}
                allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen'
                allowFullScreen
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Box>
          <Typography sx={{ ...fonte, fontWeight: 600 }}>Excluir esta aula</Typography>
          <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
            A aula e o vídeo saem do curso. Não tem volta.
          </Typography>
        </Box>
        <Button
          color='error' variant='outlined' startIcon={<DeleteOutlineIcon />}
          onClick={() => setConfirmar(true)} disabled={enviando}
          sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
        >
          Excluir aula
        </Button>
      </Stack>

      <Dialog open={confirmar} onClose={() => setConfirmar(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>Excluir aula?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={fonte}>
            A aula &quot;{aula.nome}&quot; e o vídeo dela serão apagados. Isso não tem volta.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmar(false)} sx={{ ...fonte, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant='contained' color='error' onClick={remover}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EditarAula
