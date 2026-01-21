import { Navigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useStorage";

const PrivateRouter = ({ test, children }: any) => {
  const user = localStorage.getItem("access_token");

  if (user) {
    return <>{children}</>;
  }
  return <Navigate to={"/login"} />;
};

export default PrivateRouter;
