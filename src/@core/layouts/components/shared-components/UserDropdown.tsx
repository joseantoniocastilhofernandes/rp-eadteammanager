// ** React Imports
import { useState, SyntheticEvent, Fragment, ChangeEvent, Component, MouseEvent, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icons Imports
import CogOutline from 'mdi-material-ui/CogOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import KeyIcon from '@mui/icons-material/Key'
import GroupsIcon from '@mui/icons-material/Groups'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import {SERVICES_CONTEXT} from 'src/@core/constants/constants.js'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

class UserDropdown extends Component{
  constructor(props: any){
   super(props);
   console.log('UserDropdown.props' + JSON.stringify(props));
  // ** States
   this.state = {
            anchorEL: props.anchor,
            usuarioLogado: null,
            nomeUsuario: 'Não logado'
        };
 
  }
  componentDidMount(){
        var user = sessionStorage.getItem('loggedUser');
        if(user != null){
          user = JSON.parse(user);
        }
        console.log('componentDidMount sessionStorageloggedUser:' + sessionStorage.getItem('loggedUser'));
        this.setState({ ...this.state,  'nomeUsuario': user.nomeCompleto, 'usuarioLogado': user }) ;
  }
  render(){

 


  const handleDropdownOpen = (event: SyntheticEvent) => {
    console.log('handleDropdownOpen' + sessionStorage.getItem('loggedUser'));

    var user = JSON.parse(sessionStorage.getItem('loggedUser'));
    this.setState({ ...this.state,  'anchorEL': event.currentTarget, 'nomeUsuario': user.nomeCompleto, 'usuarioLogado': user }) ;
  
  }
  const alterarSenha= () =>{
    window.location.href = '/alterar-senha';    
  }
   const verEquipe= () =>{
    window.location.href = '/empreendedores';    
  }
  const logout = () =>{
      sessionStorage.removeItem('loggedUser');
      window.location.href = "/";
  }
  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
     this.setState({ ...this.state,  'anchorEL': null }) ;
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }
  
  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt='John Doe'
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
      </Badge>
      <Menu
        anchorEl={this.state.anchorEL}
        open={Boolean(this.state.anchorEL)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar alt={this.state.nomeUsuario} src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} >
              </Avatar>
            </Badge>
            <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 600 }}>{this.state.nomeUsuario} </Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                Admin
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />

        <MenuItem sx={{ p: 0 }} onClick={() => verEquipe()}>
          <Box sx={styles}>
            <GroupsIcon sx={{ marginRight: 2 }} />
            Minha equipe
          </Box>
        </MenuItem>     
        <MenuItem sx={{ p: 0 }} onClick={() => alterarSenha()}>
          <Box sx={styles}>
            <KeyIcon sx={{ marginRight: 2 }} />
            Alterar Senha
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }} onClick={() => logout()}>
          <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          Sair
        </MenuItem>
      </Menu>
    </Fragment>
  )
}
} //fim render
export default UserDropdown
