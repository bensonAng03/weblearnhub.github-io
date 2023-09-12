// import classes from "./ScreenVideo.module.css";
import { forwardRef } from "react";
const ScreenVideo = forwardRef(function ScreenVideo({toggleShareScreen,isShareScreen},ref){
  return (
      <div>
        <h2>直播教课界面</h2>
        <button onClick={toggleShareScreen}>
          {isShareScreen ? "关闭共享屏幕" : "共享屏幕"}
        </button>
        <video ref={ref}></video>
      </div>
  );
});

export default ScreenVideo;
