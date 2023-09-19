import { useState } from 'react'
import classes from "./Review.module.css"
import AuditorNavbar from '../AuditorNavbar/AuditorNavbar'
import ApplyItemManage from '../ApplyItemManage/ApplyItemManage'
const Review = () => {
  const [type,setType]=useState("approveCourse")
  const getTypeFn=(typeTemp)=>{
    setType(typeTemp);
  }
  return (
    <div className={classes.Review}>
        <AuditorNavbar getTypeFn={getTypeFn}/>
        <ApplyItemManage type={type}/>
    </div>
  )
}

export default Review;