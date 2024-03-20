// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icons Imports
import Phone from 'mdi-material-ui/Phone'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import TagOutline from 'mdi-material-ui/TagOutline'
import HandshakeOutline from 'mdi-material-ui/HandshakeOutline'

import React, { useState } from 'react'



const FormCadastroDeEmpreendedor = () => {

const [empreendedor, setEmpreendedor] = useState({
  {
    id : 0,
    email: 'emailteste@gmail.com',
    nome: '',
    sobrenome: '',
    codigoEmpreendedor: '',
    codigoDistribuicao: 0,
    nomeDistribuicao: 0,
    podeCadastrarRecrutas: false

  }
});
  return (
    <Card>
      <CardHeader title='Cadastro de novo empreendedor' titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Nome'
                required
                placeholder='Primeiro nome do empreendedor'
                value = {empreendedor.nome}
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
                placeholder='Sobrenome do empreendedor'
                value = {empreendedor.sobrenome}
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
                required
                type='email'
                label='Email'
                value = {empreendedor.email}
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
              <TextField
                fullWidth
                required
                type='text'
                label='Cód. Empreendedor'
                placeholder='RJXC0000'
                value = {empreendedor.codigoEmpreendedor}
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
                value = {empreendedor.codigoDistribuicao}
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
                value = {empreendedor.nomeDistribuicao}
                placeholder='Nome da Distribuição'
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
              <Checkbox
                label='Pode cadastrar recrutas?'
                placeholder='Sim'
                value = {empreendedor.podeCadastrarRecrutas}
              />
              Pode cadastrar recrutas?
            </Grid>

            <Grid item xs={12}>
              <Button variant='warning'  size='large'>
                Cancelar
              </Button>
              <Button type='submit' variant='contained' size='large'>
                Cadastrar
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormCadastroDeEmpreendedor
