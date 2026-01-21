// components/GuestRoute.tsx
import { Navigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useStorage";

interface GuestRouteProps {
  children: JSX.Element;
 
}

const GuestRoute = ({ children }: GuestRouteProps) => {
    let user = localStorage.getItem("access_token")
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;