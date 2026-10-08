import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";

const Protected = ({children}) => {
  const {loading, user} = useAuth();

  if(loading){
    return <LoadingScreen />
  }

  if(!user){
    return <Navigate to={"/login"} replace/>
  }

  return children
}

export default Protected