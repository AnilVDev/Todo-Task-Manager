import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = ({ redirectTo = '/'}) => {
    const isAuthenticated = useSelector(state => state.authentication.user)
    return isAuthenticated ? <Outlet /> : <Navigate to = {redirectTo} />;
}

export default ProtectedRoute