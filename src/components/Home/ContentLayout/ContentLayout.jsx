import React, { useState } from 'react'
import ContentNavbar from './ContentNavbar/ContentNavbar'
import Content from './Content/Content'
import classes from "./ContentLayout.module.css"
const ContentLayout = ({type,getContentTypeFn}) => {
  const [contentType,setContentType]=useState(type)
  const getTypeFn=(typeTemp)=>{
    if(typeTemp==""){
      getContentTypeFn("")
    }
    setContentType(typeTemp);
  }
  return (
    <div className={classes.ContentLayout}>
        <ContentNavbar getTypeFn={getTypeFn} type={contentType}/>
        <Content type={contentType}/>
    </div>
  )
}

export default ContentLayout