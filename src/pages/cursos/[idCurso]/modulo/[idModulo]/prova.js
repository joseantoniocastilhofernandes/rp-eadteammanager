import { useState, useEffect } from 'react'
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
import Radio from '@mui/material/Radio'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'

import {
  carregarProva, editarProva, criarQuestao, editarQuestao, excluirQuestao,
  criarAlternativa, editarAlternativa, excluirAlternativa, mensagemDeErro,
} from 'src/services/gestaoCursos'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

/** Campo que salva ao sair, sem botão. */
const CampoAutoSalva = ({ valor, aoSalvar, ...resto }) => {
  const [texto, setTexto] = useState(valor)
  useEffect(() => { setTexto(valor) }, [valor])

  return (
    <TextField
      {...resto}
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => texto.trim() && texto !== valor && aoSalvar(texto.trim())}
    />
  )
}

const EditorDeProva = () => {
  const router = useRouter()
  const { idCurso, idModulo } = router.query

  const [prova, setProva] = useState(null)
  const [questoes, setQuestoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (idModulo) buscar()
  }, [idModulo])

  const buscar = async () => {
    setCarregando(true)
    try {
      const dados = await carregarProva(idModulo)
      setProva(dados.prova)
      setQuestoes(dados.questoes || [])
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const salvarProva = async (campos) => {
    try {
      await editarProva(prova.id, campos)
      setProva((p) => ({ ...p, ...campos }))
      setErro('')
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const adicionarQuestao = async () => {
    try {
      await criarQuestao(prova.id, 'Nova questão')
      buscar()
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  const marcarCorreta = async (idQuestao, idAlternativa) => {
    setQuestoes((atual) =>
      atual.map((q) =>
        q.id === idQuestao
          ? { ...q, alternativas: q.alternativas.map((a) => ({ ...a, correta: a.id === idAlternativa })) }
          : q
      )
    )
    try {
      await editarAlternativa(idAlternativa, { correta: true })
    } catch (err) {
      setErro(mensagemDeErro(err))
      buscar()
    }
  }

  const acao = (fn) => async (...args) => {
    try {
      await fn(...args)
      buscar()
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  if (carregando) return <Box sx={{ py: 6 }}><LinearProgress /></Box>
  if (!prova) return <Alert severity='error' sx={fonte}>{erro || 'Prova não encontrada.'}</Alert>

  const semResposta = questoes.filter((q) => !q.alternativas.some((a) => a.correta)).length

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 0.5 }}>
        <IconButton size='small' onClick={() => router.push(`/cursos/${idCurso}/modulo/${idModulo}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h5' sx={{ ...fonte, fontWeight: 700 }}>Prova</Typography>
        <Chip
          size='small'
          label={prova.ativo ? 'Publicada' : 'Rascunho'}
          color={prova.ativo ? 'success' : 'default'}
          variant={prova.ativo ? 'filled' : 'outlined'}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          variant={prova.ativo ? 'outlined' : 'contained'}
          startIcon={prova.ativo ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
          onClick={() => salvarProva({ ativo: !prova.ativo })}
          sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
        >
          {prova.ativo ? 'Despublicar' : 'Publicar prova'}
        </Button>
      </Stack>

      <Breadcrumbs sx={{ ...fonte, ml: 5, mb: 4 }}>
        <Link
          component='button' underline='hover' color='inherit'
          onClick={() => router.push(`/cursos/${idCurso}/modulo/${idModulo}`)}
          sx={{ ...fonte, fontSize: 14 }}
        >
          Módulo
        </Link>
        <Typography sx={{ ...fonte, fontSize: 14, color: 'text.secondary' }}>Prova</Typography>
      </Breadcrumbs>

      {erro && <Alert severity='error' onClose={() => setErro('')} sx={{ mb: 3, ...fonte }}>{erro}</Alert>}

      {prova.tentativas > 0 && (
        <Alert severity='warning' sx={{ mb: 3, ...fonte }}>
          {prova.tentativas} {prova.tentativas === 1 ? 'aluno já fez' : 'alunos já fizeram'} esta prova.
          Alterar as questões agora não recalcula as notas antigas.
        </Alert>
      )}

      {semResposta > 0 && (
        <Alert severity='info' sx={{ mb: 3, ...fonte }}>
          {semResposta} {semResposta === 1 ? 'questão está' : 'questões estão'} sem resposta certa marcada.
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <CampoAutoSalva
              fullWidth label='Título da prova' valor={prova.titulo}
              aoSalvar={(titulo) => salvarProva({ titulo })}
            />
            <TextField
              label='Nota mínima' type='number' defaultValue={prova.notaMinima}
              onBlur={(e) => {
                const valor = Number(e.target.value)
                if (valor >= 0 && valor <= 100 && valor !== Number(prova.notaMinima)) {
                  salvarProva({ notaMinima: valor })
                }
              }}
              InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
              sx={{ minWidth: 150 }}
              helperText='Para o aluno passar'
            />
          </Stack>
        </CardContent>
      </Card>

      {questoes.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, mb: 3 }}>
          <CardContent>
            <QuizOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography sx={{ ...fonte, fontWeight: 600, mb: 1 }}>Nenhuma questão ainda</Typography>
            <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', mb: 3 }}>
              Cada questão tem alternativas, e você marca qual é a certa.
            </Typography>
            <Button
              variant='contained' startIcon={<AddIcon />} onClick={adicionarQuestao}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              Adicionar primeira questão
            </Button>
          </CardContent>
        </Card>
      ) : (
        questoes.map((questao, indice) => (
          <Card key={questao.id} sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction='row' alignItems='flex-start' spacing={2} sx={{ mb: 2 }}>
                <Chip label={indice + 1} size='small' sx={{ fontWeight: 700, minWidth: 32, mt: 1 }} />
                <CampoAutoSalva
                  fullWidth multiline label='Enunciado' valor={questao.enunciado}
                  aoSalvar={acao((texto) => editarQuestao(questao.id, { enunciado: texto }))}
                />
                <Tooltip title='Excluir questão'>
                  <IconButton onClick={acao(() => excluirQuestao(questao.id))} sx={{ mt: 1 }}>
                    <DeleteOutlineIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary', ml: 6 }}>
                Marque o círculo da resposta certa
              </Typography>

              <Box sx={{ ml: 6, mt: 1 }}>
                {questao.alternativas.map((alt) => (
                  <Stack key={alt.id} direction='row' alignItems='center' spacing={1} sx={{ mb: 1 }}>
                    <Radio
                      checked={!!alt.correta}
                      onChange={() => marcarCorreta(questao.id, alt.id)}
                      color='success'
                    />
                    <CampoAutoSalva
                      fullWidth size='small' valor={alt.texto}
                      aoSalvar={acao((texto) => editarAlternativa(alt.id, { texto }))}
                      sx={{
                        '& .MuiOutlinedInput-root': alt.correta
                          ? { bgcolor: 'success.light', opacity: 0.9 }
                          : {},
                      }}
                    />
                    <IconButton size='small' onClick={acao(() => excluirAlternativa(alt.id))}>
                      <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                ))}

                <Button
                  size='small' startIcon={<AddIcon />}
                  onClick={acao(() => criarAlternativa(questao.id, 'Nova alternativa'))}
                  sx={{ ...fonte, textTransform: 'none' }}
                >
                  Adicionar alternativa
                </Button>
              </Box>

              <Box sx={{ ml: 6, mt: 2 }}>
                <CampoAutoSalva
                  fullWidth size='small' multiline label='Explicação (opcional)'
                  valor={questao.explicacao || ''}
                  aoSalvar={acao((texto) => editarQuestao(questao.id, { explicacao: texto }))}
                  helperText='Mostrada ao aluno depois que ele responde'
                />
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {questoes.length > 0 && (
        <Button
          variant='outlined' startIcon={<AddIcon />} onClick={adicionarQuestao}
          sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
        >
          Adicionar questão
        </Button>
      )}
    </Box>
  )
}

export default EditorDeProva
