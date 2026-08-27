import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'

import {
  carregarModulo, editarModulo, criarAula, excluirAula, reordenarAulas,
  statusDaAula, criarProva, mensagemDeErro,
} from 'src/services/gestaoCursos'
import { enviarVideo, formatarDuracao } from 'src/services/uploadVideo'
import { useReordenar } from 'src/hooks/useReordenar'

const fonte = { fontFamily: 'DM Sans, sans-serif' }
const STATUS_LIBERADO = 1
const STATUS_RASCUNHO = 4

function situacaoDoVideo(aula, envio) {
  if (envio !== undefined) {
    return { icone: <HourglassEmptyIcon sx={{ fontSize: 18, color: 'info.main' }} />, texto: `Enviando ${envio}%` }
  }
  if (aula.statusVideo === 'processando') {
    return { icone: <HourglassEmptyIcon sx={{ fontSize: 18, color: 'warning.main' }} />, texto: 'Preparando o vídeo' }
  }
  if (aula.statusVideo === 'erro') {
    return { icone: <ErrorOutlineIcon sx={{ fontSize: 18, color: 'error.main' }} />, texto: 'Falhou. Refaça o envio' }
  }
  if (aula.statusVideo === 'enviando') {
    return { icone: <ErrorOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />, texto: 'Sem vídeo' }
  }

  return {
    icone: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />,
    texto: formatarDuracao(aula.duracaoSegundos) || 'Pronto',
  }
}

