import {useSelector} from "react-redux";
import {Navigate} from "react-router-dom";
import { useLocation } from 'react-router-dom';
const NeedAuth = (props) => {
    const auth=useSelector(state=>state.auth)
    const location=useLocation();
    return auth.isLogged?props.children : <Navigate to={"/auth-form"} replace state={{preLocation:location}}/>
};

export default NeedAuth;