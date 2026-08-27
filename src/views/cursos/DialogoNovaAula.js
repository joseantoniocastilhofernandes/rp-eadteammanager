import { useState, useRef } from 'react'

import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'

import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'

import { criarAula, mensagemDeErro } from 'src/services/gestaoCursos'
import { enviarVideo, formatarTamanho } from 'src/services/uploadVideo'

const fonte = { fontFamily: 'DM Sans, sans-serif' }

/**
 * Criação de aula em três etapas visíveis: nomear, escolher o arquivo,
 * acompanhar o envio. Antes o clique abria o seletor direto e o nome vinha
 * do nome do arquivo — rápido, mas o usuário não entendia o que aconteceu.
 */
const DialogoNovaAula = ({ aberto, idModulo, aoFechar, aoConcluir }) => {
  const [nome, setNome] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [progresso, setProgresso] = useState(null)
  const [concluido, setConcluido] = useState(false)
  const [erro, setErro] = useState('')
  const [arrastando, setArrastando] = useState(false)

  const inputRef = useRef(null)
  const enviando = progresso !== null && !concluido

  const limpar = () => {
    setNome(''); setArquivo(null); setProgresso(null)
    setConcluido(false); setErro(''); setArrastando(false)
  }

  const fechar = () => {
    if (enviando) return
    limpar()
    aoFechar()
  }

  const escolher = (arq) => {
    if (!arq) return
    if (!arq.type.startsWith('video/')) {
      setErro('Escolha um arquivo de vídeo.')

      return
    }
    setErro('')
    setArquivo(arq)
    // sugere o nome do arquivo, mas o usuário pode trocar
    if (!nome.trim()) setNome(arq.name.replace(/\.[^.]+$/, '').slice(0, 100))
  }

  const enviar = async () => {
    if (!nome.trim() || !arquivo) return
    setErro('')
    setProgresso(0)
    try {
      const criada = await criarAula(idModulo, nome.trim())
      await enviarVideo(arquivo, criada.upload, {
        titulo: nome.trim(),
        aoProgredir: setProgresso,
      })
      setConcluido(true)
      aoConcluir({ ...criada, nome: nome.trim() })
      setTimeout(() => { limpar(); aoFechar() }, 1200)
    } catch (err) {
      setProgresso(null)
      setErro(mensagemDeErro(err) || 'O envio falhou. Tente novamente.')
    }
  }

  return (
    <Dialog open={aberto} onClose={fechar} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ ...fonte, fontWeight: 700, pr: 6 }}>
        Nova aula
        <IconButton
          onClick={fechar} disabled={enviando}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <input
          ref={inputRef} type='file' accept='video/*' style={{ display: 'none' }}
          onChange={(e) => escolher(e.target.files?.[0])}
        />

        {erro && <Alert severity='error' sx={{ mb: 3, ...fonte }}>{erro}</Alert>}

        <TextField
          autoFocus fullWidth label='Nome da aula' value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={enviando || concluido}
          placeholder='Aula 1 — Introdução'
          helperText='É o que o aluno vê na lista'
          sx={{ mt: 1, mb: 3 }}
        />

        <Typography sx={{ ...fonte, fontWeight: 600, mb: 1.5 }}>Vídeo da aula</Typography>

        {!arquivo ? (
          <Box
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault()
              setArrastando(false)
              escolher(e.dataTransfer.files?.[0])
            }}
            sx={{
              border: '2px dashed',
              borderColor: arrastando ? 'primary.main' : 'divider',
              bgcolor: arrastando ? 'action.hover' : 'transparent',
              borderRadius: 2, py: 5, textAlign: 'center', cursor: 'pointer',
              transition: 'border-color .2s, background-color .2s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography sx={{ ...fonte, fontWeight: 500 }}>
              Arraste o vídeo aqui ou clique para escolher
            </Typography>
            <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
              MP4, MOV ou qualquer formato de vídeo
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Stack direction='row' alignItems='center' spacing={2}>
              {concluido
                ? <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 32 }} />
                : <VideoFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 32 }} />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...fonte, fontWeight: 500 }} noWrap>{arquivo.name}</Typography>
                <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary' }}>
                  {formatarTamanho(arquivo.size)}
                  {concluido && ' · enviado'}
                  {enviando && ` · enviando ${progresso}%`}
                </Typography>
              </Box>
              {!enviando && !concluido && (
                <Button
                  size='small' onClick={() => inputRef.current.click()}
                  sx={{ ...fonte, textTransform: 'none' }}
                >
                  Trocar
                </Button>
              )}
            </Stack>

            {enviando && (
              <LinearProgress variant='determinate' value={progresso} sx={{ mt: 2, borderRadius: 1 }} />
            )}
          </Box>
        )}

        {enviando && (
          <Typography variant='caption' sx={{ ...fonte, color: 'text.secondary', display: 'block', mt: 2 }}>
            Não feche esta janela. Se a conexão cair, o envio continua de onde parou.
          </Typography>
        )}

        {concluido && (
          <Alert severity='success' sx={{ mt: 3, ...fonte }}>
            Aula criada. O vídeo está sendo preparado e fica pronto em alguns minutos.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={fechar} disabled={enviando} sx={{ ...fonte, textTransform: 'none' }}>
          {concluido ? 'Fechar' : 'Cancelar'}
        </Button>
        {!concluido && (
          <Button
            variant='contained' onClick={enviar}
            disabled={enviando || !nome.trim() || !arquivo}
            sx={{ ...fonte, textTransform: 'none', fontWeight: 600 }}
          >
            {enviando ? `Enviando ${progresso}%` : 'Criar aula e enviar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DialogoNovaAula
