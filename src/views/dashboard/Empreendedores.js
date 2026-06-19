import { Component, useState } from 'react'
import axios from 'axios'
import { SERVICES_CONTEXT, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import StarIcon from '@mui/icons-material/Star'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'

function formatarData(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

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

function ModalExcluir({ open, emp, onClose, onRecarregar }) {
  const [excluindo, setExcluindo] = useState(false)
  const [excluido, setExcluido] = useState(false)
  const [erro, setErro] = useState('')

  const handleClose = () => {
    if (excluido) onRecarregar()
    setExcluido(false)
    setErro('')
    onClose()
  }

  const excluir = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'))
    setExcluindo(true)
    setErro('')
    axios.delete(`${SERVICES_CONTEXT}/empreendedor/excluir`, {
      params: { idUsuario: emp.idUsuario, idPatrocinador: user.idUsuario },
    }).then(({ data }) => {
      if (!data.result.error) {
        mixpanel.track('Excluiu Empreendedor')
        setExcluido(true)
      } else {
        setErro(data.result.errorCodes?.[0] || 'Não foi possível remover.')
      }
    }).catch(() => setErro('Erro de conexão. Tente novamente.'))
      .finally(() => setExcluindo(false))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ pb: 1, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
        Remover distribuidor
      </DialogTitle>
      <DialogContent>
        {excluido ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: 'var(--green-accent)', fontSize: 28 }} />
            <Box>
              <Typography fontWeight={600} fontFamily='DM Sans, sans-serif'>Removido com sucesso</Typography>
              <Typography variant='caption' color='text.secondary' fontFamily='DM Sans, sans-serif'>
                O acesso ao EAD foi revogado. Ele aparecerá em &quot;Excluídos&quot; e pode ser reativado.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{
              background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-sm)', p: 2, mb: 2,
            }}>
              <Typography fontWeight={600} fontFamily='DM Sans, sans-serif'>
                {emp?.nome} {emp?.sobrenome}
              </Typography>
              <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
                {emp?.email}
              </Typography>
            </Box>
            <Alert
              severity='error' icon={<WarningAmberIcon fontSize='small' />}
              sx={{ borderRadius: 'var(--radius-sm)', fontSize: 13 }}
            >
              O acesso ao EAD será revogado. O histórico é preservado e pode ser restaurado depois.
            </Alert>
            {erro && (
              <Alert severity='error' sx={{ mt: 1.5, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                {erro}
              </Alert>
            )}
            {excluindo && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {excluido ? (
          <Button onClick={handleClose} variant='contained' size='small'>Fechar</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={excluindo} size='small'
              sx={{ color: 'var(--gray-500)' }}>
              Cancelar
            </Button>
            <Button onClick={excluir} color='error' variant='contained' disabled={excluindo}
              size='small' autoFocus>
              Confirmar remoção
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

function ModalReativar({ open, emp, onClose, onRecarregar }) {
  const [reativando, setReativando] = useState(false)
  const [reativado, setReativado] = useState(false)
  const [erro, setErro] = useState('')

  const handleClose = () => {
    if (reativado) onRecarregar()
    setReativado(false)
    setErro('')
    onClose()
  }

  const reativar = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'))
    setReativando(true)
    setErro('')
    axios.post(`${SERVICES_CONTEXT}/empreendedor/reativar`, {
      idUsuario: emp.idUsuario,
      idPatrocinador: user.idUsuario,
    }).then(({ data }) => {
      if (!data.result.error) {
        mixpanel.track('Reativou Empreendedor')
        setReativado(true)
      } else {
        setErro(data.result.errorCodes?.[0] || 'Não foi possível reativar.')
      }
    }).catch(() => setErro('Erro de conexão. Tente novamente.'))
      .finally(() => setReativando(false))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ pb: 1, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
        Reativar distribuidor
      </DialogTitle>
      <DialogContent>
        {reativado ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: 'var(--green-accent)', fontSize: 28 }} />
            <Box>
              <Typography fontWeight={600} fontFamily='DM Sans, sans-serif'>Reativado com sucesso</Typography>
              <Typography variant='caption' color='text.secondary' fontFamily='DM Sans, sans-serif'>
                O acesso ao EAD foi restaurado e ele foi avisado por e-mail.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{
              background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-sm)', p: 2, mb: 2,
            }}>
              <Typography fontWeight={600} fontFamily='DM Sans, sans-serif'>
                {emp?.nome} {emp?.sobrenome}
              </Typography>
              <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
                {emp?.email}
              </Typography>
            </Box>
            <Alert
              severity='info' icon={<RestartAltIcon fontSize='small' />}
              sx={{ borderRadius: 'var(--radius-sm)', fontSize: 13 }}
            >
              O acesso ao EAD será restaurado e o curso liberado novamente, mantendo o histórico anterior.
            </Alert>
            {erro && (
              <Alert severity='error' sx={{ mt: 1.5, borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                {erro}
              </Alert>
            )}
            {reativando && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {reativado ? (
          <Button onClick={handleClose} variant='contained' size='small'>Fechar</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={reativando} size='small'
              sx={{ color: 'var(--gray-500)' }}>
              Cancelar
            </Button>
            <Button onClick={reativar} color='success' variant='contained' disabled={reativando}
              size='small' autoFocus>
              Confirmar reativação
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

function TabelaEmpreendedores({ empreendedores, loading, onRecarregar, modo = 'ativos' }) {
  const [busca, setBusca] = useState('')
  const [modalEmp, setModalEmp] = useState(null)
  const excluidos = modo === 'excluidos'

  const filtrados = (empreendedores || []).filter(e => {
    const q = busca.toLowerCase()
    return !q || `${e.nome} ${e.sobrenome} ${e.email}`.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <Box sx={{ py: 6 }}>
        <LinearProgress sx={{ borderRadius: 4, mb: 2 }} />
        <Typography variant='body2' color='text.secondary' textAlign='center'
          fontFamily='DM Sans, sans-serif'>
          {excluidos ? 'Carregando excluídos...' : 'Carregando sua equipe...'}
        </Typography>
      </Box>
    )
  }

  if (!empreendedores || empreendedores.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <PeopleOutlineIcon sx={{ fontSize: 48, color: 'var(--gray-300)', mb: 2 }} />
        <Typography fontWeight={600} mb={0.5} fontFamily='DM Sans, sans-serif'>
          {excluidos ? 'Nenhum distribuidor excluído' : 'Nenhum distribuidor ainda'}
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={3} fontFamily='DM Sans, sans-serif'>
          {excluidos
            ? 'Distribuidores removidos aparecem aqui e podem ser reativados.'
            : 'Após o cadastro, o distribuidor receberá acesso ao EAD automaticamente.'}
        </Typography>
        {!excluidos && (
          <Button variant='contained' endIcon={<PersonAddAltIcon />}
            onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
            Adicionar distribuidor
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {/* Barra de busca + contador */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          size='small' placeholder='Buscar por nome ou e-mail...'
          value={busca} onChange={e => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: 18, color: 'var(--gray-400)' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 280 }}
        />
        <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
          {filtrados.length} {excluidos ? 'excluído' : 'distribuidor'}{filtrados.length !== 1 ? (excluidos ? 's' : 'es') : ''}
        </Typography>
      </Box>

      <TableContainer sx={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'var(--gray-50)' }}>
              <TableCell sx={thCell}>Distribuidor</TableCell>
              <TableCell sx={{ ...thCell, textAlign: 'center' }}>Perfil</TableCell>
              <TableCell sx={{ ...thCell, textAlign: 'center' }}>Cadastro</TableCell>
              <TableCell sx={{ ...thCell, textAlign: 'center' }}>Último acesso EAD</TableCell>
              <TableCell sx={{ ...thCell, textAlign: 'center' }}>Acesso</TableCell>
              <TableCell sx={{ ...thCell, textAlign: 'center' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.map(row => (
              <TableRow
                key={row.idUsuario}
                sx={{ '&:hover': { background: 'var(--gray-50)' }, transition: 'background 0.15s' }}
              >
                <TableCell sx={tdCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: excluidos ? 'var(--gray-100)' : 'var(--blue-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: excluidos ? 'var(--gray-400)' : 'var(--blue-primary)' }}>
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
                    ? <Chip size='small' label='Líder' icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11 }} />
                    : <Typography variant='caption' color='text.secondary'>Distribuidor</Typography>
                  }
                </TableCell>
                <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                  <Typography variant='body2' fontFamily='DM Sans, sans-serif'>
                    {formatarData(row.dhCadastro)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                  <Typography variant='body2' fontFamily='DM Sans, sans-serif'
                    color={row.dhUltimoAcesso ? 'text.primary' : 'text.secondary'}>
                    {formatarData(row.dhUltimoAcesso)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                  {excluidos
                    ? <Chip size='small' label='Excluído'
                        sx={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: 11 }} />
                    : row.curso
                      ? <Chip size='small' label='Liberado'
                          sx={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 11 }} />
                      : <Chip size='small' label='Sem acesso'
                          sx={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11 }} />
                  }
                </TableCell>
                <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                  {excluidos ? (
                    <Tooltip title='Reativar distribuidor'>
                      <IconButton size='small' onClick={() => setModalEmp(row)}
                        sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--green-accent)', background: '#dcfce7' } }}>
                        <RestartAltIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title='Remover distribuidor'>
                      <IconButton size='small' onClick={() => setModalEmp(row)}
                        sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--red-accent)', background: '#fee2e2' } }}>
                        <DeleteOutlineIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {excluidos ? (
        <ModalReativar
          open={!!modalEmp}
          emp={modalEmp}
          onClose={() => setModalEmp(null)}
          onRecarregar={onRecarregar}
        />
      ) : (
        <ModalExcluir
          open={!!modalEmp}
          emp={modalEmp}
          onClose={() => setModalEmp(null)}
          onRecarregar={onRecarregar}
        />
      )}
    </Box>
  )
}

class DashboardTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      aba: 'ativos',
      ativos: [],
      excluidos: [],
      loadingAtivos: true,
      loadingExcluidos: false,
      excluidosCarregados: false,
    }
  }

  componentDidMount() {
    mixpanel.init(MIXPANEL_TOKEN)
    this.carregar('ativos')
  }

  carregar(status) {
    const user = sessionStorage.getItem('loggedUser')
    if (!user) { window.location.href = '/'; return }
    const { idUsuario } = JSON.parse(user)
    const excluidos = status === 'excluidos'

    this.setState(excluidos ? { loadingExcluidos: true } : { loadingAtivos: true })

    axios.get(`${SERVICES_CONTEXT}/empreendedor/listar`, {
      params: { idUsuario, status: excluidos ? 'excluidos' : 'ativos' },
    })
      .then(({ data }) => {
        if (!data.result.error) {
          this.setState(excluidos
            ? { excluidos: data.result.empreendedores, excluidosCarregados: true }
            : { ativos: data.result.empreendedores })
        }
      })
      .catch(console.error)
      .finally(() => this.setState(excluidos ? { loadingExcluidos: false } : { loadingAtivos: false }))
  }

  // Reativar/excluir move o registro entre as listas — recarrega ambas.
  recarregar() {
    this.carregar('ativos')
    if (this.state.excluidosCarregados) this.carregar('excluidos')
  }

  trocarAba(novaAba) {
    this.setState({ aba: novaAba })
    if (novaAba === 'excluidos' && !this.state.excluidosCarregados) {
      this.carregar('excluidos')
    }
  }

  render() {
    const { aba, ativos, excluidos, loadingAtivos, loadingExcluidos } = this.state
    const count = ativos?.length || 0

    return (
      <Box>
        {/* Header da página */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant='h5' fontWeight={700} fontFamily='DM Sans, sans-serif' mb={0.5}>
              Minha equipe
            </Typography>
            <Typography variant='body2' color='text.secondary' fontFamily='DM Sans, sans-serif'>
              {count > 0
                ? `${count} distribuidor${count !== 1 ? 'es' : ''} na sua rede`
                : 'Gerencie os distribuidores da sua rede'}
            </Typography>
          </Box>
          <Button variant='contained' endIcon={<PersonAddAltIcon />}
            onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
            Adicionar
          </Button>
        </Box>

        {/* Abas */}
        <Tabs
          value={aba}
          onChange={(e, v) => this.trocarAba(v)}
          sx={{ mb: 3, minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 } }}
        >
          <Tab value='ativos' label={`Equipe ativa${count ? ` (${count})` : ''}`} />
          <Tab value='excluidos' label={`Excluídos${this.state.excluidosCarregados ? ` (${excluidos.length})` : ''}`} />
        </Tabs>

        {/* Card da tabela */}
        <Box sx={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
          p: 3,
        }}>
          {aba === 'ativos' ? (
            <TabelaEmpreendedores
              modo='ativos'
              empreendedores={ativos}
              loading={loadingAtivos}
              onRecarregar={() => this.recarregar()}
            />
          ) : (
            <TabelaEmpreendedores
              modo='excluidos'
              empreendedores={excluidos}
              loading={loadingExcluidos}
              onRecarregar={() => this.recarregar()}
            />
          )}
        </Box>
      </Box>
    )
  }
}

export default DashboardTable
