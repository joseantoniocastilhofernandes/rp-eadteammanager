import { ChangeEvent, Component, MouseEvent, ReactNode, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import axios from 'axios'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

// ** Demo Components Imports
import { styled } from '@mui/material/styles'
import { TableCellProps, tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table' 
import TableRow from '@mui/material/TableRow' 
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableBasic from 'src/views/tables/TableBasic'
import TableDense from 'src/views/tables/TableDense'
import TableSpanning from 'src/views/tables/TableSpanning'
import TableCustomized from 'src/views/tables/TableCustomized'
import TableCollapsible from 'src/views/tables/TableCollapsible'
import TableStickyHeader from 'src/views/tables/TableStickyHeader'


//faz o head da tabela
const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.blueroyal
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}))
//linhas com cores diferentes na tabela
const StyledTableRow = styled(TableRow)<TableRowProps>(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },

  // hide last border
  '&:last-of-type td, &:last-of-type th': {
    border: 0
  }
}))

const ccyFormat = (num: number) => {
  if(num){
    return `${num.toFixed(2)}`  
  }else return 0;
  
}

function Aprovado(props){
  const nota = props.nota;
  if(nota != null && nota >= 8){
    return  <Chip label='Aprovado' color="success"/>;
  }else{
      return <Box/>;
  }
}

function RelatorioDeEstudosDoEmpreendedor (props){
  var reportData = props.reportData;
  var notaGeral = props.notaGeral;
  console.log('props.reportData.notas' + props.reportData.notas);

    if(props.loadingReport == true){
      return(
        <Stack sx={{ width: '100%', marginBottom: '10px', mt: 7}} spacing={2}>
            <LinearProgress />
            <Typography variant='body1' sx={{ fontWeight: 300, marginBottom: 1.5, textAlign: 'center' }}>
                    Carregando o relatório de estudos do empreendedor...
            </Typography>
        </Stack>
      )
    }
    if (!props.permissaoDeAcesso){
        return (
          <Container>
              <Alert severity="error">
                <Typography variant='h5' sx={{alignContent: 'center'}}>Ops! Infelizmente você não tem permissão para acessar o relatório deste empreendedor!</Typography>
                <Typography variant='subtitle1' ><b>Nota: </b>Você pode visualizar apenas os relatórios de estudos dos seus empreendedores/distribuidores diretos.</Typography>
              </Alert> 

              <Box sx={{ mb: 4, mt: 5, display: 'flex', alignItems: 'center',  flexWrap: 'wrap', justifyContent: 'center' }}>

                 
              </Box>
          </Container>
        )
    }else{
      return(
        <Container>
          <Box sx={{ minWidth: 275 , mb:5}}>
                <Card variant="outlined">
                  <CardContent>
                        
                        <Typography variant="h5" component="div">
                          Relatório de Estudos do Empreendedor {props.dhReport}
                        </Typography>
                        <Typography sx={{ mt:5 }} color="text.secondary">
                         <b>Curso:</b> {props.reportData.nomeDoCurso}
                        </Typography>
                        <Typography color="text.secondary">
                          <b>Empreendedor: </b> {props.reportData.empreendedor.nome} {props.reportData.empreendedor.sobrenome}  - {props.reportData.empreendedor.email}
                        </Typography>
                        <Typography  color="text.secondary">
                          <b>Código do empreendedor:</b> {props.reportData.empreendedor.codigoEmpreendedor}
                        </Typography>
                         <Typography  sx={{ mb:10 }} color="text.secondary">
                          Iniciou os estudos em {(props.reportData.dhInicioEstudosNoCurso)} há {props.reportData.quantidadeDeDiasEstudando} dias.
                        </Typography>


                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} aria-label='customized table'>
                          <TableHead>
                            <TableRow>
                              <StyledTableCell>Módulo</StyledTableCell>
                              <StyledTableCell align='center'>N° de tentativas</StyledTableCell>
                              <StyledTableCell align='center'>Maior Nota</StyledTableCell>
                              <StyledTableCell align='center'>Dh Ultima Tentativa</StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {props.reportData.notas.map(row => (
                              <StyledTableRow
                                key={row.section}
                                sx={{
                                  '&:last-of-type td, &:last-of-type th': {
                                    border: 0
                                  }
                                }}
                              >
                                <StyledTableCell component='th' scope='row'>
                                  {row.modulo}
                                </StyledTableCell>
                                <StyledTableCell align='center'>{row.numeroDeTentativas ==0? 'N/A': row.numeroDeTentativas}</StyledTableCell>
                                <StyledTableCell align='center'>{row.nota ==0? 'N/A': row.nota}</StyledTableCell>
                                <StyledTableCell align='center'>{row.dhUltimaTentativa == null? 'N/A': row.dhUltimaTentativa}</StyledTableCell>
                              </StyledTableRow>
                            ))}

                            <TableRow>
                              <TableCell align='right' colSpan={2}>Média geral</TableCell>
                              <TableCell align='right'>

                                <Chip label={ccyFormat(notaGeral)} color="success">
                                    
                                </Chip>
                              </TableCell>
                               <TableCell align='left'>
                                <Aprovado nota={notaGeral}/>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                  </CardContent>
                </Card>
          </Box>
         
      </Container>
      )
    }
    
}

class MUITable extends Component{
  constructor(props){
    super(props);
    var today = new Date();
    var date = today.toLocaleString();
    this.state = {
            reportData: [],
            loadingReport: true,
            permissaoDeAcesso: false,
            dhGeracaoDoRelatorio: date
    };
 
  }

  componentDidMount() {
      const setReportData = (e)=>{
        this.setState({ ...this.state, reportData: e, loadingReport: false, permissaoDeAcesso: true}); 
      }
      console.log('componentDidMount');
      var user = sessionStorage.getItem('loggedUser');
      console.log('Obtendo Usuario logado do sessionStorage ' + user );
      

console.log('componentDidMount');
    var reportData = [];
    var user = sessionStorage.getItem('loggedUser');
    console.log('Obtendo Usuario logado do sessionStorage ' + user );
    const queryParameters = new URLSearchParams(window.location.search);
    const idEmpreendedor = queryParameters.get("idEmpreendedor");
    if(user != null){
      //carregar
      var usuarioLogado = JSON.parse(user);
      axios({
          method: 'get',
          url: 'http://localhost:8080/EadManager/rest/empreendedorservice/carregarResumoRelatorioDeEstudos?idEmpreendedor='+idEmpreendedor  +'&idCurso=2&idPatrocinador='+ usuarioLogado.idEmpreendedor ,
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
                reportData = jsonResponse;
                setReportData(reportData);                  
                console.log('Empreendedores: ' + reportData);
            }

          }else{
           // $scope.errorMessage = response.data.errorMessage;
            //$scope.show=true;
          }


        })
        .catch(function (error) {
          console.log(error);
        
        });
        console.log('Empreendedores Carregados ' + reportData);
        console.log('Empreendedores Carregados ' + this.state.reportData);
        

    }else{
      console.log('Usuário ainda nao logado');
      window.location.href = '/';
    }      

    }

  render() {
      return (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            
            <RelatorioDeEstudosDoEmpreendedor loadingReport={this.state.loadingReport} reportData={this.state.reportData} dhReport={this.state.dhGeracaoDoRelatorio} notaGeral={this.state.reportData.notaGeral} permissaoDeAcesso={this.state.permissaoDeAcesso}/>

          </Grid>
        </Grid>
      )
    }
}

export default MUITable
