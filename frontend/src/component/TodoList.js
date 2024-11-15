import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Accordion, AccordionDetails, AccordionSummary, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, InputLabel, MenuItem, Select, Stack, TextareaAutosize, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { createProject, deleteProject, resetState, updateProject} from '../Slice/projects';
import { toast } from 'react-toastify';
import { Cancel, Delete, Edit, ExpandMoreOutlined, ImportExport, Save } from '@mui/icons-material';
import { format } from 'date-fns';
import Navbar from './navbar';
import { createTodo, deleteTodo, getAllTodos, resetTodoState, updateTodo } from '../Slice/todoSlice';
import { exportProject } from '../Export/export';


const navItems = ['Create', 'Projects', 'Logout'];

function TodoList(props) {

  const location = useLocation();
  const projectId = location.state?.projectId; 
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, setTitle] = useState('')
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogProject, setOpenDialogProject] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState(false);

  const [projectTitle, setProjectTitle] = useState(location.state?.projectTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(projectTitle);

  const logoutSuccess = useSelector((state) => !state.authentication.user);
  const {todos, loading, error, message, success} = useSelector(state => state.todos)
  const {success: projectsSuccess, error: projectsError, loading: projectsLoading, message: projectMessage } = useSelector(state => state.projects)

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
        dispatch(resetTodoState())
        handleClose()
    }
    if (projectsError) {
      toast.error(projectsError);
      dispatch(resetState())
    }
    if (projectsSuccess) {
        toast.success(projectMessage)
        dispatch(resetState())
    }

  }, [error, success, projectsError, projectsSuccess]);  

  useEffect(() => {
    dispatch(getAllTodos(projectId))
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
    setOpen(false);
    setTitle('')
  }



  const handleDeleteClick = () => {
    setOpenDialogProject(true);
  };
  const handleProjectDeleteCancel = () => {
    setOpenDialogProject(false);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteTodo({project_id: projectId,todoId:selectedTodoId})); 
    setOpenDialog(false);
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
  };

 

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value === 'true');
  };

  const handleAddTask = (e) => {
    e.preventDefault()
    if (description) {
        const data = {
            description,
            status
        }
        dispatch(createTodo({ data, projectId }))
    } else {
        toast.error('must have description')
    }
    setDescription('');
    setStatus(false); 
  };
 
  const handleEditClick = (todo) => {
    setEditId(todo.id);
    setEditDescription(todo.description);
    setEditStatus(todo.status);
  };
  
  const handleSaveClick = (id) => {
    const updatedTodo = {
      description: editDescription,
      status: editStatus,
    };
    dispatch(updateTodo({
        data: updatedTodo,
        project_id: projectId, 
        todoId: id
   }));
    setEditId(null);
  };
  
  const handleDeleteTodo = (todo_id) => {
    setSelectedTodoId(todo_id);
    setOpenDialog(true);
    
  };

  const handleEditProject = () => {
    setIsEditing(true);
  };

  const handleSaveTitle = (e) => {
    e.preventDefault()
    setProjectTitle(editedTitle);
    setIsEditing(false);
    const data = {
        title:editedTitle
    }
    dispatch(updateProject({data,projectId}))
  };

  const handleDeleteProject = () => {

    dispatch(deleteProject(projectId));
    setOpenDialogProject(false)
    navigate('/projects')
  };

  const handleCancelEdit = () => {
    setEditedTitle(projectTitle); 
    setIsEditing(false);
  };

  const handleExportProject = () => {
    exportProject(projectTitle, todos);
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
          alignItems: 'right',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Centering content vertically and horizontally */}
 
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

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 900,
            width: '100%',
            margin: '0 auto',
            padding: '16px',
            backgroundColor: 'rgba(18, 28, 157, 0.26)',
            borderRadius: '8px' 
          }}
        >
            {isEditing ? (
                <TextField
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                autoFocus
                variant="standard"
                sx={{ fontSize: '2.5rem', fontWeight: 'bold' }}
                />
            ) : (
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                {projectTitle.charAt(0).toUpperCase() + projectTitle.slice(1)} 
                </Typography>
            )}

            <div style={{ display: 'flex', alignItems: 'center' }}>
                {isEditing ? (
                <>
                    {/* Save button */}
                    <IconButton onClick={handleSaveTitle} sx={{ marginLeft: 2 }}>
                    <Save />
                    </IconButton>
                    {/* Cancel button */}
                    <IconButton onClick={handleCancelEdit} sx={{ marginLeft: 2 }}>
                    <Cancel />
                    </IconButton>
                </>
                ) : (
                <>
                    {/* Edit button */}
                    <IconButton onClick={handleEditProject} sx={{ marginLeft: 2 }}>
                    <Edit />
                    </IconButton>
                    {/* Delete button */}
                    <IconButton onClick={handleDeleteClick} sx={{ marginLeft: 2 }}>
                    <Delete />
                    </IconButton>
                </>
                )}

                {/* Export button */}
                <Button onClick={handleExportProject} sx={{ marginLeft: 2 }} variant="contained" color="primary">
                <ImportExport />
                Export
                </Button>
            </div>
        </Box>
        <Box display="flex" justifyContent="center" mt={4} mb={5}>
            <Accordion sx={{ width: 600 }}>
                <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                aria-controls="panel2-content"
                id="panel2-header"
                >
                <Typography>Add new task</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl sx={{ flex: 2 }} variant="standard">
                    <TextareaAutosize
                        minRows={3} 
                        style={{
                        border: '1px solid #e0e0e0',
                        fontFamily: 'sans-serif',
                        outline: 'none',       
                        padding: '8px',        
                        resize: 'none',        
                        minHeight: '10px'     
                        }}
                        placeholder="Description"
                        value={description}
                        onChange={handleDescriptionChange}
                    />
                    </FormControl>

                    <FormControl sx={{ flex: 1, minWidth: 120 }} variant="standard">
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                        labelId="status-select-label"
                        id="status-select"
                        value={String(status)}
                        onChange={handleStatusChange}
                    >
                        <MenuItem value="false">Pending</MenuItem>
                        <MenuItem value="true">Completed</MenuItem>
                    </Select>
                    </FormControl>

                    <Button variant="contained" color="primary" onClick={handleAddTask}>
                    Add Task
                    </Button>
                </Stack>
                </AccordionDetails>
            </Accordion>
            </Box>
            <List sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper', margin: 'auto' }}>
                {todos && todos.length > 0 ? (
                    todos.map((todo) => (
                    <Fab variant="extended" key={todo.id} sx={{ width: '100%', mb: 2, borderRadius: 1, height: '58px' }}>
                        <ListItem sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        
                        {/* Editable Description & Status */}
                        {editId === todo.id ? (
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <TextField
                                label="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                fullWidth
                                variant="standard"
                            />
                            <FormControl variant="standard" sx={{ minWidth: 100 }}>
                                <Select
                                labelId="status-select-label"
                                id="status-select"
                                value={String(editStatus)}
                                onChange={(e) => setEditStatus(e.target.value === 'true')}
                                >
                                <MenuItem value="false">Pending</MenuItem>
                                <MenuItem value="true">Completed</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Save Button */}
                            <IconButton
                                color="primary"
                                onClick={() => handleSaveClick(todo.id)}
                                sx={{ marginLeft: 2 }}
                            >
                                <Save />
                            </IconButton>

                            {/* Cancel Button */}
                            <IconButton
                                color="secondary"
                                onClick={() => setEditId(null)}
                            >
                                <Cancel />
                            </IconButton>
                            </Stack>
                        ) : (
                            <>
                            <ListItemText
                                primary={todo.description}
                                secondary={`Created: ${format(new Date(todo.created_at), 'dd MMM, yyyy')}  Updated: ${format(new Date(todo.updated_at), 'dd MMM, yyyy')}`}
                                sx={{
                                mr: 2,
                                '& .MuiTypography-body2': { fontSize: '0.575rem' },
                                }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 2 }}>
                                Status: 
                                <span style={{ color: todo.status ? 'green' : 'orange' }}>
                                {todo.status ? 'Completed' : 'Pending'}
                                </span>
                            </Typography>

                            {/* Edit Button */}
                            <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => handleEditClick(todo)}
                                sx={{ mr: 1 }}
                            >
                                <Edit />
                            </IconButton>

                            {/* Delete Button */}
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteTodo(todo.id)}
                            >
                                <Delete />
                            </IconButton>
                            </>
                        )}
                        </ListItem>
                    </Fab>
                    ))
                ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', width: '100%' }}>
                    No tasks available
                    </Typography>
                )}
                </List>


        <Dialog open={openDialogProject} onClose={handleProjectDeleteCancel}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
            Are you sure you want to delete this project? This action cannot be undone.
            </DialogContent>
            <DialogActions>
            <Button onClick={handleProjectDeleteCancel} color="primary">
                Cancel
            </Button>
            <Button onClick={handleDeleteProject} color="secondary">
                Confirm
            </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={openDialog} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
            Are you sure you want to delete this task? This action cannot be undone.
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

TodoList.propTypes = {
  window: PropTypes.func,
};

export default TodoList;
