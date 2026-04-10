import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/" />;
}

export default ProtectedRoute;