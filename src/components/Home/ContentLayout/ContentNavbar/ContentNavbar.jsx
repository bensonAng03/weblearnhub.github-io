import { useState } from 'react'
import classes from "./ContentNavbar.module.css"
const ContentNavbar = ({getTypeFn,type}) => {
  const [navBarItem,setNavBarItem]=useState(type)
  const handleNavItemClick = (item) => {
    setNavBarItem(item);
    getTypeFn(item);
  };
  return (
    <ul className={classes.NavBar}>
      <li className={navBarItem=="teach"?classes.Active:""} onClick={()=>handleNavItemClick("teach")}>Teach on WebLearnHub</li>
      <li className={navBarItem=="about"?classes.Active:""} onClick={()=>handleNavItemClick("about")}>About us</li>
      <li className={navBarItem=="FAQ"?classes.Active:""} onClick={()=>handleNavItemClick("FAQ")}>FAQ</li>
      <li className={navBarItem=="term"?classes.Active:""} onClick={()=>handleNavItemClick("term")}>Term of Use</li>
      <li className={navBarItem=="privacyPolicy"?classes.Active:""} onClick={()=>handleNavItemClick("privacyPolicy")}>Privacy Policy</li>
      <li className={navBarItem==""?classes.Active:""} onClick={()=>handleNavItemClick("")}>Home</li>
    </ul>
  )
}

export default ContentNavbar;