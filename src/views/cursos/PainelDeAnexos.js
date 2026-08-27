import { useState, useEffect, useRef } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'

import { listarAnexos, prepararAnexo, excluirAnexo, mensagemDeErro } from 'src/services/gestaoCursos'
import { enviarArquivo, extensaoDe, extensaoPermitida, ACCEPT_ANEXO } from 'src/services/uploadArquivo'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

const CORES = {
  pdf: 'error', doc: 'info', docx: 'info',
  xls: 'success', xlsx: 'success',
  ppt: 'warning', pptx: 'warning',
  zip: 'default', jpg: 'secondary', png: 'secondary',
}

const PainelDeAnexos = ({ idAula }) => {
  const [anexos, setAnexos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [dialogo, setDialogo] = useState(false)
  const [arquivo, setArquivo] = useState(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [progresso, setProgresso] = useState(null)
  const [arrastando, setArrastando] = useState(false)

  const inputRef = useRef(null)
  const enviando = progresso !== null

  useEffect(() => {
    if (idAula) buscar()
  }, [idAula])

  const buscar = async () => {
    setCarregando(true)
    try {
      const dados = await listarAnexos(idAula)
      setAnexos(dados.anexos || [])
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setCarregando(false)
    }
  }

  const escolher = (arq) => {
    if (!arq) return
    if (!extensaoPermitida(arq.name)) {
      setErro('Formato não aceito. Use PDF, Word, Excel, PowerPoint, ZIP, JPG ou PNG.')

      return
    }
    setErro('')
    setArquivo(arq)
    if (!nome.trim()) setNome(arq.name.replace(/\.[^.]+$/, '').slice(0, 100))
  }

  const enviar = async () => {
    if (!arquivo || !nome.trim()) return
    setErro('')
    setProgresso(0)
    try {
      const preparo = await prepararAnexo(idAula, nome.trim(), extensaoDe(arquivo.name), descricao.trim())
      await enviarArquivo(arquivo, preparo.urlEnvio, preparo.contentType, setProgresso)
      fecharDialogo()
      buscar()
    } catch (err) {
      setProgresso(null)
      setErro(mensagemDeErro(err) || 'O envio falhou.')
    }
  }

  const fecharDialogo = () => {
    if (enviando) return
    setDialogo(false)
    setArquivo(null); setNome(''); setDescricao(''); setProgresso(null); setArrastando(false)
  }

  const remover = async (idAnexo) => {
    try {
      await excluirAnexo(idAnexo)
      setAnexos((a) => a.filter((x) => x.id !== idAnexo))
    } catch (err) {
      setErro(mensagemDeErro(err))
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ ...fonte, fontWeight: 600 }}>Material de apoio</Typography>
            <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
              O aluno baixa ou recebe por e-mail
            </Typography>
          </Box>
          <Button
            variant='outlined' startIcon={<AddIcon />} onClick={() => setDialogo(true)}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            Adicionar
          </Button>
        </Stack>

        {erro && <Alert severity='error' onClose={() => setErro('')} sx={{ mb: 2, ...fonte }}>{erro}</Alert>}
        {carregando && <LinearProgress sx={{ mb: 2 }} />}

        {!carregando && anexos.length === 0 ? (
          <Typography variant='body2' sx={{ ...fonte, color: 'text.secondary', py: 2, textAlign: 'center' }}>
            Nenhum material anexado.
          </Typography>
        ) : (
          anexos.map((anexo) => (
            <Stack
              key={anexo.id} direction='row' alignItems='center' spacing={2}
              sx={{ py: 1.5, px: 2, mb: 1, borderRadius: 1, bgcolor: 'action.hover' }}
            >
              <InsertDriveFileOutlinedIcon sx={{ color: 'text.disabled' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...fonte, fontWeight: 500 }} noWrap>{anexo.nome}</Typography>
                {anexo.descricao && (
                  <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }} noWrap>
                    {anexo.descricao}
                  </Typography>
                )}
              </Box>
              <Chip
                size='small' label={anexo.extensao.toUpperCase()}
                color={CORES[anexo.extensao] || 'default'} variant='outlined'
              />
              <IconButton size='small' onClick={() => remover(anexo.id)}>
                <DeleteOutlineIcon fontSize='small' />
              </IconButton>
            </Stack>
          ))
        )}
      </CardContent>

      <Dialog open={dialogo} onClose={fecharDialogo} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ ...fonte, fontWeight: 700 }}>Adicionar material</DialogTitle>
        <DialogContent>
          <input
            ref={inputRef} type='file' accept={ACCEPT_ANEXO} style={{ display: 'none' }}
            onChange={(e) => escolher(e.target.files?.[0])}
          />

          {!arquivo ? (
            <Box
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files?.[0]) }}
              sx={{
                border: '2px dashed',
                borderColor: arrastando ? 'primary.main' : 'divider',
                bgcolor: arrastando ? 'action.hover' : 'transparent',
                borderRadius: 2, py: 5, mt: 1, textAlign: 'center', cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography sx={{ ...fonte, fontWeight: 500 }}>
                Arraste o arquivo aqui ou clique para escolher
              </Typography>
              <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                PDF, Word, Excel, PowerPoint, ZIP, JPG ou PNG
              </Typography>
            </Box>
          ) : (
            <>
              <Stack
                direction='row' alignItems='center' spacing={2}
                sx={{ p: 2, mt: 1, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}
              >
                <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ ...fonte, fontWeight: 500 }} noWrap>{arquivo.name}</Typography>
                  <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                    {(arquivo.size / 1024 / 1024).toFixed(1)} MB
                    {enviando && ` · enviando ${progresso}%`}
                  </Typography>
                </Box>
                {!enviando && (
                  <Button size='small' onClick={() => inputRef.current.click()} sx={{ ...fonte, textTransform: 'none' }}>
                    Trocar
                  </Button>
                )}
              </Stack>

              {enviando && <LinearProgress variant='determinate' value={progresso} sx={{ mb: 3, borderRadius: 1 }} />}

              <TextField
                fullWidth label='Nome do material' value={nome}
                onChange={(e) => setNome(e.target.value)} disabled={enviando}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth label='Descrição (opcional)' value={descricao}
                onChange={(e) => setDescricao(e.target.value)} disabled={enviando}
                helperText='Ajuda o aluno a saber para que serve'
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={fecharDialogo} disabled={enviando} sx={{ ...fonte, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant='contained' onClick={enviar} disabled={enviando || !arquivo || !nome.trim()}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            {enviando ? `Enviando ${progresso}%` : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default PainelDeAnexos
