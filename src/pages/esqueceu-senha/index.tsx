// ** React Imports
import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'

import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack'

import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'

// ** Icons Imports
import Google from 'mdi-material-ui/Google'
import Github from 'mdi-material-ui/Github'
import Twitter from 'mdi-material-ui/Twitter'
import Facebook from 'mdi-material-ui/Facebook'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import IconButton from '@mui/material/IconButton'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import {SERVICES_CONTEXT, setLoggedUser} from 'src/@core/constants/constants.js'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

interface State {
  password: string
  showPassword: boolean
  showEmailError: boolean
}

 

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

function ErrorMessageContainer (props){
    if (props.show){
        return (
            <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <Alert severity="error">{props.message}</Alert>
            </Stack>
        )
    }
    return null
}

function LembreteDeSenhaContainer (props){
    if (props.show){
        return (
            <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <LinearProgress />
                <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Buscando suas credenciais de acesso
              </Typography>
            </Stack>
        )
    }
    if(props.lembreteDeSenhaEnviado){
       return (
            <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <Alert severity="success" >
                    <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                        Um e-mail acaba de ser enviado para você com seus dados de acesso!
                    </Typography>
                    
                </Alert>
               
            </Stack>
        )
    }
    return null
}

function LoginProgressContainer (props){
    if (props.show){
        return (
            <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <LinearProgress />
                <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Buscando suas credenciais de acesso
              </Typography>
            </Stack>
        )
    }
    if(props.lembreteDeSenhaEnviado){
       return (
            <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <Alert severity="success" >
                    <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                        Um e-mail acaba de ser enviado para você com seus dados de acesso!
                    </Typography>
                    
                </Alert>
               
            </Stack>
        )
    }
    return null
}




class LoginPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            email: '',
            showErrorMessage: false,
            showPassword: false,
            showEmailError : false,
            showPasswordError: false,
            errorMessage: '',
            doingLogin : false,
            lembreteDeSenhaEnviado : false,
        };
    }

    componentDidMount() {
      console.log('componentDidMount');
      var user = sessionStorage.getItem('loggedUser');
      console.log('Obtendo Usuario logado do sessionStorage ' + user );
      if(user != null){
          // window.location.href = "/empreendedores";
      }else{
        console.log('Usuário ainda nao logado');
      }
    }
    render(){

    const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
     
      this.setState({ ...this.state, [prop]: event.target.value });
    }

    const atualizarStatus = (doingLogin, showErrorMessage, showEmailError, showPasswordError, errorMessage)=>{
     this.setState({ ...this.state,  'doingLogin': doingLogin, 'showErrorMessage': showErrorMessage, 'showEmailError': showEmailError, 'showPasswordError': showPasswordError, 'errorMessage': errorMessage  }) ;
    }
    const irParaOLogin = () =>{
      sessionStorage.removeItem('loggedUser');
      window.location.href = '/';
    }
    const lembreteDeSenhaEnviado = () =>{
      this.setState({ ...this.state, lembreteDeSenhaEnviado: true, 'doingLogin': false, 'showErrorMessage': false, 'showEmailError': false, 'showPasswordError': false, 'errorMessage': ''  }) ;
    }
    const showMsgErroSenha= (message)=>{
        this.setState({ ...this.state, doingLogin : false, showErrorMessage:true, showEmailError: false, showPasswordError: true, errorMessage: message });  
    }

    const lembrarSenha = ()=>{
    var _email = this.state.email.trim();
    

    //verifica se o email foi preenchido
    if(_email == ''){
        this.setState({ ...this.state, showErrorMessage: true, showEmailError: true, showPasswordError: false, errorMessage: 'Por favor preencha o seu email!' });       
        return;
    }

   
    
    this.setState({ ...this.state, showErrorMessage: false, showEmailError: false, doingLogin : true });       

    axios({
          method: 'post',
          url:  SERVICES_CONTEXT + '/loginservice/lembrarSenha?email=' + _email ,
          withCredentials: false,
        }
      ).then(function (response) {
         //this.setState({ ...this.state, showErrorMessage: false, showEmailError: false, showPasswordError: false, doingLogin : false });   
         console.log('Response Status: ' + response.status);
         console.log('Response data: '+ response.data);
         var resultJon = JSON.stringify(response.data) ;
         var jsonResponse =response.data;
         console.log(resultJon);

         if(resultJon != null){
            var hasError =jsonResponse.result.error;
            var errorList = jsonResponse.result.errorCodes;
            if(hasError){
              console.log('com erros');
              console.log(errorList);
              for (var int = 0; int < errorList.length; int++) {
                var codigoDeErro = errorList[int];
                if(codigoDeErro == 'LOGINERROR_EMAIL_INVALIDO'){
                  atualizarStatus(false, true, true, false, 'Email Inválido! Digite um Email válido!');
                }

                if(codigoDeErro == 'LOGINERROR_EMAIL_NAO_CADASTRADO'){
                  atualizarStatus(false, true, true, false, 'Não existe cadastro para o email fornecido!' );
                }
              }
            }else{  
                lembreteDeSenhaEnviado();  
            }

        }else{
         // $scope.errorMessage = response.data.errorMessage;
          //$scope.show=true;
        }

        //FIM ESTUDEONSEQUISER


    })
    .catch(function (error) {
      console.log(error);
    });


     
        


  }

  const handleKeyEnter= (event) =>{
    console.log(event);
  }
  // ** Hook
  //const theme = useTheme();
  //const router = useRouter();
  if(this.state.lembreteDeSenhaEnviado){
    return (
        <Box className='content-center' sx={{backgroundColor: '#356fc0'}}>
          <Card sx={{ zIndex: 1 }}>
            <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
              <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                  variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5, textAlign: 'center' }}
                >
                  Gestão da Formação de Novos Distribuidores Royal Prestige
                </Typography>
              </Box>
              <Stack sx={{ width: '100%', marginBottom: '10px' }} spacing={2}>
                <Alert severity="success" >
                    <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                        Um e-mail acaba de ser enviado para <b>{this.state.email}</b> com seus dados de acesso!
                    </Typography>
                    
                </Alert>
                <Button
                  fullWidth
                  size='large'
                  variant='contained'
                  sx={{ marginBottom: 7 }}
                  onClick={()=>irParaOLogin()}>
                  Efetuar o login
                </Button>
                
            </Stack>
          
            </CardContent>
          </Card>
        </Box>
    )
  }else{
    return (
        <Box className='content-center' sx={{backgroundColor: '#356fc0'}}>
          <Card sx={{ zIndex: 1 }}>
            <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
              <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                  variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5, textAlign: 'center' }}
                >
                  Gestão da Formação de Novos Distribuidores Royal Prestige
                </Typography>
              </Box>
              <Box sx={{ mb: 6 }}>
                <Typography variant='h9' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
                 Fique tranquilo!
                </Typography>
                <Typography variant='body2'>Vamos te ajudar a lembrar a sua senha.</Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                <TextField required autoFocus 
                name='email' fullWidth 
                error={this.state.showEmailError}  
                value={this.state.email}  
                placeholder='Digite o seu email'
                onChange={handleChange('email')} 
                onKeyPress={handleKeyEnter()}
                id='email' label='Email' sx={{ marginBottom: 4 }} />
                
                <Box
                  sx={{ mb: 4, display: 'flex', alignItems: 'right', flexWrap: 'wrap', justifyContent: 'flex-end' }}
                >
                  <Link passHref href='/'>
                    <LinkStyled >Efetuar login?</LinkStyled>
                  </Link>
                </Box>
                <ErrorMessageContainer show={this.state.showErrorMessage} message={this.state.errorMessage}/>
                <LoginProgressContainer show={this.state.doingLogin} lembreteDeSenhaEnviado={this.state.lembreteDeSenhaEnviado}/>
                <Button
                  fullWidth
                  size='large'
                  variant='contained'
                  sx={{ marginBottom: 7 }}
                  onClick={lembrarSenha}>
                  Lembrar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
    )
  }
  
  }
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default LoginPage
