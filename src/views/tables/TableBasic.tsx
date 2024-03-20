// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell, { TableCellProps, tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

const createData = (name: string, calories: number, fat: number, carbs: number, protein: number) => {
  return { name, calories, fat, carbs, protein }
}

const ccyFormat = (num: number) => {
  return `${num.toFixed(2)}`
}

const notaGeral = 10;

const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}))

const StyledTableRow = styled(TableRow)<TableRowProps>(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },

  // hide last border
  '&:last-of-type td, &:last-of-type th': {
    border: 0
  }
}))

const rows = [
  createData('Prospecção e agendamento de visitas', 1, 6.0, 24, '26/02/24 18:25'),
  createData('Como fazer a demosntração', 2, 9.0, 37, '26/02/24 18:25'),
  createData('Como obter excelentes indicações com o 4 em 14', 1, 16.0, 24, '26/02/24 18:25'),
  createData('Calculo de preços, brindes e descontos', 1, 3.7, 67, '26/02/24 18:25'),
  createData('Fechamento e negociação', 0, 'N/A', 'N/A', 'N/A'),
  createData('Preenchimento de pedidos via Docucite', 3, 16.0, 49, '26/02/24 18:25'),
  createData('Pós-venda', 1, 16.0, 49, '26/02/24 18:25'),
  createData('Entendendo o modelo de negócios', 1, 16.0, 49, '26/02/24 18:25'),
  createData('Recrutamento e entrevista', 1, 16.0, 49, '26/02/24 18:25'),
  createData('Estratégias de crescimento', 1, 16.0, 49, '26/02/24 18:25')
]

const TableBasic = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='customized table'>
        <TableHead>
          <TableRow>
            <StyledTableCell>Módulo</StyledTableCell>
            <StyledTableCell align='right'>N° de tentativas</StyledTableCell>
            <StyledTableCell align='right'>Maior Nota</StyledTableCell>
            <StyledTableCell align='right'>Dh Ultima Tentativa</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <StyledTableRow
              key={row.name}
              sx={{
                '&:last-of-type td, &:last-of-type th': {
                  border: 0
                }
              }}
            >
              <StyledTableCell component='th' scope='row'>
                {row.name}
              </StyledTableCell>
              <StyledTableCell align='right'>{row.calories}</StyledTableCell>
              <StyledTableCell align='right'>{row.fat}</StyledTableCell>
              <StyledTableCell align='right'>{row.protein}</StyledTableCell>
            </StyledTableRow>
          ))}

           <TableRow>
            <TableCell align='right' colSpan={2}>Média geral</TableCell>
            <TableCell align='right'>

              <Chip label={ccyFormat(notaGeral)} color="success">
                  
              </Chip>
            </TableCell>
             <TableCell align='left'>

              <Chip label='Aprovado' color="success">
                  
              </Chip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TableBasic
