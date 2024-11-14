import {BrowserRouter, Routes, Route} from "react-router-dom"
import SignIn from "./component/Signin";
import SignUp from "./component/Signup";
import DrawerAppBar from "./component/Home";
import { store } from "./Store/store";
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProjectList from "./component/ProjectsList";
import TodoList from "./component/TodoList";
import ProtectedRoute from "./component/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element = {<SignIn/>} />
          <Route path="/signup" element = {<SignUp/>} />

          <Route element= {<ProtectedRoute />} >
            <Route path='/home' element = {<DrawerAppBar/>} />
            <Route path="/projects" element = {<ProjectList/>} />
            <Route path="/:projectname" element = {<TodoList/>} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-center"
          toastStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '8px', 
          }}
      />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
