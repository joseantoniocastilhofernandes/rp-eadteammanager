
import React, { Component, useState , useEffect} from 'react';
import axios from 'axios'
import {SERVICES_CONTEXT} from 'src/@core/constants/constants.js'
// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';


// ** Icons Imports
import Phone from 'mdi-material-ui/Phone'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import TagOutline from 'mdi-material-ui/TagOutline'
import HandshakeOutline from 'mdi-material-ui/HandshakeOutline'
import CheckIcon from '@mui/icons-material/Check'
import InputMask from 'react-input-mask'
import { Input } from '@mui/material';
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import { styled, useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


import BusinessIcon from '@mui/icons-material/Business'

var showForm = true;

var blankForm = {nome: '', email : '', codigoEmpreendedor : '', codigoDistribuicao: 0, podeCadastrarRecrutas: false};

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

function ProgressContainer (props){
    if (props.show){
        return (
            <Stack sx={{ width: '100%', mb: 10, mt: 10 }} spacing={2}>
                <LinearProgress />
                <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Efetuando o cadastro do emprendedor...
              </Typography>
            </Stack>
        )
    }
    return null
}

export default class FormCadastroDeEmpreendedor extends Component{
  constructor(props){
    super(props);
    this.state = {
      salvandoDados: false, 
      nome: '', 
      sobrenome: '', 
      email: '',  
      celular: '',
      codigoEmpreendedor : '', 
      codigoDistribuicao: '', 
      nomeDistribuicao: '', 
      podeCadastrarRecrutas: false,
      showErrorNome: false, 
      showErrorSobrenome: false, 
      showErrorEmail : false,
      showErrorCelular : false,
      showErrorCodigoEmpreendedor : false,
      showSucessMessage : false,
      msgErrorNome: '', 
      msgErrorSobrenome: ''
    };
  }

  
  componentDidMount() {
      this.setState({showSucessMessage: false});
    console.log('componentDidMount');
  }

  componentWillUnmount() {
    this.setState({showSucessMessage: false});
    console.log('componentWillUnmount');
  }

  render() {
    const onClickListarEmpreendedores = () =>{
      //this.setState({showSucessMessage: false});
      window.location.href = '/empreendedores';
    }
 const getDadosParaCadastro = () =>{
    var user = sessionStorage.getItem('loggedUser');
    var idPatrocinador = user.idEmpreendedor;
    var dadosParaCadastro = {
        "idPatrocinador" : idPatrocinador,
        "podeCadastrarRecrutas" : this.state.podeCadastrarRecrutas,
        "empreendedor": {
            "nome" : this.state.nome,
            "sobrenome" : this.state.sobrenome,
            "email": this.state.email,
            "celular": this.state.celular,
            "codigoDistribuicao": this.state.codigoDistribuicao,
            "nomeDistribuicao": this.state.nomeDistribuicao,
        }
    };
    console.log('getDadosParaCadastro=> '+ JSON.stringify(dadosParaCadastro));
    return dadosParaCadastro;
 }
    const onClickCadastrarOutro = () =>{
       //zera o formulário
      this.setState({
        salvandoDados: false, 
        nome: '', 
        sobrenome: '', 
        email: '',  
        celular: '',
        codigoEmpreendedor : '', 
        codigoDistribuicao: '', 
        nomeDistribuicao: '', 
        podeCadastrarRecrutas: false,
        showErrorNome: false, 
        showErrorSobrenome: false, 
        showErrorEmail : false,
        showErrorCelular : false,
        showErrorCodigoEmpreendedor : false,
        showSucessMessage : false,
        msgErrorNome: '', 
        msgErrorSobrenome: ''
      });
    }
    const onClickCadastrar = () =>{
      var keys = this.state;

     console.log('onClickCadastrar' + keys);
     console.log('state.empreendedor.nome.length=' + this.state.nome.length);
     console.log('state.empreendedor.nome.trim().length=' + this.state.nome.trim().length);
     var hasFormErrors =false;
      if(this.state.nome.length  === 0){
      //  this.setState({ ...this.state, empreendedores: e, loadingEmpreendedores: false}); 
        hasFormErrors = true;
        this.setState({ ...this.state, showErrorNome: true, msgErrorNome: 'Por favor preencha o nome' })
        console.log('state.empreendedor.nome.=> ' + JSON.stringify(this.state));

      }

      if(this.state.sobrenome.length  === 0){
        hasFormErrors = true;
        this.setState({showErrorSobrenome: true, msgErrorSobrenome: 'Por favor preencha o sobrenome' })
          console.log('state.empreendedor.sobrenome.=> '+  JSON.stringify(this.state));      
      
      }
      if(this.state.email.length  === 0){
        hasFormErrors = true;
        this.setState({showErrorEmail: true, msgErrorEmail: 'Por favor preencha o email' });      
      }

      if(this.state.celular.length  === 0){
        hasFormErrors = true;
        this.setState({showErrorCelular: true, msgErrorCelular: 'Por favor preencha o celular' });      
      }

      if(this.state.codigoEmpreendedor.length  === 0){
        hasFormErrors = true;
        this.setState({showErrorCodigoEmpreendedor: true, msgErrorCodigoEmpreendedor: 'Por favor preencha o código do empreendedor' });      
      }
      if(!hasFormErrors){
          //chamar o serviço
        var dadosParaCadastro = getDadosParaCadastro(); //dados em formato json
        console.log('dadosParaCadastro ' + dadosParaCadastro);

       
        axios({
          method: 'post',
          url:  SERVICES_CONTEXT + '/empreendedorservice/cadastrarEmpreendedor',
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json' ,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' ,
            'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, origin, accept, authorization'
          },
          data: JSON.stringify(dadosParaCadastro),

        }).then(function (response) {
            //this.setState({ ...this.state, showErrorMessage: false, showEmailError: false, showPasswordError: false, doingLogin : false });   
            console.log('Response Status: ' + response.status);
            console.log('Response data: '+ response.data);
            var resultJon = JSON.stringify(response.data) ;
            var jsonResponse =response.data;
            console.log(resultJon);

            if(resultJon != null){
                  var hasError =jsonResponse.error;
                  var errorList = jsonResponse.errorCodes;

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

                      if(codigoDeErro == 'LOGINERROR_SENHA_INCORRETA'){
                        showMsgErroSenha('Sua senha está incorreta!');                  
                      }

                      if(codigoDeErro == 'LOGINERROR_USUARIO_BLOQUEADO'){
                        atualizarStatus(false, true, false, false, 'Usuário bloqueado! Entre em contato com o seu patrocinador!' );
                      }

                    }
                  }else{
                    

                    //
                      
                      console.log('sem erros');
                     // $scope.password = '';
                    //  $rootScope.user = response.data.result.user;
                      var usuarioLogado = jsonResponse.user;
                      sessionStorage.setItem('loggedUser', JSON.stringify(usuarioLogado));
                      console.log('Usuario adicionado no sessionStorage ' +JSON.stringify(usuarioLogado) );
                      //LoggedUserService.setLoggedUser($rootScope.user);
                    
                    //  $cookieStore.put('pgn-userid', iddoUsuario);
                     // $location.path("/app/meuscursos");
                      //setValues({ ...values, showErrorMessage: false, showEmailError: false, showPasswordError: false, doingLogin : false }); 
                      window.location.href = '/';
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
         this.setState({showSucessMessage: true});   
      }
     
    }
    const handleChange = (prop) => (event) => {

      if(prop === 'nome'){
          this.setState({ [prop]: event.target.value, showErrorNome: false, msgErrorNome: '' })  
      }else if(prop === 'sobrenome'){
          this.setState({  [prop]: event.target.value, showErrorSobrenome: false , msgErrorSobrenome: ''})  
      }if(prop === 'email'){
          this.setState({  [prop]: event.target.value, showErrorEmail: false, msgErrorEmail: '' })  
      }if(prop === 'celular'){
          this.setState({  [prop]: event.target.value, showErrorCelular: false, msgErrorCelular: '' })  
      }if(prop === 'codigoEmpreendedor'){
          this.setState({  [prop]: event.target.value.toUpperCase(), showErrorCodigoEmpreendedor: false, msgErrorCodigoEmpreendedor: '' })  
      } else {
        this.setState({ [prop]: event.target.value })
      }
      
    }

    if(this.state.showSucessMessage){

      return(
<Card>
          <CardHeader  titleTypographyProps={{ variant: 'h6' }} />
          <CardContent >
            <form onSubmit={e => e.preventDefault()}>
              <Grid container spacing={5}>
                          
              
                <Grid item xs={12}>
                  <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" alignItems="center" justifyContent="center">
                    <Typography variant='body1' sx={{ marginBottom: 1.5, textAlign: 'center' }} >
                       Cadastro do empreendedor {this.state.nome} {this.state.sobrenome} foi realizado com sucesso!
                    </Typography>

                  </Alert>
                  <br/>
                  <Typography variant='body1' sx={{ marginBottom: 1.5, textAlign: 'center' }} >
                    <b>Um e-mail será enviado automaticamente</b> nos próximos minutos para {this.state.email} <b>com os dados de acesso ao EAD.</b>
                  </Typography>

                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body1' sx={{ marginBottom: 1.5, textAlign: 'center' }} >
                   <b> O que você quer fazer agora?</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} >
                 <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" justifyContent="center" alignItems="center">
                  <Button variant='outlined'  size='large' onClick={()=> onClickListarEmpreendedores()}> 
                    Listar Empreendedores
                  </Button>
                  <Button type='submit' variant='contained' size='large' onClick={()=> onClickCadastrarOutro()} >
                    Cadastrar Outro
                  </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      );
    }else{
      return (
       <>
        <Card>
          <CardHeader title='Cadastro de empreendedor' titleTypographyProps={{ variant: 'h6' , mb: 5, mt: 5}} avatar={<PersonAddIcon />}>
          
          </CardHeader>

          <CardContent >
            <form noValidate autoComplete='off'  onSubmit={e => e.preventDefault()}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Nome'
                    error={this.state.showErrorNome}
                    helperText={this.state.msgErrorNome}
                    placeholder='Primeiro nome'
                    inputProps={{
                      maxLength: 150,
                    }}
                    onChange={handleChange('nome')} 
                    value={this.state.nome}
                    
                    InputProps={{
                
                      startAdornment: (
                        <InputAdornment position='start'>
                          <AccountOutline />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Sobrenome'
                    required
                    inputProps={{
                      maxLength: 150,
                    }}
                    error={this.state.showErrorSobrenome}
                    helperText={this.state.msgErrorSobrenome}
                    placeholder='Sobrenome'
                   onChange={handleChange('sobrenome')} 
                    value={this.state.sobrenome}
                    InputProps={ {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <AccountOutline />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type='email'
                    label='Email'

                    value={this.state.email}
                    error={this.state.showErrorEmail}
                    helperText={this.state.msgErrorEmail}
                    onChange={handleChange('email')} 
                    inputProps={{
                      maxLength: 150,
                    }}
                    placeholder='seuemail@gmail.com'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <EmailOutline />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputMask
                    mask="(99) 99999-9999"
                    disabled={false}
                    maskChar=" "
                    value={this.state.celular}
                    onChange={handleChange('celular')} 
                    >
                       {() => <TextField variant="outlined" 
                                fullWidth
                                required
                                type='phone'
                                label='Celular' 
                               
                                placeholder='(00) 00000-0000'
                                error={this.state.showErrorCelular}
                                helperText={this.state.msgErrorCelular}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <Phone />
                                    </InputAdornment>
                                  )
                                }} />}
                  </InputMask>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    type='text'
                    label='Cód. Empreendedor'
                    error={this.state.showErrorCodigoEmpreendedor}
                    helperText={this.state.msgErrorCodigoEmpreendedor}
                    placeholder='RJXC0000'
                    inputProps={{
                      maxLength: 9,
                    }}
                    onChange={handleChange('codigoEmpreendedor')} 
                    value={this.state.codigoEmpreendedor}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <TagOutline />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Código da Distribuição'
                    onChange={handleChange('codigoDistribuicao')} 
                    inputProps={{
                      maxLength: 10,
                    }}
                    value={this.state.codigoDistribuicao}
                    placeholder='Código de Distribuição'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <HandshakeOutline />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='text'
                    label='Nome da Distribuição'
                    inputProps={{
                      maxLength: 150,
                    }}
                    onChange={handleChange('nomeDistribuicao')} 
                    value={this.state.nomeDistribuicao}
                    placeholder='Nome da Distribuição'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <BusinessIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                

                <Grid item xs={12}>
                  <Checkbox
                    label='Pode cadastrar recrutas?'
                    placeholder='Sim'
                    onChange={handleChange('podeCadastrarRecrutas')} 
                    value={this.state.podeCadastrarRecrutas}
                  />
                  Pode cadastrar recrutas?
                  <Tooltip title='Ao marcar esta opção seu empreendedor também irá receber um login e senha para acessar este sistema de gestão de equipe para que ele possa liberar acessos do ead para os empreendedores dele.'>
                    <IconButton>
                      
                      <HelpOutlineIcon />
                 
                    </IconButton>
                  </Tooltip>
                </Grid>


                <Grid item xs={12}>
                  
                  <Button variant='warning'  size='large'>
                    Cancelar
                  </Button>
                  <Button type='submit' variant='contained' size='large' onClick={()=> onClickCadastrar()}>
                    Cadastrar
                  </Button>
                  <ProgressContainer show={this.state.salvandoDados}/>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
        </>
      )
};
}

}