const PaginaDoModulo = () => {
  const router = useRouter()
  const { idCurso, idModulo } = router.query

  const [modulo, setModulo] = useState(null)
  const [nome, setNome] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [envios, setEnvios] = useState({})
  const [confirmar, setConfirmar] = useState(null)

  const inputRef = useRef(null)

  useEffect(() => {
    if (idModulo) buscar()
  }, [idModulo])

  useEffect(() => {
    const processando = (modulo?.aulas || []).filter((a) => a.statusVideo === 'processando')
    if (processando.length === 0) return

    const timer = setInterval(async () => {
      for (const aula of processando) {
        try {
          const info = await statusDaAula(aula.id)
          if (info.status !== 'processando') {
            setModulo((m) => ({
              ...m,
              aulas: m.aulas.map((a) =>
                a.id === aula.id ? { ...a, statusVideo: info.status, duracaoSegundos: info.duracaoSegundos } : a
              ),
            }))
          }
        } catch { /* tenta de novo */ }
      }
    }, 10000)

    return () => clearInterval(timer)
  }, [modulo?.aulas])

  const buscar = async () => {
    setCarregando(true)
    try {
      const dados = await carregarModulo(idModulo)
      setModulo(dados.modulo)
      setNome(dados.modulo.nome)
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const salvarNome = async () => {
    if (!nome.trim() || nome.trim() === modulo.nome) return
    try {
      await editarModulo(idModulo, { nome: nome.trim() })
      setModulo((m) => ({ ...m, nome: nome.trim() }))
      setAviso('Nome salvo.')
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const alternarStatus = async () => {
    const novo = modulo.idStatus === STATUS_LIBERADO ? STATUS_RASCUNHO : STATUS_LIBERADO
    try {
      await editarModulo(idModulo, { idStatus: novo })
      setModulo((m) => ({ ...m, idStatus: novo }))
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const arrastar = useReordenar(modulo?.aulas || [], async (ordem, nova) => {
    setModulo((m) => ({ ...m, aulas: nova }))
    try {
      await reordenarAulas(idModulo, ordem)
    } catch (err) {
      setErro(mensagemDeErro(err))
      buscar()
    }
  })

  const aoEscolherArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    const nomeAula = arquivo.name.replace(/\.[^.]+$/, '').slice(0, 100)

    try {
      const criada = await criarAula(idModulo, nomeAula)
      setModulo((m) => ({
        ...m,
        aulas: [...m.aulas, {
          id: criada.idAula, nome: nomeAula, ordem: criada.ordem,
          idVideo: criada.idVideo, statusVideo: 'enviando', duracaoSegundos: null,
        }],
      }))
      setEnvios((e) => ({ ...e, [criada.idAula]: 0 }))

      await enviarVideo(arquivo, criada.upload, {
        titulo: nomeAula,
        aoProgredir: (pct) => setEnvios((e) => ({ ...e, [criada.idAula]: pct })),
      })

      setEnvios((e) => {
        const copia = { ...e }
        delete copia[criada.idAula]

        return copia
      })
      setModulo((m) => ({
        ...m,
        aulas: m.aulas.map((a) => (a.id === criada.idAula ? { ...a, statusVideo: 'processando' } : a)),
      }))
    } catch (err) {
      setErro(mensagemDeErro(err) || 'O envio falhou.')
      setEnvios({})
    }
  }

  const removerAula = async () => {
    try {
      await excluirAula(confirmar.id)
      setConfirmar(null)
      buscar()
    } catch (err) {
      setErro(mensagemDeErro(err))
      setConfirmar(null)
    }
  }

  const abrirProva = async () => {
    if (modulo.prova) {
      router.push(`/cursos/${idCurso}/modulo/${idModulo}/prova`)

      return
    }
    try {
      await criarProva(idModulo, `Prova — ${modulo.nome}`)
      router.push(`/cursos/${idCurso}/modulo/${idModulo}/prova`)
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  if (carregando) return <Box sx={{ py: 6 }}><LinearProgress /></Box>
  if (!modulo) return <Alert severity='error' sx={fonte}>{erro || 'Módulo não encontrado.'}</Alert>

  const publicado = modulo.idStatus === STATUS_LIBERADO

  return (
    <Box sx={{ maxWidth: 900 }}>
      <input ref={inputRef} type='file' accept='video/*' style={{ display: 'none' }} onChange={aoEscolherArquivo} />

      <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 0.5 }}>
        <IconButton size='small' onClick={() => router.push(`/cursos/${idCurso}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ ...fonte, fontWeight: 700 }}>{modulo.nome}</Typography>
        <Chip
          size='small'
          label={publicado ? 'Publicado' : 'Rascunho'}
          color={publicado ? 'success' : 'default'}
          variant={publicado ? 'filled' : 'outlined'}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          variant={publicado ? 'outlined' : 'contained'}
          startIcon={publicado ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
          onClick={alternarStatus}
          sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
        >
          {publicado ? 'Ocultar do aluno' : 'Publicar módulo'}
        </Button>
      </Stack>

      <Breadcrumbs sx={{ ...fonte, ml: 5, mb: 4 }}>
        <Link
          component='button' underline='hover' color='inherit'
          onClick={() => router.push(`/cursos/${idCurso}`)}
          sx={{ ...fonte, fontSize: 14 }}
        >
          {modulo.nomeCurso}
        </Link>
        <Typography sx={{ ...fonte, fontSize: 14, color: 'text.secondary' }}>{modulo.nome}</Typography>
      </Breadcrumbs>

      {erro && <Alert severity='error' onClose={() => setErro('')} sx={{ mb: 3, ...fonte }}>{erro}</Alert>}
      {aviso && <Alert severity='success' onClose={() => setAviso('')} sx={{ mb: 3, ...fonte }}>{aviso}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography sx={{ ...fonte, fontWeight: 600, mb: 2 }}>Nome do módulo</Typography>
          <Stack direction='row' spacing={2}>
            <TextField
              fullWidth value={nome} onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && salvarNome()}
            />
            <Box>
              <Button
                variant='contained' startIcon={<SaveOutlinedIcon />} onClick={salvarNome}
                disabled={!nome.trim() || nome.trim() === modulo.nome}
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
            <Box>
              <Typography sx={{ ...fonte, fontWeight: 600 }}>Aulas</Typography>
              <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                Arraste para mudar a ordem em que o aluno assiste
              </Typography>
            </Box>
            <Button
              variant='contained' startIcon={<AddIcon />}
              onClick={() => { inputRef.current.value = ''; inputRef.current.click() }}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              Adicionar aula
            </Button>
          </Stack>

          {modulo.aulas.length === 0 ? (
            <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', py: 3, textAlign: 'center' }}>
              Nenhuma aula ainda. Envie o primeiro vídeo.
            </Typography>
          ) : (
            modulo.aulas.map((aula, indice) => {
              const envio = envios[aula.id]
              const ocupada = envio !== undefined
              const situacao = situacaoDoVideo(aula, envio)
              const props = ocupada ? {} : arrastar.props(aula.id, indice)

              return (
                <Box
                  key={aula.id}
                  {...props}
                  onClick={() => !ocupada && router.push(`/cursos/${idCurso}/aula/${aula.id}`)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    py: 1.5, px: 2, mb: 1, borderRadius: 1, bgcolor: 'action.hover',
                    cursor: ocupada ? 'default' : 'pointer',
                    '&:hover': { bgcolor: ocupada ? 'action.hover' : 'action.selected' },
                  }}
                >
                  <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: ocupada ? 'default' : 'grab' }} />
                  <Chip label={indice + 1} size='small' sx={{ minWidth: 30, fontWeight: 700 }} />
                  <PlayCircleOutlineIcon sx={{ color: 'text.disabled' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ ...fonte, fontWeight: 500 }} noWrap>{aula.nome}</Typography>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      {situacao.icone}
                      <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                        {situacao.texto}
                      </Typography>
                    </Stack>
                    {ocupada && <LinearProgress variant='determinate' value={envio} sx={{ mt: 1, borderRadius: 1 }} />}
                  </Box>
                  <Tooltip title='Editar aula'>
                    <IconButton
                      size='small' disabled={ocupada}
                      onClick={(e) => { e.stopPropagation(); router.push(`/cursos/${idCurso}/aula/${aula.id}`) }}
                    >
                      <EditOutlinedIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size='small' disabled={ocupada}
                    onClick={(e) => { e.stopPropagation(); setConfirmar({ id: aula.id, nome: aula.nome }) }}
                  >
                    <DeleteOutlineIcon fontSize='small' />
                  </IconButton>
                </Box>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction='row' alignItems='center' spacing={2}>
            <QuizOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
            <Box sx={{ flex: 1 }}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <Typography sx={{ ...fonte, fontWeight: 600 }}>Prova do módulo</Typography>
                {modulo.prova && (
                  <Chip
                    size='small'
                    label={modulo.prova.ativo ? 'Publicada' : 'Rascunho'}
                    color={modulo.prova.ativo ? 'success' : 'default'}
                    variant={modulo.prova.ativo ? 'filled' : 'outlined'}
                  />
                )}
              </Stack>
              <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                {modulo.prova
                  ? `${modulo.prova.questoes} ${Number(modulo.prova.questoes) === 1 ? 'questão' : 'questões'}`
                  : 'Avalia o que o aluno aprendeu neste módulo'}
              </Typography>
            </Box>
            <Button
              variant={modulo.prova ? 'outlined' : 'contained'}
              startIcon={modulo.prova ? <EditOutlinedIcon /> : <AddIcon />}
              onClick={abrirProva}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              {modulo.prova ? 'Editar prova' : 'Criar prova'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={!!confirmar} onClose={() => setConfirmar(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>Excluir aula?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={fonte}>
            A aula &quot;{confirmar?.nome}&quot; e o vídeo dela serão apagados. Isso não tem volta.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmar(null)} sx={{ ...fonte, textTransform: 'none' }}>Cancelar</Button>
          <Button
            variant='contained' color='error' onClick={removerAula}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PaginaDoModulo
