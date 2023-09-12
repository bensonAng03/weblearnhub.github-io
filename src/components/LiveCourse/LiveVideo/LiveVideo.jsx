import { forwardRef, useState } from "react";
import classes from "./LiveVideo.module.css";
const LiveVideo = forwardRef(function LiveVideo({toggleStream,myVideoRef} ,ref){
  const[isShareAudio,setIsShareAudio]=useState(false);
  const [isOpenCamera,setIsOpenCamera]=useState(false)
  const shareAudio=()=>{
    setIsShareAudio(!isShareAudio)
    toggleStream(isOpenCamera,!isShareAudio)
  }
  const shareStream=()=>{
    setIsOpenCamera(!isOpenCamera)
    toggleStream(!isOpenCamera,isShareAudio)
  }
   return (
      <div>
        <button onClick={shareStream}>
          {isOpenCamera ? "关闭摄像头" : "打开摄像头"}
        </button>
        <button onClick={shareAudio}>share audio</button>
        <video ref={myVideoRef}></video>
        <div ref={ref} className={classes.VideoContainer}></div>
      </div>
    );
});

export default LiveVideo;
