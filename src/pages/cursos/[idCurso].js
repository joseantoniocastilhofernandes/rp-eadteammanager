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
import LinearProgress from '@mui/material/LinearProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'

import {
  carregarCurso, criarModulo, excluirModulo, editarModulo,
  criarAula, excluirAula, editarAula, statusDaAula, mensagemDeErro,
} from 'src/services/gestaoCursos'
import { enviarVideo, formatarDuracao } from 'src/services/uploadVideo'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

/** Ícone e texto conforme a situação do vídeo. */
function situacaoDoVideo(aula, envio) {
  if (envio) {
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

const EstruturaDoCurso = () => {
  const router = useRouter()
  const { idCurso } = router.query

  const [curso, setCurso] = useState(null)
  const [modulos, setModulos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // envios em andamento, por id de aula
  const [envios, setEnvios] = useState({})
  const inputRef = useRef(null)
  const moduloDestino = useRef(null)

  const [dialogModulo, setDialogModulo] = useState(false)
  const [nomeModulo, setNomeModulo] = useState('')
  const [confirmacao, setConfirmacao] = useState(null)

  useEffect(() => {
    if (idCurso) buscar()
  }, [idCurso])

  // enquanto houver vídeo processando, pergunta de novo a cada 10s
  useEffect(() => {
    const processando = modulos.flatMap((m) => m.aulas).filter((a) => a.statusVideo === 'processando')
    if (processando.length === 0) return

    const timer = setInterval(async () => {
      for (const aula of processando) {
        try {
          const info = await statusDaAula(aula.id)
          if (info.status !== 'processando') {
            atualizarAula(aula.id, { statusVideo: info.status, duracaoSegundos: info.duracaoSegundos })
          }
        } catch { /* tenta na próxima volta */ }
      }
    }, 10000)

    return () => clearInterval(timer)
  }, [modulos])

  const buscar = async () => {
    setCarregando(true)
    try {
      const dados = await carregarCurso(idCurso)
      setCurso(dados.curso)
      setModulos(dados.modulos || [])
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const atualizarAula = (idAula, campos) => {
    setModulos((atual) =>
      atual.map((m) => ({
        ...m,
        aulas: m.aulas.map((a) => (a.id === idAula ? { ...a, ...campos } : a)),
      }))
    )
  }

  // ── módulos ─────────────────────────────────────────────────────────
  const adicionarModulo = async () => {
    if (!nomeModulo.trim()) return
    try {
      await criarModulo(idCurso, nomeModulo.trim())
      setNomeModulo('')
      setDialogModulo(false)
      buscar()
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const renomearModulo = async (modulo) => {
    const novo = window.prompt('Nome do módulo', modulo.nome)
    if (!novo?.trim() || novo === modulo.nome) return
    try {
      await editarModulo(modulo.id, { nome: novo.trim() })
      setModulos((atual) => atual.map((m) => (m.id === modulo.id ? { ...m, nome: novo.trim() } : m)))
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  // ── aulas: escolher arquivo cria a aula e já envia ───────────────────
  const escolherArquivo = (idModulo) => {
    moduloDestino.current = idModulo
    inputRef.current.value = ''
    inputRef.current.click()
  }

  const aoEscolherArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    const idModulo = moduloDestino.current
    if (!arquivo || !idModulo) return

    // o nome do arquivo vira o nome da aula; o usuário renomeia depois
    const nomeAula = arquivo.name.replace(/\.[^.]+$/, '').slice(0, 100)

    try {
      const criada = await criarAula(idModulo, nomeAula)

      // mostra a aula na lista antes de o upload terminar
      setModulos((atual) =>
        atual.map((m) =>
          m.id === idModulo
            ? {
                ...m,
                aulas: [...m.aulas, {
                  id: criada.idAula, nome: nomeAula, ordem: criada.ordem,
                  idVideo: criada.idVideo, statusVideo: 'enviando', duracaoSegundos: null,
                }],
              }
            : m
        )
      )

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
      atualizarAula(criada.idAula, { statusVideo: 'processando' })
    } catch (err) {
      setErro(mensagemDeErro(err) || 'O envio falhou. Tente novamente.')
      setEnvios({})
    }
  }

  const renomearAula = async (aula) => {
    const novo = window.prompt('Nome da aula', aula.nome)
    if (!novo?.trim() || novo === aula.nome) return
    try {
      await editarAula(aula.id, novo.trim())
      atualizarAula(aula.id, { nome: novo.trim() })
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const confirmarExclusao = async () => {
    const { tipo, id } = confirmacao
    try {
      if (tipo === 'modulo') await excluirModulo(id)
      else await excluirAula(id)
      setConfirmacao(null)
      buscar()
    } catch (err) {
      setErro(mensagemDeErro(err))
      setConfirmacao(null)
    }
  }

  if (carregando) {
    return <Box sx={{ py: 6 }}><LinearProgress /></Box>
  }

  const totalAulas = modulos.reduce((s, m) => s + m.aulas.length, 0)

  return (
    <Box>
      <input
        ref={inputRef} type='file' accept='video/*'
        style={{ display: 'none' }} onChange={aoEscolherArquivo}
      />

      <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => router.push('/cursos')} size='small'>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ ...fonte, fontWeight: 700 }}>
          {curso?.nome}
        </Typography>
      </Stack>
      <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', mb: 4, ml: 5 }}>
        {modulos.length} módulos · {totalAulas} aulas
      </Typography>

      {erro && <Alert severity='error' onClose={() => setErro('')} sx={{ mb: 3, ...fonte }}>{erro}</Alert>}

      {modulos.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <VideoLibraryOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant='h6' sx={{ ...fonte, fontWeight: 600, mb: 1 }}>
              Comece criando um módulo
            </Typography>
            <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', mb: 3 }}>
              Módulos agrupam as aulas. Por exemplo: &quot;Introdução&quot;, &quot;Primeiros passos&quot;.
            </Typography>
            <Button
              variant='contained' startIcon={<AddIcon />}
              onClick={() => setDialogModulo(true)}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              Criar primeiro módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {modulos.map((modulo, indice) => (
            <Accordion key={modulo.id} defaultExpanded={indice === 0} sx={{ mb: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction='row' alignItems='center' spacing={2} sx={{ flex: 1, pr: 2 }}>
                  <Chip label={indice + 1} size='small' sx={{ fontWeight: 700, minWidth: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ ...fonte, fontWeight: 600 }}>{modulo.nome}</Typography>
                    <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                      {modulo.aulas.length} {modulo.aulas.length === 1 ? 'aula' : 'aulas'}
                      {Number(modulo.temProva) > 0 && ' · com prova'}
                    </Typography>
                  </Box>
                  <Tooltip title='Renomear módulo'>
                    <IconButton size='small' onClick={(e) => { e.stopPropagation(); renomearModulo(modulo) }}>
                      <EditOutlinedIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Excluir módulo'>
                    <IconButton
                      size='small'
                      onClick={(e) => { e.stopPropagation(); setConfirmacao({ tipo: 'modulo', id: modulo.id, nome: modulo.nome }) }}
                    >
                      <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                {modulo.aulas.map((aula) => {
                  const envio = envios[aula.id]
                  const situacao = situacaoDoVideo(aula, envio)

                  return (
                    <Box
                      key={aula.id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        py: 1.5, px: 2, mb: 1, borderRadius: 1,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <PlayCircleOutlineIcon sx={{ color: 'text.disabled' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ ...fonte, fontWeight: 500 }} noWrap>{aula.nome}</Typography>
                        <Stack direction='row' spacing={0.5} alignItems='center'>
                          {situacao.icone}
                          <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                            {situacao.texto}
                          </Typography>
                        </Stack>
                        {envio !== undefined && (
                          <LinearProgress variant='determinate' value={envio} sx={{ mt: 1, borderRadius: 1 }} />
                        )}
                      </Box>
                      <IconButton size='small' onClick={() => renomearAula(aula)} disabled={envio !== undefined}>
                        <EditOutlinedIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small' disabled={envio !== undefined}
                        onClick={() => setConfirmacao({ tipo: 'aula', id: aula.id, nome: aula.nome })}
                      >
                        <DeleteOutlineIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  )
                })}

                <Button
                  startIcon={<AddIcon />}
                  onClick={() => escolherArquivo(modulo.id)}
                  sx={{ ...fonte, textTransform: 'none', mt: 1 }}
                >
                  Adicionar aula em vídeo
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant='outlined' startIcon={<AddIcon />}
            onClick={() => setDialogModulo(true)}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600, mt: 2 }}
          >
            Novo módulo
          </Button>
        </>
      )}

      <Dialog open={dialogModulo} onClose={() => setDialogModulo(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>Novo módulo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label='Nome do módulo' value={nomeModulo}
            onChange={(e) => setNomeModulo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarModulo()}
            placeholder='Introdução'
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogModulo(false)} sx={{ ...fonte, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant='contained' onClick={adicionarModulo} disabled={!nomeModulo.trim()}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmacao} onClose={() => setConfirmacao(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>
          Excluir {confirmacao?.tipo === 'modulo' ? 'módulo' : 'aula'}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={fonte}>
            {confirmacao?.tipo === 'modulo'
              ? `O módulo "${confirmacao?.nome}" sai do curso, junto com as aulas dele. O progresso de quem já assistiu é preservado.`
              : `A aula "${confirmacao?.nome}" e o vídeo dela serão apagados. Isso não tem volta.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmacao(null)} sx={{ ...fonte, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant='contained' color='error' onClick={confirmarExclusao}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EstruturaDoCurso
