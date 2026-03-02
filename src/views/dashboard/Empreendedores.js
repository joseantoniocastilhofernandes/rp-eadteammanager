import { Component, useState } from 'react'
import axios from 'axios'
import { SERVICES_CONTEXT, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import LinearProgress from '@mui/material/LinearProgress'
import Container from '@mui/material/Container'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import CheckIcon from '@mui/icons-material/Check'
import Table from '@mui/material/Table'
import { styled } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import DeleteIcon from '@mui/icons-material/Delete'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import StarIcon from '@mui/icons-material/Star'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.blueroyal || theme.palette.primary.dark,
  },
  [`&.${tableCellClasses.body}`]: { fontSize: 14 },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
  '&:last-of-type td, &:last-of-type th': { border: 0 },
}))

function formatarData(valor) {
  if (!valor) return 'Ainda não acessou'

  return new Date(valor).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function ProgressContainer(props) {
  if (props.excluido) {
    return (
      <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
        <Alert icon={<CheckIcon />} severity='success'>Empreendedor excluído com sucesso!</Alert>
      </Stack>
    )
  }
  if (props.show) {
    return (
      <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
        <LinearProgress />
        <Typography variant='body1' sx={{ textAlign: 'center' }}>Excluindo empreendedor...</Typography>
      </Stack>
    )
  }

  return null
}

function LinhasEmpreendedoresTable(props) {
  const [open, setOpen] = useState(false)
  const [empreendedorSelecionado, setEmpreendedorSelecionado] = useState({})
  const [excluindo, setExcluindo] = useState(false)
  const [excluido, setExcluido] = useState(false)

  const openModalExcluir = (emp) => {
    setEmpreendedorSelecionado(emp)
    setOpen(true)
    setExcluido(false)
  }

  const handleCloseModalExcluir = () => {
    if (excluido) props.onRecarregar()
    setOpen(false)
  }

  const excluir = () => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'))
    setExcluindo(true)
    axios({
      method: 'delete',
      url: `${SERVICES_CONTEXT}/empreendedor/excluir`,
      data: { idUsuario: empreendedorSelecionado.idUsuario, idPatrocinador: user.idUsuario },
      withCredentials: false,
    }).then(({ data }) => {
      if (!data.result.error) {
        mixpanel.track('Excluiu Empreendedor')
        setExcluido(true)
      }
    }).catch(console.error)
      .finally(() => setExcluindo(false))
  }

  const buttons = excluido ? (
    <Button onClick={handleCloseModalExcluir} variant='contained'>Fechar</Button>
  ) : (
    <>
      <Button onClick={handleCloseModalExcluir} disabled={excluindo}>Cancelar</Button>
      <Button onClick={excluir} color='error' variant='contained' disabled={excluindo} autoFocus>
        Excluir
      </Button>
    </>
  )

  if (props.loading) {
    return (
      <Stack sx={{ width: '100%', mt: 7 }} spacing={2}>
        <LinearProgress />
        <Typography variant='body1' sx={{ textAlign: 'center' }}>Carregando sua equipe...</Typography>
      </Stack>
    )
  }

  if (!props.empreendedores || props.empreendedores.length === 0) {
    return (
      <Container>
        <Alert severity='warning'>
          <Typography variant='h6'>Nenhum empreendedor cadastrado!</Typography>
          <Typography variant='subtitle1'>
            <b>Nota:</b> Após o cadastro, o empreendedor receberá acesso ao EAD automaticamente via e-mail.
          </Typography>
        </Alert>
        <Box sx={{ mb: 4, mt: 5, display: 'flex', justifyContent: 'center' }}>
          <Button variant='contained' endIcon={<PersonAddAltIcon />}
            onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
            Cadastrar empreendedor
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <div>
      <Dialog open={open} onClose={handleCloseModalExcluir}>
        <DialogTitle>Tem certeza que deseja excluir o empreendedor?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant='body1'>
              {empreendedorSelecionado.nome} {empreendedorSelecionado.sobrenome}
            </Typography>
            <Typography variant='body1'>{empreendedorSelecionado.email}</Typography>
            <Alert icon={<WarningAmberIcon />} severity='error'>
              <Typography variant='body1'>
                <b>Atenção!</b> O acesso ao EAD e todo o histórico de estudos será perdido!
              </Typography>
            </Alert>
            <ProgressContainer show={excluindo} excluido={excluido} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>{buttons}</DialogActions>
      </Dialog>

      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Nome</StyledTableCell>
              <StyledTableCell align='center'>Líder?</StyledTableCell>
              <StyledTableCell align='center'>Dt. cadastro</StyledTableCell>
              <StyledTableCell align='center'>Último acesso EAD</StyledTableCell>
              <StyledTableCell align='center'>Curso</StyledTableCell>
              <StyledTableCell align='center'>Ação</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.empreendedores.map(row => (
              <StyledTableRow hover key={row.idUsuario}>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {row.nome} {row.sobrenome}
                      {row.isLider && (
                        <Tooltip title='Líder — pode cadastrar recrutas'>
                          <StarIcon sx={{ fontSize: 14, ml: 0.5, color: 'warning.main', verticalAlign: 'middle' }} />
                        </Tooltip>
                      )}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>{row.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell align='center'>{row.isLider ? 'Sim' : 'Não'}</TableCell>
                <TableCell align='center'>{formatarData(row.dhCadastro)}</TableCell>
                <TableCell align='center'>{formatarData(row.dhUltimoAcesso)}</TableCell>
                <TableCell align='center'>
                  {row.curso
                    ? <Chip label='Liberado' color='success' size='small' />
                    : <Chip label='Sem acesso' color='warning' size='small' />}
                </TableCell>
                <TableCell align='center'>
                  <Tooltip title='Relatório de estudos'>
                    <IconButton size='small'
                      onClick={() => { window.location.href = `/relatorio-de-estudo?idUsuario=${row.idUsuario}` }}>
                      <QueryStatsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Excluir empreendedor'>
                    <IconButton size='small' onClick={() => openModalExcluir(row)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
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
        if (!data.result.error) {
          this.setState({ empreendedores: data.result.empreendedores })
        }
      })
      .catch(console.error)
      .finally(() => this.setState({ loadingEmpreendedores: false }))
  }

  render() {
    return (
      <Card>
        <CardHeader
          title='Empreendedores cadastrados na sua distribuição'
          action={
            <Button variant='contained' size='small' endIcon={<PersonAddAltIcon />}
              onClick={() => { window.location.href = '/cadastro-de-empreendedor' }}>
              Novo
            </Button>
          }
        />
        <CardContent>
          <LinhasEmpreendedoresTable
            empreendedores={this.state.empreendedores}
            loading={this.state.loadingEmpreendedores}
            onRecarregar={() => this.carregarEmpreendedores()}
          />
        </CardContent>
      </Card>
    )
  }
}

export default DashboardTable
