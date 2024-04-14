import { Component, MouseEvent, useState } from 'react'

import axios from 'axios'
import {SERVICES_CONTEXT} from 'src/@core/constants/constants.js'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
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
import EditIcon from '@mui/icons-material/Edit';
import QueryStatsIcon from  '@mui/icons-material/QueryStats'
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TableRow from '@mui/material/TableRow' 
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip';

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

var showModalExcluir = false;
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

function ButtonsContainer (props){
  if(props.closeOptions){
    return(
        <>
        <Button onClick={()=>{handleCloseModalExcluir()}} variant="contained">Obrigado</Button>
        </>
    );
  }else{
    return (
      <>
        <Button onClick={()=>{handleCloseModalExcluir()}}variant="outlined">Não, obrigado</Button>
        <Button onClick={()=>{confirmaExclusao(empreendedorSelecionado)}} variant="contained" autoFocus>
            Sim, claro!
        </Button>
          </>
      );
  }

}


function ProgressContainer (props){
  if (props.excluido){
        return (
            <Stack sx={{ width: '100%', mb: 10, mt: 10 }} spacing={2}>
               <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" alignItems="center" justifyContent="center">
                    <Typography variant='body1' sx={{ marginBottom: 1.5, textAlign: 'center' }} >
                       Empreendedor excluído com sucesso!
                    </Typography>

               </Alert>
            </Stack>
        )
    }
    if (props.show){
        return (
            <Stack sx={{ width: '100%', mb: 10, mt: 10 }} spacing={2}>
                <LinearProgress />
                <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Excluindo emprendedor...
              </Typography>
            </Stack>
        )
    }
    return null
}

function LinhasEmpreenderoresTable (props){
  var empreendedores = props.empreendedores;
  const [open, setOpen] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [empreendedorSelecionado, setEmpreendedorSelecionado] = useState({nome: '', sobrenome:'', email: ''});
  

  const openModalExcluir = (empreendedor) => {
        console.log('openModalExcluir' + empreendedor);
       setOpen(true);
       setEmpreendedorSelecionado(empreendedor);
    
  }
  const confirmaExclusao=(empreendedor) =>{
  
    console.log('confirmaExclusao');
    var user = sessionStorage.getItem('loggedUser');
    if(user != null){
      user = JSON.parse(user);
    }
    var idPatrocinador = user.idEmpreendedor;
    setExcluindo(true);
    axios({
          method: 'post',
          url:  SERVICES_CONTEXT + '/empreendedorservice/removerEmpreendedor?idEmpreendedor=' + empreendedor.idEmpreendedor+ '&idPatrocinador=' + idPatrocinador,
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
                    setExcluindo(false);
                    for (var int = 0; int < errorList.length; int++) {
                      var codigoDeErro = errorList[int];          
                      if(codigoDeErro == 'EMPREENDEDORSERVICE_JA_EXISTE_EMREENDEDOR_CADASTRADO_COM_CODIGODEDISTRIBUICAO'){
                          mostrarRetornoServicoCodigoDistribuicao(
                            false,
                            true,
                            'Já existe cadastro com este código de distribuição!'
                        );
        
                      }

                    }
                  }else{
                    

                    //
                      setExcluindo(false);
                      setExcluido(true);
                      console.log('sem erros');
                     // $scope.password = '';
                    //  $rootScope.user = response.data.result.user;
                    //mostrar mensagem de sucesso  
                      mostrarMensagemDeSucesso();

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
        // this.setState({showSucessMessage: true});   
}
     
    

const handleCloseModalBotaoObrigado = () => {
        window.location.href = '/empreendedores';
        setOpen(false);
}
const handleCloseModalExcluir = () => {
  console.log('handleCloseModalExcluir');
        setOpen(false);
}
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
      var buttons;
      if(excluido){
        buttons = <Button onClick={()=>{handleCloseModalBotaoObrigado()}} variant="contained" color="success" autoFocus>Ok, Obrigado!</Button>;
      }else{
        buttons = <>
        <Button onClick={()=>{handleCloseModalExcluir()}}variant="outlined">Não, obrigado</Button>
        <Button onClick={()=>{confirmaExclusao(empreendedorSelecionado)}} variant="contained" color="error" autoFocus>
            Sim, Quero Excluir Mesmo Assim!
        </Button>
          </>;
      }
  
      return(
        <div>
       <Dialog
        open={open}
        onClose={handleCloseModalExcluir}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Tem certeza que deseja excluir o empreendedor?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant='body1'>
                {empreendedorSelecionado.nome}  {empreendedorSelecionado.sobrenome} - {empreendedorSelecionado.codigoEmpreendedor}
            </Typography>
           
           <Typography variant='body1' >
                {empreendedorSelecionado.email}
           </Typography>
           <Alert icon={<WarningAmberIcon/>} severity="error" alignItems="center" justifyContent="center">
            <Typography variant='body1'>
                      <b>Atenção!</b> O usuário dele no EAD e todo o histórico de estudos será perdido!
            </Typography>
          </Alert>
           <ProgressContainer show={excluindo} excluido={excluido}/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {buttons}
        </DialogActions>
      </Dialog>
        <TableContainer>
        <Table sx={{ minWidth: 800 , maxHeight: 400}} aria-label='table in dashboard'>
          <TableHead>
            <TableRow>
              <StyledTableCell>Nome</StyledTableCell>
              <StyledTableCell sx={{alignContent: 'center', textAlign: 'center'}}>Pode Recrutar?</StyledTableCell>
              <StyledTableCell sx={{alignContent: 'center', textAlign: 'center'}}>Qtde Diretos Cadastrados</StyledTableCell>
              <StyledTableCell sx={{alignContent: 'center', textAlign: 'center'}}>Dt. cadastro</StyledTableCell>
              <StyledTableCell sx={{alignContent: 'center', textAlign: 'center'}}>Ult Acesso</StyledTableCell>
              <StyledTableCell sx={{alignContent: 'center', textAlign: 'center'}}>Ação</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
        {props.empreendedores.map((row) => (
              <StyledTableRow hover key={row.idEmpreendedor} sx={{ '&:last-of-type td, &:last-of-type th ': { border: 0 } }}>
                <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.nome}  {row.sobrenome} - {row.codigoEmpreendedor}</Typography>
                    <Typography variant='caption'>{row.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>{row.podeRecrutar? 'Sim': 'Não'}</TableCell>
                <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>{row.qtdDiretosCadastrados}</TableCell>
                <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>{row.dtCadastro}</TableCell>
                <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>
                  {row.dhUltimoAcesso != null ? 
                    row.dhUltimoAcesso: 
                    (

                       <Typography variant="body2"> 
                         Ainda não acessou
                       </Typography>
                  
                    )
                  }
                  </TableCell>
                <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>
                  <Tooltip title="Visualizar relatório de estudos do empreendedor">
                    <IconButton>
                      <Link onClick={()=> abrirRelatorioDeEstudosDoEmpreendedor(row.idEmpreendedor)}>
                      <QueryStatsIcon />
                      </Link>
                    </IconButton>
                  </Tooltip>
                 
                  <Tooltip title="Excluir o empreendedor">
                      <IconButton onClick={()=> openModalExcluir(row)}>
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
    
}



class DashboardTable extends Component{
  constructor(props){
    super(props);
    this.state = {
            empreendedores: [],
            loadingEmpreendedores: true,
            showModalExcluir: false
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
