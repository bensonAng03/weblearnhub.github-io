import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "peerjs";
import classes from "./LiveVideo.module.css";
const LiveVideo = () => {
  const { room } = useParams();
  const videoContainerRef = useRef(null);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [userIdList, setUserIdList] = useState([]);
  const [userIdData, setUserIdData] = useState("");
  const socket = io("http://localhost:8080");
  const myPeer = new Peer(undefined, {
    host: "/",
    port: "8081",
  });
  window.onbeforeunload = () => {
    // 发送请求通知服务器用户已断开连接
    socket.emit("disconnect");
  };
  useEffect(() => {
    if (userIdData.length !== 0) {
      // 使用现有的 userId 进行连接
      myPeer.on("open", () => {
        console.log("join room");
        socket.emit("join-room", room, userIdData);
      });
    } else {
      // 生成新的 userId，并存储在 localStorage 中
      myPeer.on("open", (id) => {
        setUserIdData(id);
        socket.emit("join-room", room, id);
      });
    }
    socket.on("user-connected", (userId) => {
      console.log("User connected: " + userId);
      setUserIdList((prevList) => [...prevList, userId]);
    });
    socket.on("user-disconnected", (userId) => {
      console.log(userId);
      const videoToRemove = document.getElementById(userId);
      console.log(videoToRemove);
      videoToRemove.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoToRemove) {
        videoContainerRef.current.removeChild(videoToRemove);
      }
    });
    socket.on("existing-users", (userIdArr) => {
      console.log("existing-users" + userIdArr);
      setUserIdList(userIdArr);
    });
  }, []);
  useEffect(() => {
    // if(isOpenCamera){
    console.log("1");
    socket.on("camera-toggled", (userId, isOpen) => {
      console.log("opened the camera");
      if (isOpen) {
        // 开始发布视频流
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            addVideoStream(stream, userId);
            connectToNewUser(userId, stream);
          })
          .catch((error) => {
            console.error("Error accessing camera:", error);
          });
      } else {
        // 停止发布视频流
        const videoToRemove = document.getElementById(userId);
        console.log(videoToRemove);
        videoToRemove.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoToRemove);
        }
      }
    });
    // }
    return () => {
      socket.off("camera-toggle");
    };
  }, [isOpenCamera]);

  const toggleCamera = () => {
    console.log(room, userIdData, !isOpenCamera);
    socket.emit("camera-toggle", room, userIdData, !isOpenCamera);
    setIsOpenCamera(!isOpenCamera);
  };

  const addVideoStream = (stream, userId) => {
    console.log("add the video");
    const video = document.createElement("video");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    video.setAttribute("id", userId);
    videoContainerRef.current.appendChild(video);
  };

  const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(userVideoStream, video);
    });
    call.on("close", () => {
      video.remove();
    });
  };

  return (
    <div>
      <div>
        <h2>直播教课界面</h2>
        <button onClick={toggleCamera}>
          {isOpenCamera ? "关闭摄像头" : "打开摄像头"}
        </button>
        <div ref={videoContainerRef} className={classes.VideoContainer}></div>
      </div>
    </div>
  );
};

export default LiveVideo;
