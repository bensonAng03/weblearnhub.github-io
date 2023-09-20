import React, { useState } from 'react'
import classes from "./AuditorNavbar.module.css"
const AuditorNavbar = ({getTypeFn}) => {
  const [navBarItem,setNavBarItem]=useState("approveCourse")
  const handleNavItemClick = (item) => {
    setNavBarItem(item);
    getTypeFn(item);
  };
  const logoutFn = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("token");
    window.location.reload();
  };
  return (
    <ul className={classes.NavBar}>
      <li className={navBarItem=="approveCourse"?classes.Active:""} onClick={()=>handleNavItemClick("approveCourse")}>Approved Course</li>
      <li className={navBarItem=="changeCoursePrice"?classes.Active:""} onClick={()=>handleNavItemClick("changeCoursePrice")}>Change Course Price</li>
      <li className={navBarItem=="deleteCourse"?classes.Active:""} onClick={()=>handleNavItemClick("deleteCourse")}>Delete Course</li>
      <li className={navBarItem=="reportCourse"?classes.Active:""} onClick={()=>handleNavItemClick("reportCourse")}>Report Course</li>
      <li className={navBarItem=="approveQuiz"?classes.Active:""} onClick={()=>handleNavItemClick("approveQuiz")}>Approved Quiz</li>
      <li className={navBarItem=="deleteQuiz"?classes.Active:""} onClick={()=>handleNavItemClick("deleteQuiz")}>Delete Quiz</li>
      <li className={navBarItem=="reportNote"?classes.Active:""} onClick={()=>handleNavItemClick("reportNote")}>Report Note</li>
      <li onClick={logoutFn}>Logout</li>
    </ul>
  )
}

export default AuditorNavbar;