import React, { useState, useEffect } from 'react';
import { Box, Fab, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProject, getAllProject, resetState } from '../Slice/projects';
import Navbar from './navbar';


const drawerWidth = 240;
const navItems = ['Create', 'Projects', 'Logout'];

function DrawerAppBar(props) {
  const [open, setOpen] = useState(false);
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, setTitle] = useState('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutSuccess = useSelector((state) => !state.authentication.user);
  const { loading, error, message, success } = useSelector((state) => state.projects);

  useEffect(() => {
    if (logoutSuccess) {
      navigate('/');
    }
  }, [logoutSuccess, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(message);
      handleClose();
      dispatch(resetState())
    }
  }, [error, success]);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
    };
    dispatch(createProject(data));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        navItems={navItems}
        setOpen={setOpen}      
        window={window}
      />
      <Box
        component="main"
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Fab variant="extended" sx={{ mb: 2 }} onClick={handleClickOpen}>
          Create new project
        </Fab>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            {'Project Title'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Project name"
              id="fullWidth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} autoFocus>
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <Fab variant="extended" onClick={() => dispatch(getAllProject(), navigate('/projects'))}>
          View all projects
        </Fab>
      </Box>
    </Box>
  );
}

export default DrawerAppBar;
