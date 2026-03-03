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
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
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

  const handleClose = () => {
    if (excluido) onRecarregar()
    setExcluido(false)
    onClose()
  }

  const excluir = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'))
    setExcluindo(true)
    axios({
      method: 'delete',
      url: `${SERVICES_CONTEXT}/empreendedor/excluir`,
      data: { idUsuario: emp.idUsuario, idPatrocinador: user.idUsuario },
    }).then(({ data }) => {
      if (!data.result.error) {
        mixpanel.track('Excluiu Empreendedor')
        setExcluido(true)
      }
    }).catch(console.error).finally(() => setExcluindo(false))
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
                O acesso ao EAD foi revogado.
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
              O acesso ao EAD e todo o histórico de estudos será perdido.
            </Alert>
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

function TabelaEmpreendedores({ empreendedores, loading, onRecarregar }) {
  const [busca, setBusca] = useState('')
  const [modalEmp, setModalEmp] = useState(null)

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
          Carregando sua equipe...
        </Typography>
      </Box>
    )
  }

  if (!empreendedores || empreendedores.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <PeopleOutlineIcon sx={{ fontSize: 48, color: 'var(--gray-300)', mb: 2 }} />
        <Typography fontWeight={600} mb={0.5} fontFamily='DM Sans, sans-serif'>
          Nenhum distribuidor ainda
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={3} fontFamily='DM Sans, sans-serif'>
          Após o cadastro, o distribuidor receberá acesso ao EAD automaticamente.
        </Typography>
        <Button variant='contained' endIcon={<PersonAddAltIcon />}
          onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
          Adicionar distribuidor
        </Button>
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
          {filtrados.length} distribuidor{filtrados.length !== 1 ? 'es' : ''}
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
                      background: 'var(--blue-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-primary)' }}>
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
                  {row.curso
                    ? <Chip size='small' label='Liberado'
                        sx={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 11 }} />
                    : <Chip size='small' label='Sem acesso'
                        sx={{ background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11 }} />
                  }
                </TableCell>
                <TableCell sx={{ ...tdCell, textAlign: 'center' }}>
                  <Tooltip title='Remover distribuidor'>
                    <IconButton size='small' onClick={() => setModalEmp(row)}
                      sx={{ color: 'var(--gray-400)', '&:hover': { color: 'var(--red-accent)', background: '#fee2e2' } }}>
                      <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalExcluir
        open={!!modalEmp}
        emp={modalEmp}
        onClose={() => setModalEmp(null)}
        onRecarregar={onRecarregar}
      />
    </Box>
  )
}

class DashboardTable extends Component {
  constructor(props) {
    super(props)
    this.state = { empreendedores: [], loadingEmpreendedores: true }
  }

  componentDidMount() {
    mixpanel.init(MIXPANEL_TOKEN)
    this.carregarEmpreendedores()
  }

  carregarEmpreendedores() {
    const user = sessionStorage.getItem('loggedUser')
    if (!user) { window.location.href = '/'; return }
    const { idUsuario } = JSON.parse(user)
    this.setState({ loadingEmpreendedores: true })
    axios.get(`${SERVICES_CONTEXT}/empreendedor/listar`, { params: { idUsuario } })
      .then(({ data }) => {
        if (!data.result.error) this.setState({ empreendedores: data.result.empreendedores })
      })
      .catch(console.error)
      .finally(() => this.setState({ loadingEmpreendedores: false }))
  }

  render() {
    const count = this.state.empreendedores?.length || 0

    return (
      <Box>
        {/* Header da página */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
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
          {count > 0 && (
            <Button variant='contained' endIcon={<PersonAddAltIcon />}
              onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
              Adicionar
            </Button>
          )}
        </Box>

        {/* Card da tabela */}
        <Box sx={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
          p: 3,
        }}>
          <TabelaEmpreendedores
            empreendedores={this.state.empreendedores}
            loading={this.state.loadingEmpreendedores}
            onRecarregar={() => this.carregarEmpreendedores()}
          />
        </Box>
      </Box>
    )
  }
}

export default DashboardTable
