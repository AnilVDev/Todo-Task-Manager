import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'

const API_URL = "http://127.0.0.1:8000/"

const user = JSON.parse(localStorage.getItem('tokens'))

const initialState = {
    user : user?user:null,
    loading: false,
    error : null,
    success:false,
    message : null
}

export const signup = createAsyncThunk('authentication/signup', 
    async (data, thunkAPI) => {
        try {
            const response = await axios.post(API_URL + 'api/signup/', data);
            return response.data;
        } catch (error) {
            if (error.response) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
            return thunkAPI.rejectWithValue({ message: 'Something went wrong, please try again later.' });
        }
    }
)

export const login = createAsyncThunk('authentication/login',
    async (data, thunkAPI) => {
        try {
            const response = await axios.post(API_URL + 'api/login/', data);
            if(response.data){
                localStorage.setItem('tokens', JSON.stringify(response.data))
            }
            return response.data       
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const logout = createAsyncThunk('authentication/logout', async () =>{
    localStorage.removeItem('tokens')
  })


const authSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers : {
        clearError(state) {
            state.error = null;
            state.success = false;
          },
          clearMessage(state) {
            state.message = null;
            state.success = false;
          }
    },
    extraReducers: (builder) => {
        builder
        .addCase(signup.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.message = null; 
        })
        .addCase(signup.fulfilled, (state, action) => {
          state.loading = false;
          state.success = true;
          state.message = action.payload.message;
        })
        .addCase(signup.rejected, (state, action) => {
          state.loading = false;
          if (action.payload?.username) {
            state.error = action.payload.username[0];
        } else {
            state.error = action.payload?.message || 'Something went wrong';
        }
        })
        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null; 
          })
          .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.user = action.payload;
          })
          .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload?.error;
          }) 
          .addCase(logout.fulfilled, (state) => {
            state.user = null;
            Object.assign(state, initialState);
        });         
    }

})

export const {clearError, clearMessage} = authSlice.actions
export default authSlice.reducer