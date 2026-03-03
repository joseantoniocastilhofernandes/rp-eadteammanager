import { useState, useEffect } from 'react'
import axios from 'axios'
import { SERVICES_CONTEXT } from 'src/@core/constants/constants.js'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SearchIcon from '@mui/icons-material/Search'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const thCell = {
  background: 'transparent',
  color: 'var(--gray-500)',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  borderBottom: '1px solid var(--gray-200)',
  padding: '10px 16px',
  fontFamily: 'DM Sans, sans-serif',
}
const tdCell = {
  borderBottom: '1px solid var(--gray-100)',
  padding: '14px 16px',
  fontFamily: 'DM Sans, sans-serif',
}

const AdminPage = () => {
  const [usuario, setUsuario] = useState(null)
  const [acesso, setAcesso] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [usuarios, setUsuarios] = useState([])
  const [cursosDisponiveis, setCursosDisponiveis] = useState([])
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState(0)

  const [dialogUsuario, setDialogUsuario] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [cursoSelecionado, setCursoSelecionado] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msgSucesso, setMsgSucesso] = useState(null)
  const [msgErro, setMsgErro] = useState(null)

  const [dialogRede, setDialogRede] = useState(false)
  const [liderSelecionado, setLiderSelecionado] = useState(null)
  const [cursoRede, setCursoRede] = useState('')

  const [dialogRevogar, setDialogRevogar] = useState(false)
  const [cursoAlunoSelecionado, setCursoAlunoSelecionado] = useState(null)

  const carregarDados = async (idAdmin) => {
    setCarregando(true)
    try {
      const { data } = await axios.get(`${SERVICES_CONTEXT}/admin/cursos`, { params: { idAdmin } })
      if (!data.result.error) {
        setUsuarios(data.result.usuarios)
        setCursosDisponiveis(data.result.cursosDisponiveis)
      }
    } catch (err) { console.error(err) }
    finally { setCarregando(false) }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('loggedUser')
    if (!stored) { window.location.href = '/'; return }
    const u = JSON.parse(stored)
    setUsuario(u)
    if (u.idNivelDeAcesso >= 6) { setAcesso(true); carregarDados(u.idUsuario) }
    else setCarregando(false)
  }, [])

  const liberarParaUsuario = async () => {
    if (!cursoSelecionado) return
    setSalvando(true); setMsgErro(null)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/admin/cursos`, {
        idAdmin: usuario.idUsuario,
        idUsuario: usuarioSelecionado.idUsuario,
        idCurso: cursoSelecionado,
        modoRede: false,
      })
      if (data.result?.error) setMsgErro('Erro ao liberar. Tente novamente.')
      else { setMsgSucesso('Acesso liberado com sucesso!'); carregarDados(usuario.idUsuario) }
    } catch { setMsgErro('Erro interno.') }
    finally { setSalvando(false) }
  }

  const liberarParaRede = async () => {
    if (!cursoRede) return
    setSalvando(true); setMsgErro(null)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/admin/cursos`, {
        idAdmin: usuario.idUsuario,
        idLider: liderSelecionado.idUsuario,
        idCurso: cursoRede,
        modoRede: true,
      })
      if (data.result?.error) setMsgErro('Erro ao liberar para a rede.')
      else { setMsgSucesso(`Acesso liberado para toda a rede de ${liderSelecionado.nome}!`); carregarDados(usuario.idUsuario) }
    } catch { setMsgErro('Erro interno.') }
    finally { setSalvando(false) }
  }

  const revogar = async () => {
    setSalvando(true)
    try {
      const { data } = await axios.delete(`${SERVICES_CONTEXT}/admin/cursos`, {
        data: { idAdmin: usuario.idUsuario, idCursoAluno: cursoAlunoSelecionado.idCursoAluno }
      })
      if (!data.result?.error) {
        setMsgSucesso('Acesso revogado.')
        setDialogRevogar(false)
        carregarDados(usuario.idUsuario)
      }
    } catch { } finally { setSalvando(false) }
  }

  const filtrados = usuarios.filter(u => {
    const q = busca.toLowerCase()
    if (!q) return true
    return `${u.nome} ${u.sobrenome} ${u.email}`.toLowerCase().includes(q)
  }).filter(u => {
    if (aba === 0) return true
    if (aba === 1) return !u.cursos?.length
    if (aba === 2) return u.cursos?.length > 0
    if (aba === 3) return u.isLider
    return true
  })

  if (carregando) {
    return (
      <Box sx={{ py: 6 }}>
        <LinearProgress sx={{ borderRadius: 4, mb: 2 }} />
        <Typography variant='body2' color='text.secondary' textAlign='center' fontFamily='DM Sans, sans-serif'>
          Carregando...
        </Typography>
      </Box>
    )
  }

  if (!acesso) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
        <LockOutlinedIcon sx={{ fontSize: 48, color: 'var(--gray-300)' }} />
        <Typography fontWeight={600} fontFamily='DM Sans, sans-serif'>Acesso restrito</Typography>
        <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
          Você não tem permissão para acessar esta área.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: 'var(--blue-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AdminPanelSettingsOutlinedIcon sx={{ color: 'var(--blue-primary)', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant='h5' fontWeight={700} fontFamily='DM Sans, sans-serif'>
              Gestão de acessos
            </Typography>
            <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
              Controle quem tem acesso a cada curso
            </Typography>
          </Box>
        </Box>
      </Box>

      {msgSucesso && (
        <Alert severity='success' onClose={() => setMsgSucesso(null)}
          sx={{ mb: 3, borderRadius: 'var(--radius-sm)' }} icon={<CheckCircleOutlineIcon />}>
          {msgSucesso}
        </Alert>
      )}

      {/* Card principal */}
      <Box sx={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Filtros */}
        <Box sx={{ px: 3, pt: 3, pb: 0, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small' placeholder='Buscar por nome ou e-mail...'
            value={busca} onChange={e => setBusca(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} />
              </InputAdornment>
            }}
            sx={{ width: 280 }}
          />
          <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ ml: 'auto' }}>
            <Tab label='Todos' />
            <Tab label='Sem curso' />
            <Tab label='Com curso' />
            <Tab label='Líderes' />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'var(--gray-50)' }}>
                <TableCell sx={thCell}>Distribuidor</TableCell>
                <TableCell sx={{ ...thCell, textAlign: 'center' }}>Perfil</TableCell>
                <TableCell sx={thCell}>Cursos</TableCell>
                <TableCell sx={{ ...thCell, textAlign: 'center' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6, color: 'var(--gray-400)', fontFamily: 'DM Sans, sans-serif' }}>
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              ) : filtrados.map(row => (
                <TableRow key={row.idUsuario}
                  sx={{ '&:hover': { background: 'var(--gray-50)' }, transition: 'background 0.15s' }}>
                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--blue-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-primary)' }}>
                          {row.nome?.charAt(0)?.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>
                          {row.nome} {row.sobrenome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>{row.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                    {row.isLider
                      ? <Chip size='small' label='Líder'
                          sx={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11 }} />
                      : <Typography variant='caption' color='text.secondary'>Distribuidor</Typography>
                    }
                  </TableCell>

                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {row.cursos?.length > 0
                        ? row.cursos.map(c => (
                          <Chip
                            key={c.idCursoAluno}
                            label={c.nomeCurso}
                            size='small'
                            onDelete={() => { setCursoAlunoSelecionado({ ...c, idUsuario: row.idUsuario }); setDialogRevogar(true) }}
                            sx={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 11,
                              '& .MuiChip-deleteIcon': { color: '#15803d', fontSize: 14 } }}
                          />
                        ))
                        : <Chip size='small' label='Sem acesso'
                            sx={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11 }} />
                      }
                    </Box>
                  </TableCell>

                  <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title='Liberar curso para este usuário'>
                        <IconButton size='small'
                          onClick={() => { setUsuarioSelecionado(row); setCursoSelecionado(''); setMsgSucesso(null); setMsgErro(null); setDialogUsuario(true) }}
                          sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--blue-primary)', background: 'var(--blue-light)' } }}>
                          <PersonOutlineIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      {row.isLider && (
                        <Tooltip title='Liberar para toda a rede deste líder'>
                          <IconButton size='small'
                            onClick={() => { setLiderSelecionado(row); setCursoRede(''); setMsgErro(null); setDialogRede(true) }}
                            sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--green-accent)', background: '#dcfce7' } }}>
                            <GroupsIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog: liberar para usuário */}
      <Dialog open={dialogUsuario} onClose={() => setDialogUsuario(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, pb: 1 }}>
          Liberar acesso ao curso
        </DialogTitle>
        <DialogContent>
          <Box sx={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', p: 2, mb: 2.5 }}>
            <Typography fontWeight={600} fontSize={14} fontFamily='DM Sans, sans-serif'>
              {usuarioSelecionado?.nome} {usuarioSelecionado?.sobrenome}
            </Typography>
            <Typography variant='caption' color='text.secondary'>{usuarioSelecionado?.email}</Typography>
          </Box>
          <FormControl fullWidth size='small'>
            <InputLabel>Selecionar curso</InputLabel>
            <Select value={cursoSelecionado} label='Selecionar curso' onChange={e => setCursoSelecionado(e.target.value)}>
              {cursosDisponiveis.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {msgErro && <Alert severity='error' sx={{ mt: 2, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>{msgErro}</Alert>}
          {msgSucesso && <Alert severity='success' sx={{ mt: 2, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>{msgSucesso}</Alert>}
          {salvando && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogUsuario(false)} disabled={salvando} sx={{ color: 'var(--gray-500)' }} size='small'>
            Fechar
          </Button>
          <Button onClick={liberarParaUsuario} variant='contained' disabled={!cursoSelecionado || salvando} size='small'>
            Liberar acesso
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: liberar para rede */}
      <Dialog open={dialogRede} onClose={() => setDialogRede(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, pb: 1 }}>
          Liberar para toda a rede
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning' icon={<WarningAmberIcon fontSize='small' />}
            sx={{ mb: 2.5, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            Isso vai liberar o curso para <strong>todos os distribuidores</strong> da rede de <strong>{liderSelecionado?.nome}</strong>.
          </Alert>
          <FormControl fullWidth size='small'>
            <InputLabel>Selecionar curso</InputLabel>
            <Select value={cursoRede} label='Selecionar curso' onChange={e => setCursoRede(e.target.value)}>
              {cursosDisponiveis.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {msgErro && <Alert severity='error' sx={{ mt: 2, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>{msgErro}</Alert>}
          {salvando && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogRede(false)} disabled={salvando} sx={{ color: 'var(--gray-500)' }} size='small'>
            Cancelar
          </Button>
          <Button onClick={liberarParaRede} variant='contained' disabled={!cursoRede || salvando} size='small'>
            Liberar para a rede
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: revogar */}
      <Dialog open={dialogRevogar} onClose={() => setDialogRevogar(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, pb: 1 }}>
          Revogar acesso
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif' mb={2}>
            Tem certeza que deseja revogar o acesso ao curso <strong>{cursoAlunoSelecionado?.nomeCurso}</strong>?
          </Typography>
          <Alert severity='error' sx={{ borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
            O histórico de estudos deste aluno será perdido.
          </Alert>
          {salvando && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogRevogar(false)} disabled={salvando} sx={{ color: 'var(--gray-500)' }} size='small'>
            Cancelar
          </Button>
          <Button onClick={revogar} color='error' variant='contained' disabled={salvando} size='small'>
            Revogar acesso
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default AdminPage
