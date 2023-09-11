import { useEffect, useState } from "react";
import { userApi } from "../../store/api/userApi";
const NeedAuditor = (props) => {
    const [isAdmin,setIsAdmin]=useState(false)
    const clearLocalStorageFn=()=>{
      localStorage.clear()
      window.location.reload()
    }
    useEffect(()=>{
        userApi
          .getUserById(JSON.parse(localStorage.getItem("user"))?.id)
          .then((response) => {
            const { data, isSuccess } = response;
            if (isSuccess) {
                if(data.role.type==="auditor"){
                    setIsAdmin(true)
                }
            } else {
              console.error("Error:", response.error);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
          
    },[])
    // const location=useLocation();
    return isAdmin?props.children : <div>You are not an auditor<button onClick={clearLocalStorageFn}>reset</button></div>
};

export default NeedAuditor;