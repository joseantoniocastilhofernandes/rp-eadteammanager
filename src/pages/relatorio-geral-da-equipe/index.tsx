// ** MUI Imports
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'

// ** Demo Components Imports


import StudyReportTable from 'src/views/reports/StudyReportTable'

const MUITable = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>
          Relatório geral de andamento de estudos da equipe
        </Typography>
        
      </Grid>
      <Grid item xs={12}>
        <Card>
          <StudyReportTable />
        </Card>
      </Grid>
    </Grid>
  )
}

export default MUITable
