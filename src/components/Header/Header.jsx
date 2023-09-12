import { NavLink, useLocation, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";
import { useEffect, useState } from "react";
let userId = JSON.parse(localStorage.getItem("user"))?.id;
<<<<<<< HEAD
let avatarUrl = localStorage.getItem("user")?.avatar?.url ? JSON.parse(localStorage.getItem("user"))?.avatar?.url : "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg";
=======
let avatarUrl = JSON.parse(localStorage.getItem("user"))?.avatar.url || "/uploads/unkown_Avatar_3920a9b7df.jpg";
>>>>>>> 67366d9d78d0fae611d04a306e0f6aecd8774adc
const Header = () => {
  const [isShowHeader, setIsShowHeader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
<<<<<<< HEAD
            <img src="/logo.png" alt="logo image" />
=======
            <img src="src/assets/logo.png" alt="logo image" />
>>>>>>> 67366d9d78d0fae611d04a306e0f6aecd8774adc
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
<<<<<<< HEAD
              src={avatarUrl}
=======
              src={`http://localhost:1337${avatarUrl}`}
>>>>>>> 67366d9d78d0fae611d04a306e0f6aecd8774adc
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
