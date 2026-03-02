import { Component } from 'react'
import axios from 'axios'
import { SERVICES_CONTEXT, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import Phone from 'mdi-material-ui/Phone'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CheckIcon from '@mui/icons-material/Check'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

import InputMask from 'react-input-mask'

function ProgressContainer(props) {
  if (!props.show) return null

  return (
    <Stack sx={{ width: '100%', mb: 4, mt: 2 }} spacing={2}>
      <LinearProgress />
      <Typography variant='body1' sx={{ textAlign: 'center' }}>
        Efetuando o cadastro do empreendedor...
      </Typography>
    </Stack>
  )
}

export default class FormCadastroDeEmpreendedor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      salvandoDados: false,
      nome: '',
      sobrenome: '',
      email: '',
      celular: '',
      isLider: false,
      showErrorNome: false,
      showErrorSobrenome: false,
      showErrorEmail: false,
      showErrorCelular: false,
      msgErrorNome: '',
      msgErrorSobrenome: '',
      msgErrorEmail: '',
      msgErrorCelular: '',
      showSucessMessage: false,
    }
  }

  componentDidMount() {
    mixpanel.init(MIXPANEL_TOKEN)
  }

  render() {
    const handleChange = (prop) => (event) => {
      if (prop === 'isLider') {
        this.setState({ isLider: !this.state.isLider })
      } else {
        const erroKey = `showError${prop.charAt(0).toUpperCase() + prop.slice(1)}`
        const msgKey = `msgError${prop.charAt(0).toUpperCase() + prop.slice(1)}`
        this.setState({ [prop]: event.target.value, [erroKey]: false, [msgKey]: '' })
      }
    }

    const resetForm = () => {
      this.setState({
        salvandoDados: false, nome: '', sobrenome: '', email: '', celular: '', isLider: false,
        showErrorNome: false, showErrorSobrenome: false, showErrorEmail: false, showErrorCelular: false,
        msgErrorNome: '', msgErrorSobrenome: '', msgErrorEmail: '', msgErrorCelular: '',
        showSucessMessage: false,
      })
    }

    const onClickCadastrar = () => {
      let hasFormErrors = false

      if (!this.state.nome.trim()) {
        hasFormErrors = true
        this.setState({ showErrorNome: true, msgErrorNome: 'Por favor preencha o nome' })
      }
      if (!this.state.sobrenome.trim()) {
        hasFormErrors = true
        this.setState({ showErrorSobrenome: true, msgErrorSobrenome: 'Por favor preencha o sobrenome' })
      }
      if (!this.state.email.trim()) {
        hasFormErrors = true
        this.setState({ showErrorEmail: true, msgErrorEmail: 'Por favor preencha o email' })
      }
      if (!this.state.celular.replace(/\D/g, '').trim()) {
        hasFormErrors = true
        this.setState({ showErrorCelular: true, msgErrorCelular: 'Por favor preencha o celular' })
      }

      if (hasFormErrors) return

      const user = JSON.parse(sessionStorage.getItem('loggedUser'))
      this.setState({ salvandoDados: true })

      axios.post(`${SERVICES_CONTEXT}/empreendedor/cadastrar`, {
        nome: this.state.nome.trim(),
        sobrenome: this.state.sobrenome.trim(),
        email: this.state.email.trim().toLowerCase(),
        celular: this.state.celular,
        isLider: this.state.isLider,
        idPatrocinador: user.idUsuario,
      }).then(({ data }) => {
        if (data.result.error) {
          const cod = data.result.errorCodes?.[0]
          const msgs = {
            EMAIL_JA_CADASTRADO: 'Já existe empreendedor cadastrado com este e-mail!',
            SEM_PERMISSAO: 'Você não tem permissão para cadastrar empreendedores.',
          }
          this.setState({
            salvandoDados: false,
            showErrorEmail: !!msgs[cod],
            msgErrorEmail: msgs[cod] || 'Erro ao cadastrar. Tente novamente.',
          })
        } else {
          mixpanel.track('Cadastrou Novo Empreendedor')
          this.setState({ salvandoDados: false, showSucessMessage: true })
        }
      }).catch(() => {
        this.setState({ salvandoDados: false, showErrorEmail: true, msgErrorEmail: 'Erro de conexão. Tente novamente.' })
      })
    }

    if (this.state.showSucessMessage) {
      return (
        <Card>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Alert icon={<CheckIcon />} severity='success'>
                  <Typography variant='body1'>
                    Cadastro de <b>{this.state.nome} {this.state.sobrenome}</b> realizado com sucesso!
                  </Typography>
                </Alert>
                <Typography variant='body1' sx={{ mt: 2, textAlign: 'center' }}>
                  O acesso ao EAD foi liberado automaticamente.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Stack direction='row' spacing={2} justifyContent='center'>
                  <Button variant='outlined' onClick={() => { window.location.href = '/empreendedores' }}>
                    Ver equipe
                  </Button>
                  <Button variant='contained' onClick={resetForm}>
                    Cadastrar outro
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader title='Cadastro de empreendedor' titleTypographyProps={{ variant: 'h6' }} avatar={<PersonAddIcon />} />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Nome' required
                error={this.state.showErrorNome} helperText={this.state.msgErrorNome}
                placeholder='Primeiro nome' value={this.state.nome}
                inputProps={{ maxLength: 150 }}
                onChange={handleChange('nome')}
                InputProps={{ startAdornment: <InputAdornment position='start'><AccountOutline /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Sobrenome' required
                error={this.state.showErrorSobrenome} helperText={this.state.msgErrorSobrenome}
                placeholder='Sobrenome' value={this.state.sobrenome}
                inputProps={{ maxLength: 150 }}
                onChange={handleChange('sobrenome')}
                InputProps={{ startAdornment: <InputAdornment position='start'><AccountOutline /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required type='email' label='Email'
                error={this.state.showErrorEmail} helperText={this.state.msgErrorEmail}
                placeholder='seuemail@gmail.com' value={this.state.email}
                inputProps={{ maxLength: 150 }}
                onChange={handleChange('email')}
                InputProps={{ startAdornment: <InputAdornment position='start'><EmailOutline /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <InputMask mask='(99) 99999-9999' value={this.state.celular} onChange={handleChange('celular')}>
                {() => (
                  <TextField fullWidth required type='phone' label='Celular'
                    placeholder='(00) 00000-0000'
                    error={this.state.showErrorCelular} helperText={this.state.msgErrorCelular}
                    InputProps={{ startAdornment: <InputAdornment position='start'><Phone /></InputAdornment> }}
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox checked={this.state.isLider} onChange={handleChange('isLider')} />
                <Typography variant='body2'>Pode cadastrar recrutas?</Typography>
                <Tooltip title='Ao marcar esta opção, este empreendedor também receberá acesso a este sistema de gestão para gerenciar a própria equipe.'>
                  <IconButton size='small'><HelpOutlineIcon fontSize='small' /></IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <ProgressContainer show={this.state.salvandoDados} />
              <Stack direction='row' spacing={2}>
                <Button variant='outlined' disabled={this.state.salvandoDados}
                  onClick={() => { window.location.href = '/empreendedores' }}>
                  Cancelar
                </Button>
                <Button variant='contained' disabled={this.state.salvandoDados} onClick={onClickCadastrar}>
                  Cadastrar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
}
