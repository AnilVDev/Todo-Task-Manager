import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'

const API_URL = "http://127.0.0.1:8000/"

const initialState = {
    projects: [],
    loading: false,
    error: null,
    success: false,
    message: null,
  };
  
  export const createProject = createAsyncThunk(
    'projects/createProject',
    async (data, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await axios.post(`${API_URL}/api/projects/`, data, config);
        return response.data;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );

  export const getAllProject = createAsyncThunk(
    'projects/getAllProject',
    async (data, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await axios.get(`${API_URL}/api/projects/`, config);
        return response.data;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );

  export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({data, projectId}, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await axios.patch(`${API_URL}/api/projects/${projectId}/`, data, config);
        return response.data;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );

  export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async (projectId, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
  
        const response = await axios.delete(`${API_URL}/api/projects/${projectId}/`, config);
        return  { id: response.data.id };
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );
  

  const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
      resetState: (state) => {
        state.loading = false;
        state.error = null;
        state.success = false;
        state.message = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(createProject.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        })
        .addCase(createProject.fulfilled, (state, action) => {
          state.loading = false;
          state.success = true;
          state.message = 'Project created successfully';
          state.projects.push(action.payload);
        })
        .addCase(createProject.rejected, (state, action) => {
          state.loading = false;
          state.success = false;
          if (action.payload?.title) {
            state.error = action.payload.title.join(', ');
          } else {
            state.error = action.payload?.message || 'Failed to create project';
         }})
        .addCase(getAllProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
          })
          .addCase(getAllProject.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            const allProjects = action.payload.flat();

            allProjects.forEach((newProject) => {
              const exists = state.projects.some((project) => project.id === newProject.id);
              if (!exists) {
                state.projects.push(newProject);
              }})
          })
          .addCase(getAllProject.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload?.message || 'Failed to load project';
          })
          .addCase(updateProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
          })
          .addCase(updateProject.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = 'Project Tilte updated successfully';
            const index = state.projects.findIndex(project => project.id === action.payload.id);
            if (index !== -1) {
                state.projects[index] = action.payload;  
            } else {
                state.projects.push(action.payload); 
            }
          })
          .addCase(updateProject.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            if (action.payload?.description) {
                state.error = action.payload.title.join(', ');
              } else {
                state.error = action.payload?.message || 'Failed to update todo';
              }})
          .addCase(deleteProject.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
          })
          .addCase(deleteProject.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            const updatedProjects = state.projects.filter((project) => project.id !== action.payload.id);
            state.projects = updatedProjects;
            state.message = 'Project deleted successfully.';
          })
          .addCase(deleteProject.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            if (action.payload?.detail) {
              state.error = action.payload.detail;
            } else {
              state.error = action.payload?.message || 'Failed to delete project';
            }
          });
    },
  });
  
  export const { resetState } = projectSlice.actions;
  
  export default projectSlice.reducer;
  