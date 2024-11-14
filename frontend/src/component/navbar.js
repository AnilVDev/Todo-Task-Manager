// components/Navbar.js
import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../Slice/authentication';

const Navbar = ({ mobileOpen, handleDrawerToggle, navItems, setOpen, window }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleOpen = (item) => {
    if (item === 'Create') {
      setOpen(true);
    }
    if (item === 'Logout') {
      dispatch(logout());
      navigate('/')
    }
    if (item === 'Projects'){
      navigate('/projects')
    }
  };
  return (
    
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            to="/home"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, textDecoration: 'none', color: 'inherit' }}
          >
            Task Manager
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }} onClick={() => handleOpen(item)}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={window !== undefined ? () => window().document.body : undefined}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" 
            component={Link}
            to="/home"
            sx={{ my: 2, textDecoration: 'none', color: 'inherit' }}>
                Task Manager
            </Typography>
            <Divider />
            <List>
              {navItems.map((item) => (
                <ListItem key={item} disablePadding>
                  <ListItemButton sx={{ textAlign: 'center' }}>
                    <ListItemText primary={item} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </nav>
    </Box>
  );
};

Navbar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  navItems: PropTypes.array.isRequired,
  setOpen: PropTypes.func.isRequired,      
  window: PropTypes.func,
};

export default Navbar;

