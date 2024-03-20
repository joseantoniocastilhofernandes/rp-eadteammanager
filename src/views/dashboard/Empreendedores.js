import { Component, MouseEvent, useState } from 'react'

import axios from 'axios'
import {SERVICES_CONTEXT} from 'src/@core/constants/constants.js'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Container from '@mui/material/Container'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import { styled } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'

import IconButton from '@mui/material/IconButton'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import EditIcon from '@mui/icons-material/Edit';
import QueryStatsIcon from  '@mui/icons-material/QueryStats'
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TableRow from '@mui/material/TableRow' 
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'

import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Link from '@mui/material/Link'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))




//faz o head da tabela
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: '#001D34'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}))
//linhas com cores diferentes na tabela
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },

  // hide last border
  '&:last-of-type td, &:last-of-type th': {
    border: 0
  }
}))


function cadastrarEmpreendedorClick(){

 
  window.location.href = '/cadastro-de-empreendedor';
}

const abrirRelatorioDeEstudosDoEmpreendedor= (idEmpreendedor)=>{
  window.location.href = '/relatorio-de-estudo?idEmpreendedor='+ idEmpreendedor;
}



function LinhasEmpreenderoresTable (props){
  var empreendedores = props.empreendedores;
  console.log('props.empreendedores' + props.empreendedores);
  console.log('props.empreendedores.length' + props.empreendedores.length);
    if(props.loading == true){
      return(
        <Stack sx={{ width: '100%', marginBottom: '10px', mt: 7}} spacing={2}>
            <LinearProgress />
            <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Carregando os seus empreendedores...
            </Typography>
        </Stack>
      )
    }
    if (props.empreendedores == null || props.empreendedores.length  == 0){
        return (
          <Container>
              <Alert severity="warning">
                <Typography variant='h5' sx={{alignContent: 'center'}}>Nenhum empreendedor cadastrado!</Typography>
                <Typography variant='subtitle1' ><b>Nota: </b>Após cadastrar o empreendedor, ele receberá os dados de acesso ao EAD automaticamente via e-mail.</Typography>
              </Alert> 

              <Box sx={{ mb: 4, mt: 5, display: 'flex', alignItems: 'center',  flexWrap: 'wrap', justifyContent: 'center' }}>

                <Button variant="contained" endIcon={<PersonAddAltIcon/>} onClick={cadastrarEmpreendedorClick}>
                    Cadastrar empreendedor
                </Button>  
              </Box>
          </Container>
        )
    }else{
      return(

        <TableContainer>
        <Table sx={{ minWidth: 800 , maxHeight: 400}} aria-label='table in dashboard'>
          <TableHead>
            <TableRow>
              <StyledTableCell>Nome</StyledTableCell>
              <StyledTableCell>Pode Recrutar?</StyledTableCell>
              <StyledTableCell>Dt. cadastro</StyledTableCell>
              <StyledTableCell>Ult Acesso</StyledTableCell>
              <StyledTableCell>Ação</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
        {props.empreendedores.map((row) => (
              <StyledTableRow hover key={row.idEmpreendedor} sx={{ '&:last-of-type td, &:last-of-type th ': { border: 0 } }}>
                <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.nome} </Typography>
                    <Typography variant='caption'>{row.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.podeRecrutar? 'Sim': 'Não'}</TableCell>
                <TableCell>{row.dtCadastro}</TableCell>
                <TableCell>{row.dhUltimoAcesso}</TableCell>
                <TableCell>
                  <IconButton>
                    <Link onClick={()=> abrirRelatorioDeEstudosDoEmpreendedor(row.idEmpreendedor)}>
                    <QueryStatsIcon />
                    </Link>
                  </IconButton>
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
                  
                </TableCell>
              </StyledTableRow>
            ))}
        </TableBody>
        </Table>
      </TableContainer>
      )
    }
    
}



class DashboardTable extends Component{
  constructor(props){
    super(props);
    this.state = {
            empreendedores: [],
            loadingEmpreendedores: true
    };
 
  }

  
   
  componentDidMount(){

    const setEmpreendedores = (e)=>{
      this.setState({ ...this.state, empreendedores: e, loadingEmpreendedores: false}); 
    }

    console.log('componentDidMount');
    var empreendedores = [];
    var user = sessionStorage.getItem('loggedUser');
    console.log('Obtendo Usuario logado do sessionStorage ' + user );
    if(user != null){
      //carregar
      var usuarioLogado = JSON.parse(user);
      axios({
          method: 'get',
          url:  SERVICES_CONTEXT + '/empreendedorservice/listarMeusEmpreendedores?idEmpreendedor=' + usuarioLogado.idEmpreendedor ,
          withCredentials: false,
        }
      ).then(function (response) {
         

         
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
            }else{
                console.log('sem erros');
                empreendedores = jsonResponse.empreendedores;
                setEmpreendedores(empreendedores);
                
                  
                console.log('Empreendedores: ' + empreendedores)
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


        })
        .catch(function (error) {
          console.log(error);
        
        });
        console.log('Empreendedores Carregados ' + empreendedores);
        console.log('Empreendedores Carregados ' + this.state.empreendedores);
        

    }else{
      console.log('Usuário ainda nao logado');
      window.location.href = '/';
    }      

  }
  render(){
    return (
    <Card>
      <CardHeader title=' Empreendedores cadastrados na sua distribuição' titleTypographyProps={{ variant: '56' }}>
      </CardHeader>
      <CardContent>
          <LinhasEmpreenderoresTable empreendedores={this.state.empreendedores} loading={this.state.loadingEmpreendedores}/>       
      </CardContent>
    </Card>
    )
  }
  
}

export default DashboardTable
