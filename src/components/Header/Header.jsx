import { NavLink, useLocation, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";
import { useEffect, useState } from "react";
import { userApi } from "../../store/api/userApi";
let userId = JSON.parse(localStorage.getItem("user"))?.id;
// const userJSON = localStorage.getItem("user");
// let avatarUrl = userJSON
//   ? JSON.parse(userJSON)?.avatar?.url || "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg"
//   : "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg";
const Header = () => {
  const [isShowHeader, setIsShowHeader] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(()=>{
    userApi.getUserById(userId)
    .then((response)=>{
      const {isSuccess,data}=response
      if(isSuccess){
        setAvatarUrl(data.avatar.url)
      }
    })
    .catch((error)=>{
      console.log(error)
    })
  },[])
  useEffect(() => {
    if (location.pathname.startsWith("/live/")) {
      setIsShowHeader(false);
    } else {
      if (!isShowHeader) {
        setIsShowHeader(true);
      }
    }
  }, [location]);
  const logoutFn = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("token");
    window.location.reload();
  };
  return (
    <>
      {isShowHeader && (
        <header className={classes.Header}>
          <div className={classes.ImageContainer}>
            <img src="/logo.png" alt="logo image" />
          </div>
          <nav className={classes.Navbar}>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? classes.Active : "")}
            >
              Home
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? classes.Active : "")}
            >
              Course
            </NavLink>
            <NavLink
              to="/notes"
              className={({ isActive }) => (isActive ? classes.Active : "")}
            >
              Note
            </NavLink>
            <NavLink
              to="/quizzes"
              className={({ isActive }) => (isActive ? classes.Active : "")}
            >
              Quiz
            </NavLink>
            <NavLink
              to="/me"
              className={({ isActive }) => (isActive ? classes.Active : "")}
            >
              Me
            </NavLink>
          </nav>
          <div className={classes.RightContainer}>
          <div className={classes.BtnContainer}>
            {!userId ? (
              <button onClick={() => navigate("/auth-form")}>
                Log in / Sign up
              </button>
            ) : (
              <button onClick={logoutFn}>Log out</button>
            )}
          </div>
          <div className={classes.AvatarContainer}>
            <img
              src={avatarUrl}
              alt="teacher image"
            />
          </div>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
