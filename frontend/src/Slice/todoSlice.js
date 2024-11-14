import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/"

const initialState = {
  todos: [],
  loading: false,
  error: null,
  success: false,
  message: null,
};


export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async ({ data, project_id }, thunkAPI) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      const accessToken = tokens?.access_token;

      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(`${API_URL}/api/projects/${project_id}/todos/`, data, config);
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
      return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
    }
  }
);


export const getAllTodos = createAsyncThunk(
    'todos/getAllTodos',
    async (project_id, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await axios.get(`${API_URL}/api/projects/${project_id}/todos/`, config);
        return response.data;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );
 
  export const updateTodo = createAsyncThunk(
    'todos/updataTodo',
    async ({data, project_id, todoId }, thunkAPI) => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        
        const response = await axios.patch(`${API_URL}/api/projects/${project_id}/todos/${todoId}/`, data, config);
        
        return response.data;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );

  export const deleteTodo = createAsyncThunk(
    'todos/deleteTodo',
    async ({project_id, todoId }, thunkAPI) => {
      try {
        console.log({project_id, todoId})
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const accessToken = tokens?.access_token;
  
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        
        await axios.delete(`${API_URL}/api/projects/${project_id}/todos/${todoId}/`, config);
        
        return todoId;
      } catch (error) {
        if (error.response) {
          return thunkAPI.rejectWithValue(error.response.data);
        }
        return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
      }
    }
  );
    

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    resetTodoState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Task created successfully';
        state.todos.push(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        if (action.payload?.description) {
            state.error = action.payload.title.join(', ');
          } else {
            state.error = action.payload?.message || 'Failed to create todo';
          }})
      .addCase(getAllTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.todos = action.payload; 
      })
      .addCase(getAllTodos.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.message || 'Failed to fetch todos';
      })
      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Task updated successfully';
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        } else {
          state.todos.push(action.payload);
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        if (action.payload?.description) {
            state.error = action.payload.title.join(', ');
          } else {
            state.error = action.payload?.message || 'Failed to update todo';
          }})
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.todos = state.todos.filter((todo) => todo.id !== action.payload);
        state.message = 'Task deleted successfully.';
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.success = false;
        state.error = action.payload;
      })

  },
});

export const { resetTodoState } = todosSlice.actions;
export default todosSlice.reducer;
