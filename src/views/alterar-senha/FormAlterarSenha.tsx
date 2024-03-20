// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import axios from 'axios'

// ** Icons Imports
import Phone from 'mdi-material-ui/Phone'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import TagOutline from 'mdi-material-ui/TagOutline'
import HandshakeOutline from 'mdi-material-ui/HandshakeOutline'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import KeyIcon from '@mui/icons-material/Key';
import IconButton from '@mui/material/IconButton'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography'

import React, { Component, useState , useEffect} from 'react';
import {SERVICES_CONTEXT} from 'src/@core/constants/constants.js'

function ShowSuccessMessage(props){
  if(props.salvandoDados){
      return (
        <Stack sx={{ width: '100%', mb: 2, mt: 2, textAlign: 'center' }} >
            <LinearProgress />
            <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                Salvando sua nova senha...
            </Typography>
        </Stack>
    );
  }else  if(props.show){
    return (
        <Stack sx={{ width: '100%', mb: 2, mt: 2, textAlign: 'center' }} >
                <Alert severity="success">Sua senha foi alterada com sucesso!</Alert>
        </Stack>
    );
  }else{
    return (
        <Stack sx={{ width: '100%', marginBottom: '0px' }}>
                
        </Stack>
      );
  }
}

class FormAlterarSenha extends Component {
   constructor(props){
    super(props);
    this.state = {
  
    'idEmpreendedor' : 0,
    'senhaAntiga': '',
    'senhaAntigaError': false,
    'senhaAntigaMsg': '',
    'novaSenha': '',
    'novaSenhaMsg': '',
    'repitaNovaSenha': '',
    'repitaNovaSenhaMsg': '',
    'repitaNovaSenhaError': false,
    'showSenhaAntiga': false,
    'showNovaSenha': false,
    'showRepitaNovaSenha': false,
    'senhaAlteradaComSucesso': false,
    'salvandoDados' : false

  
  }
}
componentDidMount() {

     var loggedUser = sessionStorage.getItem('loggedUser');
     if(loggedUser != null){
      loggedUser = JSON.parse(loggedUser);
       this.setState({ 
          'idEmpreendedor': loggedUser.idEmpreendedor, 
        });
     }else{
      window.location.href = '/';
     }
    console.log('componentDidMount');
}


  render(){

    const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {

       if(prop === 'senhaAntiga'){
          this.setState({ [prop]: event.target.value, senhaAntigaError: false, senhaAntigaMsg: '' })  
       }else if(prop === 'novaSenha'){
          this.setState({  [prop]: event.target.value, novaSenhaError: false , novaSenhaMsg: ''})  
       }if(prop === 'repitaNovaSenha'){
          this.setState({  [prop]: event.target.value, repitaNovaSenhaError: false, repitaNovaSenhaMsg: '' })  
       }else {
          this.setState({ [prop]: event.target.value })
       }      

    }
  
    const atualizarStatus = (senhaAlteradaComSucesso,senhaAntigaError,senhaAntigaMsg, novaSenhaError, novaSenhaMsg ) =>{
      this.setState(
        {   
        'senhaAlteradaComSucesso': senhaAlteradaComSucesso, 
        'senhaAntigaError': senhaAntigaError, 
        'senhaAntigaMsg': senhaAntigaMsg, 
        'novaSenhaError': novaSenhaError, 
        'novaSenhaMsg': novaSenhaMsg,
        'senhaAlteradaComSucesso': false,
        'salvandoDados' : false 
      }) ;
    
    }

    const showSucessMessage=()=>{
      this.setState(
        { ...this.state,  
        'senhaAlteradaComSucesso': true,
        'salvandoDados' : false,
        }) ;
    }
    const alterarSenha = ()=>{
      console.log('alterarSenha');
      var hasFormErrors =false;
      if(this.state.senhaAntiga === ''){
        hasFormErrors = true;
        this.setState({ 
          'senhaAntigaError': true, 
          'senhaAntigaMsg': 'Digite a sua senha atual'});

        
      }
      if(this.state.novaSenha === ''){
        hasFormErrors = true;
        this.setState({ 
          'novaSenhaError': true,  
          'repitaNovaSenhaMsg': '',
          'novaSenhaMsg': 'Digite a sua nova senha'
        });

      }
      if(this.state.novaSenha != this.state.repitaNovaSenha){
        hasFormErrors = true;
        this.setState({ 
          'novaSenhaError': true,  
          'repitaNovaSenhaError': true,  
          'repitaNovaSenhaMsg': 'Senha repetida não é igual a nova senha! Confira!'
        });

     
      }
      if(!hasFormErrors){
          var idEmpreendedor = this.state.idEmpreendedor;
          this.setState({ 
          'salvandoDados': true
          });
  
          axios({
            method: 'post',
            url:  SERVICES_CONTEXT + '/loginservice/alterarSenha?idEmpreendedor='+ idEmpreendedor + '&senhaAntiga=' + this.state.senhaAntiga + '&novaSenha=' + this.state.novaSenha,
            withCredentials: false,

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
                      if(codigoDeErro == 'ALTERARSENHAERROR_SENHA_ATUAL_INCORRETA'){
                        atualizarStatus(false, true, 'Senha atual informada está incorreta!', false, '');
                      }

                      if(codigoDeErro == 'ALTERARSENHAERROR_TAMANHO_MINIMO_REQUERIDO'){
                        atualizarStatus(false, true, 'Nova senha deve ter pelo menos 6 caracteres!', false, '' );
                      }

                      if(codigoDeErro == 'ALTERARSENHAERROR_DEVE_SER_DIFERENTE_DA_SENHA_ANTERIOR'){
                          atualizarStatus(false, true, 'Sua nova senha deve ser diferente da senha anterior!', false,  );
                      }


                    }
                  }else{
                    

                    //
                      
                      console.log('sem erros');
                      showSucessMessage();
                   
                      //LoggedUserService.setLoggedUser($rootScope.user);
                    
                    //  $cookieStore.put('pgn-userid', iddoUsuario);
                     // $location.path("/app/meuscursos");
                      //setValues({ ...values, showErrorMessage: false, showEmailError: false, showPasswordError: false, doingLogin : false }); 
                      //window.location.href = '/';
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
          //end copy
      }    
  }
  return (
<Card>
      <CardHeader title='Alteração de sua senha de acesso' titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
            

              <TextField
                fullWidth
                label='Senha Atual'
                error={this.state.senhaAntigaError}
                helperText={this.state.senhaAntigaMsg}
                placeholder='Senha atual'
                onChange={handleChange('senhaAntiga')}
                value = {this.state.senhaAntiga}
                type={this.state.showSenhaAntiga ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <KeyIcon />
                    </InputAdornment>
                  ),
                   endAdornment: (
                    <InputAdornment position='end' onClick={()=> {
                      this.setState({'showSenhaAntiga': !this.state.showSenhaAntiga});
                    }}>
                      <KeyIcon />
                    </InputAdornment>
                  )
                }}
              />

             
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Nova Senha'
                error={this.state.novaSenhaError}
                helperText={this.state.novaSenhaMsg}
                placeholder='Nova Senha'
                value = {this.state.novaSenha}
                type={this.state.showNovaSenha ? 'text' : 'password'}
                onChange={handleChange('novaSenha')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <KeyIcon />
                    </InputAdornment>
                  ),
                   endAdornment: (
                    <InputAdornment position='end' onClick={()=> {
                        this.setState({'showNovaSenha': !this.state.showNovaSenha})

                      
                    }}>
                      <KeyIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='Repita a nova senha'
                value = {this.state.repitaNovaSenha}
                type={this.state.showRepitaNovaSenha ? 'text' : 'password'}
                error={this.state.repitaNovaSenhaError}
                helperText={this.state.repitaNovaSenhaMsg}
                onChange={handleChange('repitaNovaSenha')}
                placeholder='Repita a nova senha'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <KeyIcon />
                    </InputAdornment>
                  ),
                   endAdornment: (
                    <InputAdornment position='end' onClick={()=> {
                      this.setState({'showRepitaNovaSenha': !this.state.showRepitaNovaSenha})
                    }}>
                      <KeyIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
                <ShowSuccessMessage show={this.state.senhaAlteradaComSucesso} salvandoDados={this.state.salvandoDados}/>
            </Grid>
            <Grid item xs={12}>
              <Button variant='warning'  size='large' onClick={()=> {
                  window.location.href= '/empreendedores';
              }}>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' size='large'   onClick={alterarSenha}>
                Salvar
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
    )
}
  
}
export default FormAlterarSenha
