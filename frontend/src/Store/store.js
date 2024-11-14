import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../Slice/authentication'
import projectReducer from '../Slice/projects'
import todoReducer from '../Slice/todoSlice'


export const store = configureStore({
    reducer : {
       authentication : authReducer,
       projects : projectReducer,
       todos : todoReducer
    }
})