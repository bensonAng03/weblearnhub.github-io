import { useState } from "react";
import Info from "./Info/Info";
import ProfileNavbar from "./ProfileNavbar/ProfileNavbar";
import classes from "./Profile.module.css"
import Feedback from "./Feedback/Feedback";
const Profile=()=> {
  const [navItem,setNavItem]=useState("info")
  const getNavItem=(navItem)=>{
    setNavItem(navItem)
  }
  return (
    <div className={classes.Profile}>
      <ProfileNavbar getNavItem={getNavItem}/>
      <div className={classes.ItemContainer}>
      {navItem=="info" && <Info/>}
      {(navItem=="response" ||navItem=="report")  && <Feedback navItem={navItem}/>}
      </div>
    </div>
  );
}

export default Profile;
