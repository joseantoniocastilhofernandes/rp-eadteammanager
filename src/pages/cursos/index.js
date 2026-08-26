import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

import AddIcon from '@mui/icons-material/Add'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'

import {
  listarCursos, criarCurso, verificarBiblioteca, criarBiblioteca, mensagemDeErro,
} from 'src/services/gestaoCursos'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

const Cursos = () => {
  const router = useRouter()

  const [cursos, setCursos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [dialogAberto, setDialogAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [sobre, setSobre] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    iniciar()
  }, [])

  const iniciar = async () => {
    setCarregando(true)
    setErro('')
    try {
      // a biblioteca de vídeo nasce no primeiro acesso, sem o usuário saber
      const bib = await verificarBiblioteca()
      if (!bib.temBiblioteca) await criarBiblioteca()

      const dados = await listarCursos()
      setCursos(dados.cursos || [])
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const salvar = async () => {
    if (!nome.trim()) return
    setSalvando(true)
    setErro('')
    try {
      const { idCurso } = await criarCurso(nome.trim(), sobre.trim())
      router.push(`/cursos/${idCurso}`)
    } catch (err) {
      setErro(mensagemDeErro(err))
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <Box sx={{ py: 6 }}>
        <LinearProgress />
        <Typography sx={{ ...fonte, mt: 2, color: 'text.secondary' }}>
          Carregando seus cursos...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ ...fonte, fontWeight: 700 }}>
            Cursos
          </Typography>
          <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary' }}>
            Crie um curso, organize em módulos e envie as aulas em vídeo
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => { setNome(''); setSobre(''); setDialogAberto(true) }}
          sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
        >
          Novo curso
        </Button>
      </Stack>

      {erro && <Alert severity='error' sx={{ mb: 3, ...fonte }}>{erro}</Alert>}

      {cursos.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <SchoolOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant='h6' sx={{ ...fonte, fontWeight: 600, mb: 1 }}>
              Nenhum curso ainda
            </Typography>
            <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', mb: 3 }}>
              Comece criando seu primeiro curso. Depois você adiciona os módulos e as aulas.
            </Typography>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setDialogAberto(true)}
              sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
            >
              Criar meu primeiro curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {cursos.map((curso) => (
            <Grid item xs={12} sm={6} md={4} key={curso.id}>
              <Card
                onClick={() => router.push(`/cursos/${curso.id}`)}
                sx={{
                  cursor: 'pointer', height: '100%',
                  transition: 'box-shadow .2s, transform .2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                  opacity: curso.status === 'inativo' ? 0.6 : 1,
                }}
              >
                <CardContent>
                  <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                    {curso.status === 'inativo' && (
                      <Chip label='Inativo' size='small' color='default' />
                    )}
                    {curso.liberacaoAutomatica && (
                      <Chip label='Liberação automática' size='small' color='success' variant='outlined' />
                    )}
                  </Stack>

                  <Typography variant='h6' sx={{ ...fonte, fontWeight: 600, mb: 0.5 }}>
                    {curso.nome}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      ...fonte, color: 'text.secondary', mb: 3, minHeight: 40,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}
                  >
                    {curso.sobre || 'Sem descrição'}
                  </Typography>

                  <Stack direction='row' spacing={3}>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <ViewModuleOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                        {curso.qtdModulos} módulos
                      </Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <PlayCircleOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                        {curso.qtdAulas} aulas
                      </Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <PeopleOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                        {curso.qtdAlunos}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogAberto} onClose={() => !salvando && setDialogAberto(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>Novo curso</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label='Nome do curso' value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder='Formação de novos distribuidores'
            sx={{ mt: 1, mb: 3 }}
          />
          <TextField
            fullWidth multiline rows={3} label='Sobre o curso' value={sobre}
            onChange={(e) => setSobre(e.target.value)}
            placeholder='O que o aluno vai aprender aqui'
            helperText='Aparece para o aluno na lista de cursos'
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={salvando} sx={{ ...fonte, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant='contained' onClick={salvar} disabled={salvando || !nome.trim()}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            {salvando ? 'Criando...' : 'Criar curso'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Cursos
