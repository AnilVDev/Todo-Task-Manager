import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { createProject, deleteProject, getAllProject, resetState } from '../Slice/projects';
import { toast } from 'react-toastify';
import { Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import Navbar from './navbar';


const navItems = ['Create', 'Projects', 'Logout'];

function ProjectList(props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, setTitle] = useState('')
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutSuccess = useSelector((state) => !state.authentication.user);
  const {projects, loading, error, message, success} = useSelector(state => state.projects)

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
        toast.success(message)
        dispatch(resetState())
        handleClose()
    }
  }, [error, success]);  

  useEffect(() => {
    dispatch(getAllProject())
  },[])

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('')
  };  

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title
    }
    dispatch(createProject(data))
  }

  const handleDeleteClick = (projectId) => {
    setSelectedProjectId(projectId);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteProject(selectedProjectId))
    .unwrap()
    .then(() => {
        dispatch(getAllProject());
        setOpenDialog(false);
    })
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
  };

  const handleNavigateToProject = (project) => {
    navigate(`/${project.title}`, { state: { projectId: project.id, projectTitle: project.title } });
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
          mt: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          width: '100%',
        }}
      >
 
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
            {"Project Title"}
            </DialogTitle>
            <DialogContent>
                <TextField 
                fullWidth 
                label="project name" 
                id="fullWidth" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
            <Button autoFocus onClick={handleClose}>
                cancel
            </Button>
            <Button onClick={handleSubmit} autoFocus>
                create
            </Button>
            </DialogActions>
        </Dialog>
        <Typography 
            sx={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                textAlign: 'center' 
            }}
            >
            Your Projects
        </Typography>
        <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
          {projects && projects.length > 0 ? (
            projects.flat().map((project) => (
              <Fab variant="extended" sx={{ width: '100%', mb: 2, borderRadius: 1, height: '56px' }} onClick={() => handleNavigateToProject(project)}>
                <ListItem
                  key={project.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                >
                  <ListItemText
                    primary={project.title}
                    secondary={`ID: ${project.custom_id}, Created: ${format(new Date(project.created_at), 'dd MMM, yyyy')}`}
                    sx={{ 
                      mr: 2, 
                      '& .MuiTypography-body2': { fontSize: '0.575rem' } 
                    }}
                  />
                  
                  <IconButton edge="end" aria-label="delete"   onClick={(e) => {
                    e.stopPropagation(); 
                    handleDeleteClick(project.id);
                  }}>
                    <Delete />
                  </IconButton>
                </ListItem>
              </Fab>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No projects found"
                secondary="Create a project to get started."
                sx={{ textAlign: 'center', width: '100%' }}
              />
            </ListItem>
          )}
        </List>

        <Dialog open={openDialog} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
            Are you sure you want to delete this Project? This action cannot be undone.
            </DialogContent>
            <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
                Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="secondary">
                Confirm
            </Button>
            </DialogActions>
        </Dialog>

      </Box>
    </Box>

  );
}

ProjectList.propTypes = {
  window: PropTypes.func,
};

export default ProjectList;
