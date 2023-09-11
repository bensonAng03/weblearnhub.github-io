import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "peerjs";
import Chatroom from "./Chatroom/Chatroom";
import RaiseHand from "./RaiseHand/RaiseHand";
import RecordRTC from "recordrtc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faDesktop,
  faHandPaper,
  faMicrophone,
  faMicrophoneAltSlash,
  faPen,
  faRecordVinyl,
  faSpinner,
  faStickyNote,
  faStop,
  faUsers,
  faVideo,
  faVideoSlash,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./LiveCourse.module.css";
import Roulette from "./Roulette/Roulette";
import { courseApi } from "../../store/api/courseApi";
import Backdrop from "../UI/Backdrop/Backdrop";
// const socket = io("http://localhost:8080");
let userCameraIdData = "";
let userScreenIdData = "";
let userCameraIdList = [];
let userScreenIdList = [];
let cameraVideo = null;
let screenVideo = null;
let mutedStatus = true;
let InactivityThreshold = 60000;
let username = JSON.parse(localStorage.getItem("user"))?.username;
let userId = JSON.parse(localStorage.getItem("user"))?.id;
let sharePeer = new Peer(undefined,{
  host: "0.peerjs.com",
  secure: true,
  port: 443,
});
let cameraPeer = new Peer(undefined,{
  host: "0.peerjs.com",
  secure: true,
  port: 443,
});
// let sharePeer = new Peer(undefined,{
//   host: "/",
//   port: 8081,
// });
// let cameraPeer = new Peer(undefined,{
//   host: "/",
//   port: 8081,
// });
const LiveCourse = () => {
  const [isShowWarning, setIsShowWarning] = useState(false);
  const [users, setUsers] = useState([]);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isShareScreen, setIsShareScreen] = useState(false);
  const [name, setName] = useState(username);
  const [messages, setMessages] = useState([]);
  const [raiseHandList, setRaiseHandList] = useState([]);
  const [isShareAudio, setIsShareAudio] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [paused, setPaused] = useState(false);
  const { room ,id:authorId} = useParams(null);
  const videoContainerRef = useRef(null);
  const shareVideoRef = useRef(null);
  const chatroomRef = useRef(null);
  const myVideoRef = useRef(null);
  window.onbeforeunload = () => {
    // socket.emit("disconnect");
    sharePeer.destroy((err) => {
      if (err) {
        console.error("Error closing sharePeer:", err);
      } else {
        console.log("sharePeer connection closed");
      }
    });
    cameraPeer.destroy((err) => {
      if (err) {
        console.error("Error closing cameraPeer:", err);
      } else {
        console.log("cameraPeer connection closed");
      }
    });
  };

  useEffect(() => {
    let timer;
    if (!paused) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    if (countdown === 0) {
      if (myVideoRef.current.srcObject == null) {
        myVideoRef.current.parentNode.style.backgroundColor = "red";
        // socket.emit("user-inactive", room, userCameraIdData, true);
        setIsShowWarning(true);
        setPaused(true);
      } else {
        restartTimer();
      }
    }
    return () => clearInterval(timer);
  }, [countdown, paused]);

  const restartTimer = () => {
    setCountdown(20);
    setIsShowWarning(false);
    setPaused(false); // 重新开始计时
    myVideoRef.current.parentNode.style.backgroundColor = "grey"; // 恢复初始背景颜色
  };
  useEffect(() => {
    sharePeer.on("open", (id) => {
      console.log('My Peer ID is: ' + id);
    });
      const userIdTemp = "share" + id;
      userScreenIdData = userIdTemp;
      console.log(authorId==userId)
      socket.emit("join-room", room, userIdTemp, authorId == userId);
      socket.emit("request-share-video-stream", room, userScreenIdData);
      sendPersonalStatus(isShareScreen, isOpenCamera, isShareAudio);
    var conn = sharePeer.connect('another-peers-id');
conn.on('open', function(){
  conn.send('hi!');
});
    sharePeer.on('connection', (connection) => {
      console.log("connect")
      const remotePeerId = connection.peer;
      console.log('Connected to remote Peer with ID: ' + remotePeerId);
    });
    cameraPeer.on("open", (id) => {
      const userIdTemp = "camera" + id;
      userCameraIdData = userIdTemp;
      console.log(authorId==userId)
      // socket.emit("join-room", room, userIdTemp, authorId == userId);
      // socket.emit("request-video-stream", room, userCameraIdData);
      sendPersonalStatus(isShareScreen, isOpenCamera, isShareAudio);
    });
    cameraPeer.on('connection', (connection) => {
      // 在建立连接时，您可以获取对方的 Peer ID
      console.log("connect")
      const remotePeerId = connection.peer;
      console.log('Connected to remote Peer with ID: ' + remotePeerId);
    });
    socket.on("user-connected", (userId) => {
      if (
        userId !== userCameraIdData &&
        userId !== userScreenIdData &&
        !userCameraIdList.includes(userId) &&
        !userScreenIdList.includes(userId)
      ) {
        console.log("add" + userId);
        if (userId.startsWith("camera")) {
          userCameraIdList.push(userId);
          socket.emit("request-video-stream", room, userCameraIdData);
          addVideoStream(userId);
        } else if (userId.startsWith("share")) {
          userScreenIdList.push(userId);
          socket.emit("request-share-video-stream", room, userScreenIdData);
        }
      }
    });
    socket.on("user-disconnected", (username, userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user !== username));
      if (userId.startsWith("camera")) {
        const videoToRemove = document.getElementById(userId);
        const videoWrapperToRemove = videoToRemove?.parentNode;
        videoToRemove?.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoWrapperToRemove);
        }
        userCameraIdList = userCameraIdList.filter((id) => id !== userId);
      } else if (userId.startsWith("share")) {
        const videoToRemove = document.getElementById(userId);
        const videoWrapperToRemove = videoToRemove?.parentNode;
        videoToRemove?.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoWrapperToRemove);
        }
        // }
        // 用户属于 sharePeer
        userScreenIdList = userScreenIdList.filter((id) => id !== userId);
      }
    });
    socket.on("existing-users", (existingUsers) => {
      console.log("existing-users");
      if (
        existingUsers.includes(userCameraIdData) ||
        existingUsers.includes(userScreenIdData)
      ) {
        // 如果数组中已经包含自己的用户ID，则删除自己的用户ID
        if (existingUsers[0].startsWith("camera")) {
          let userIdSet = Array.from(new Set(existingUsers));
          userCameraIdList = userIdSet.filter((id) => id !== userCameraIdData);
        } else if (existingUsers[0].startsWith("share")) {
          let userIdSet = Array.from(new Set(existingUsers));
          userScreenIdList = userIdSet.filter((id) => id !== userScreenIdData);
        }
      } else {
        console.log("change the list");
        if (existingUsers[0].startsWith("camera")) {
          userCameraIdList = existingUsers;
          existingUsers.forEach((userId) => {
            addVideoStream(userId);
          });
        } else if (existingUsers[0].startsWith("share")) {
          userScreenIdList = existingUsers;
        }
      }
    });
    socket.on("message", (charData) => {
      console.log(charData);
      setMessages((prevMessages) => [...prevMessages, charData]);
      console.log(messages);
    });
    return () => {
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("existing-users");
      socket.off("message");
    };
  }, []);
  useEffect(() => {
    socket.on("user-connected", (userId) => {
      if (
        userId !== userCameraIdData &&
        userId !== userScreenIdData &&
        !userCameraIdList.includes(userId) &&
        !userScreenIdList.includes(userId)
      ) {
        console.log("add" + userId);
        if (userId.startsWith("camera")) {
          userCameraIdList.push(userId);
          socket.emit("request-video-stream", room, userCameraIdData);
          addVideoStream(userId);
        } else if (userId.startsWith("share")) {
          userScreenIdList.push(userId);
          socket.emit("request-share-video-stream", room, userScreenIdData);
        }
      }
    });
    socket.on("user-disconnected", (username, userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user !== username));
      if (userId.startsWith("camera")) {
        const videoToRemove = document.getElementById(userId);
        const videoWrapperToRemove = videoToRemove?.parentNode;
        videoToRemove?.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoWrapperToRemove);
        }
        userCameraIdList = userCameraIdList.filter((id) => id !== userId);
      } else if (userId.startsWith("share")) {
        const videoToRemove = document.getElementById(userId);
        const videoWrapperToRemove = videoToRemove?.parentNode;
        videoToRemove?.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoWrapperToRemove);
        }
        }
        // 用户属于 sharePeer
        userScreenIdList = userScreenIdList.filter((id) => id !== userId);
      }
    });
    socket.on("existing-users", (existingUsers) => {
      console.log("existing-users");
      if (
        existingUsers.includes(userCameraIdData) ||
        existingUsers.includes(userScreenIdData)
      ) {
        // 如果数组中已经包含自己的用户ID，则删除自己的用户ID
        if (existingUsers[0].startsWith("camera")) {
          let userIdSet = Array.from(new Set(existingUsers));
          userCameraIdList = userIdSet.filter((id) => id !== userCameraIdData);
        } else if (existingUsers[0].startsWith("share")) {
          let userIdSet = Array.from(new Set(existingUsers));
          userScreenIdList = userIdSet.filter((id) => id !== userScreenIdData);
        }
      } else {
        console.log("change the list");
        if (existingUsers[0].startsWith("camera")) {
          userCameraIdList = existingUsers;
          existingUsers.forEach((userId) => {
            addVideoStream(userId);
          });
        } else if (existingUsers[0].startsWith("share")) {
          userScreenIdList = existingUsers;
        }
      }
    });
    socket.on("message", (charData) => {
      console.log(charData);
      setMessages((prevMessages) => [...prevMessages, charData]);
      console.log(messages);
    });
    return () => {
      socket.off("user-connected");
      socket.off("user-disconnected");
      socket.off("existing-users");
      socket.off("message");
    };
  }, []);
  const toggleStream = (isOpenCameraData, isShareAudioData) => {
    setIsOpenCamera(isOpenCameraData);
    setIsShareAudio(isShareAudioData);
    if (isOpenCameraData || isShareAudioData) {
      navigator.mediaDevices
        .getUserMedia({ video: isOpenCameraData, audio: isShareAudioData })
        .then((stream) => {
          myVideoRef.current.srcObject = stream;
          cameraVideo = stream;
          myVideoRef.current.muted = mutedStatus;
          myVideoRef.current.addEventListener("loadedmetadata", () => {
            myVideoRef.current.play();
          });
          for (let i = 0; i < userCameraIdList.length; i++) {
            let peer = userCameraIdList[i];
            if (peer !== userCameraIdData) {
              // 排除当前用户
              console.log("Calling peer: ", peer);
              console.log(peer);
              cameraPeer.call(peer.replace("camera", ""), cameraVideo);
            }
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    } else {
      myVideoRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      myVideoRef.current.srcObject = null;
      // socket.emit("stop-video-stream", room, userCameraIdData);
    }
    sendPersonalStatus(isShareScreen, isOpenCameraData, isShareAudioData);
  };
  const toggleShareScreen = () => {
    console.log(
      !isShareScreen,
      userScreenIdData === shareVideoRef.current.id,
      userScreenIdData,
      shareVideoRef.current.id,
      shareVideoRef.current.srcObject !== null
    );
    setIsShowShareScreen(!isShowShareScreen);
    if (!isShareScreen) {
      if (!shareVideoRef.current.srcObject) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true })
          .then((stream) => {
            shareVideoRef.current.srcObject = stream;
            screenVideo = stream;
            shareVideoRef.current.muted = mutedStatus;
            shareVideoRef.current.setAttribute("id", userScreenIdData);
            shareVideoRef.current.addEventListener("loadedmetadata", () => {
              shareVideoRef.current.play();
            });
            for (let i = 0; i < userScreenIdList.length; i++) {
              let peer = userScreenIdList[i];
              if (peer !== userScreenIdData) {
                // 排除当前用户
                console.log("Calling peer: ", peer);
                console.log(peer);
                sharePeer.call(peer.replace("share", ""), stream);
                // sharePeer.call(peer, stream);
              }
            }
          })
          .catch((error) => {
            console.error(error);
            shareVideoRef.current.srcObject = null;
            setIsShowShareScreen(false);
            setIsShareScreen(false);
          });
      } else if (userScreenIdData !== shareVideoRef.current.id) {
        console.log("shareVideoRef.current.id", shareVideoRef.current.id);
        // socket.emit(
        //   "request-share-myvideo-stream",
        //   room,
        //   userScreenIdData,
        //   shareVideoRef.current.id
        // );
      }
    } else {
      if (shareVideoRef.current.id === userScreenIdData) {
        shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        // socket.emit("stop-share-video-stream", room, userScreenIdData);
        shareVideoRef.current.setAttribute("id", "");
        shareVideoRef.current.srcObject = null;
      }
    }
  };
  useEffect(() => {
    if (shareVideoRef.current.srcObject !== null) {
      setIsShowShareScreen(true);
    } else {
      setIsShowShareScreen(false);
    }
  }, [shareVideoRef.current]);
  // useEffect(() => {
  //   socket.on("stopped-video-stream", (userId) => {
  //     const videoToRemove = document.getElementById(userId);
  //     videoToRemove.srcObject?.getTracks().forEach((track) => {
  //       track.stop();
  //     });
  //     videoToRemove.srcObject = null;
  //   });
  //   socket.on("stopped-share-video-stream", (userId) => {
  //     setIsShowShareScreen(false);
  //     shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
  //       track.stop();
  //     });
  //     shareVideoRef.current.srcObject = null;
  //     shareVideoRef.current.setAttribute("id", "");
  //   });
  //   socket.on("requested-video-stream", (userId) => {
  //     console.log("requested-video",userId);
  //     console.log("call", userCameraIdData, userId);
  //     console.log(cameraVideo);
  //     if (cameraVideo !== null) {
  //       console.log("2");
  //       console.log(myVideoRef.current.srcObject);
  //       console.log(userId);
  //       console.log("camera:",)
  //       cameraPeer.call(userId.replace("camera", ""), cameraVideo);
  //       // cameraPeer.call(userId, cameraVideo);
  //     }
  //   });
  //   socket.on("requested-share-video-stream", (userId) => {
  //     if (screenVideo !== null) {
  //       console.log("share:",userId.replace("share", ""), screenVideo)
  //       sharePeer.call(userId.replace("share", ""), screenVideo);
  //     }
  //   });
  //   socket.on("requested-share-myvideo-stream", (userId, publisherId = "") => {
  //     console.log(
  //       "publisherId",
  //       publisherId,
  //       "userScreenIdData",
  //       userScreenIdData
  //     );
  //     console.log(userScreenIdData == publisherId);
  //     if (userScreenIdData == publisherId) {
  //       let isShare = confirm(
  //         `确认让${userId}共享视频吗?确认后，你会关闭共享视频。`
  //       );
  //       console.log(screenVideo);
  //       if (isShare) {
  //         setIsShareScreen(false);
  //         shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
  //           track.stop();
  //         });
  //         shareVideoRef.current.srcObject = null;
  //         sendPersonalStatus(!isShareScreen, isOpenCamera, isShareAudio);
  //         socket.emit("stop-share-video-stream", room, userScreenIdData);
  //       }

  //       socket.emit("request-share-yourvideo-stream", room, userId, isShare);
  //     }
  //   });
  //   socket.on("requested-share-yourvideo-stream", (userId, isShare) => {
  //     if (userId == userScreenIdData) {
  //       if (isShare) {
  //         toggleShareScreen();
  //         setIsShareScreen(true);
  //       } else {
  //         alert("共享视频的人拒绝了你");
  //         setIsShareScreen(false);
  //       }
  //     }
  //   });
  //   socket.on("raised-hand", (userId, username, isRaiseHand) => {
  //     console.log("raise hand");
  //     if (isRaiseHand) {
  //       setRaiseHandList((prevMessages) => [
  //         ...prevMessages,
  //         { userId, name: username },
  //       ]);
  //     } else {
  //       setRaiseHandList((prevMessages) =>
  //         prevMessages.filter((item) => item.userId !== userId)
  //       );
  //     }
  //   });
  //   socket.on("got-all-username", (usernames, userId) => {
  //     console.log("1");
  //     console.log(usernames);
  //     if (userId === userCameraIdData) {
  //       setUsers(usernames);
  //     }
  //   });
  //   socket.on("muted-audio", (publisherId) => {
  //     console.log("publisherId", publisherId);
  //     console.log("userCameraIdData", userCameraIdData);
  //     if (publisherId !== undefined && publisherId === userCameraIdData) {
  //       console.log("same");
  //     } else {
  //       setIsShareAudio(false);
  //       if (myVideoRef.current.srcObject !== null) {
  //         const videoTracks = myVideoRef.current.srcObject.getVideoTracks();
  //         const audioTracks = myVideoRef.current.srcObject.getAudioTracks();

  //         if (videoTracks.length > 0) {
  //           toggleStream(true, false);
  //         } else if (audioTracks.length > 0) {
  //           myVideoRef.current.srcObject?.getTracks().forEach((track) => {
  //             track.stop();
  //           });
  //           myVideoRef.current.srcObject = null;
  //         }
  //       }
  //     }
  //   });
  //   socket.on("user-inactivated", (userId, isShowWarningData) => {
  //     console.log("132232");
  //     const videoToRemove = document.getElementById(userId);
  //     console.log(userId);
  //     const videoWrapperToRemove = videoToRemove?.parentNode;
  //     if (isShowWarningData) {
  //       console.log("change color");
  //       videoWrapperToRemove.style.backgroundColor = "red";
  //     } else {
  //       videoWrapperToRemove.style.backgroundColor = "gray";
  //     }
  //   });
  //   socket.on(
  //     "user-info-back",
  //     (id, cameraRooms, shareRooms, users, publishers) => {
  //       console.log("back", id);
  //       if (id == userCameraIdData) {
  //         console.log("cameraRooms:", cameraRooms);
  //         console.log("shareRooms:", shareRooms);
  //         console.log("users:", users);
  //         console.log("publishers:", publishers);
  //       }
  //     }
  //   );
  //   return () => {
  //     socket.off("stopped-video-stream");
  //     socket.off("stopped-share-video-stream");
  //     socket.off("requested-video-stream");
  //     socket.off("requested-share-video-stream");
  //     socket.off("requested-share-myvideo-stream");
  //     socket.off("requested-share-yourvideo-stream");
  //     socket.off("raised-hand");
  //     socket.off("muted-all-voices");
  //     socket.off("user-info-back");
  //   };
  // }, []);
  cameraPeer.on("call", (call) => {
    console.log(call);
    call.answer();
    call.on("stream", (stream) => {
      console.log("call.peer", call.peer);
      toggleVideoStream(stream, "camera" + call.peer);
    });
  });
  sharePeer.on("call", (call) => {
    console.log(call);
    setIsShowShareScreen(true);
    call.answer();
    call.on("stream", (stream) => {
      console.log("call.peer", call.peer);
      shareVideoRef.current.setAttribute("id", "share" + call.peer);
      shareVideoRef.current.srcObject = stream;
      shareVideoRef.current.muted = mutedStatus;
      shareVideoRef.current.addEventListener("loadedmetadata", () => {
        shareVideoRef.current.play();
      });
    });
  });
  sharePeer.on('connection', (connection) => {
    console.log("Connection established");
    
    // 获取对方的 Peer ID
    const remotePeerId = connection.peer;
    console.log('Connected to remote Peer with ID: ' + remotePeerId);
    
    // 在这里可以进行进一步的通信操作
    connection.on('data', (data) => {
      console.log('Received data from remote peer: ' + data);
    });
  });
  const toggleVideoStream = (stream, userId) => {
    console.log(userId);
    const videoTemp = document.getElementById(userId);
    if (videoTemp && videoTemp?.srcObject) {
      // const videoWrapper = document.createElement("div");
      // const video = document.createElement("video");
      videoTemp.srcObject = stream;
      videoTemp.muted = mutedStatus;
      videoTemp.addEventListener("loadedmetadata", () => {
        videoTemp.play();
      });
      // video.setAttribute("id", userId);
      // videoWrapper.appendChild(video);
      // ref.current.appendChild(videoWrapper);
    } else {
      videoTemp.srcObject = stream;
      videoTemp.muted = mutedStatus;
      videoTemp.addEventListener("loadedmetadata", () => {
        videoTemp.play();
      });
    }
  };
  const addVideoStream = (userId) => {
    console.log(userId);
    const videoWrapper = document.createElement("div");
    const video = document.createElement("video");
    video.setAttribute("id", userId);
    video.srcObject = null;
    videoWrapper.appendChild(video);
    videoContainerRef.current.appendChild(videoWrapper);
  };
  const handleSendMessage = (messageInput) => {
    if (messageInput.trim() !== "") {
      // socket.emit("message", {
      //   content: messageInput,
      //   sender: name,
      //   roomId: room, // 使用当前选择的聊天室ID
      // });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: messageInput,
          sender: name,
          roomId: room, // 使用当前选择的聊天室ID
        },
      ]);
    }
    handleInteraction();
  };
  const sendPersonalStatus = (
    isShareScreen = false,
    isOpenCamera = false,
    isShareAudio = false
  ) => {
    // socket.emit(
    //   "personal-status",
    //   room,
    //   username,
    //   userCameraIdData,
    //   userScreenIdData,
    //   isShareScreen,
    //   isOpenCamera,
    //   isShareAudio
    // );
    console.log("123")
  };
  const openSoundFn = () => {
    mutedStatus = false;
    for (let i = 0; i < userScreenIdList.length; i++) {
      let userId = userScreenIdList[i];
      const streamElement = document.getElementById(userId);
      if (streamElement && streamElement.length !== 0) {
        streamElement.muted = false;
        streamElement.addEventListener("loadedmetadata", () => {
          streamElement.play();
        });
      }
    }
    for (let i = 0; i < userCameraIdList.length; i++) {
      let userId = userCameraIdList[i];
      const streamElement = document.getElementById(userId);
      if (streamElement && streamElement.length !== 0) {
        streamElement.muted = false;
        streamElement.addEventListener("loadedmetadata", () => {
          streamElement.play();
        });
      }
    }
    myVideoRef.current.muted = false;
    myVideoRef.current.addEventListener("loadedmetadata", () => {
      myVideoRef.current.play();
    });
    shareVideoRef.current.muted = false;
    shareVideoRef.current.addEventListener("loadedmetadata", () => {
      shareVideoRef.current.play();
    });
    console.log("open");
  };
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpin, setIsSpin] = useState(false);
  const [isShowRoulette, setIsShowRoulette] = useState(false);
  const toggleRecording = () => {
    if (!isRecording) {
      // 开始录制
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((mediaStream) => {
          streamRef.current = mediaStream;
          mediaRecorderRef.current = new RecordRTC(mediaStream, {
            type: "video",
            mimeType: "video/webm",
          });
          mediaRecorderRef.current.startRecording();
          setIsRecording(true);
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    } else {
      // 停止录制
      mediaRecorderRef.current.stopRecording(() => {
        const blob = mediaRecorderRef.current.getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recorded-video.webm";
        a.click();
        URL.revokeObjectURL(url);

        // 关闭视频流和音频流
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });

        // 重置录制相关的变量
        mediaRecorderRef.current = null;
        streamRef.current = null;
        setIsRecording(false);
      });
    }
  };
  const sendRaiseHandFn = (isRaiseHand) => {
    if (isRaiseHand) {
      setRaiseHandList((prevMessages) => [
        ...prevMessages,
        {
          userId: userCameraIdData,
          name,
        },
      ]);
    } else {
      setRaiseHandList((prevMessages) =>
        prevMessages.filter((item) => item.userId !== userCameraIdData)
      );
    }
    // socket.emit("raise-hand", room, userCameraIdData, name, isRaiseHand);
  };
  const handleInteraction = () => {
    // const currentTime = Date.now();
    // lastTime=currentTime
    // localStorage.setItem("lastInteractionTime", currentTime.toString());
    myVideoRef.current.parentNode.style.backgroundColor = "gray";
    // socket.emit("user-inactive", room, userCameraIdData, false);
    restartTimer();
  };
  const [isShowChatroom, setIsShowChatroom] = useState(false);
  const [isShowRaiseHandList, setIsShowRaiseHandList] = useState(false);
  const [isShowShareScreen, setIsShowShareScreen] = useState(false);
  const showChatroom = () => {
    handleInteraction();
    setIsShowChatroom(!isShowChatroom);
  };
  const shareAudio = () => {
    handleInteraction();
    setIsShareAudio(!isShareAudio);
    toggleStream(isOpenCamera, !isShareAudio);
  };
  const shareCameraStream = () => {
    handleInteraction();
    setIsOpenCamera(!isOpenCamera);
    toggleStream(!isOpenCamera, isShareAudio);
  };
  const shareStream = () => {
    setIsShareScreen(!isShareScreen);
    toggleShareScreen();
  };
  const showRaiseHandList = () => {
    setIsShowRaiseHandList(!isShowRaiseHandList);
  };
  const raiseHandFn = () => {
    handleInteraction();
    setIsRaiseHand(!isRaiseHand);
    sendRaiseHandFn(!isRaiseHand);
  };
  const chooseUserFn = () => {
    handleInteraction();
    setIsSpin(!isSpin);
    if (!isSpin) {
      // socket.emit("get-all-username", room, userCameraIdData);
    }
    setIsShowRoulette(!isShowRoulette);
  };
  const muteAllAudioFn = () => {
    handleInteraction();
    // socket.emit("mute-audio", room);
  };
  const sendInfo = () => {
    // socket.emit("user-info", room, userCameraIdData);
  };
  const [isRaiseHand, setIsRaiseHand] = useState(false);
  return (
    <div className={classes.LiveCourseContainer}>
      <div style={{ zIndex: "10px", backgroundColor: "purple" }}>
        {countdown}
      </div>
      <div className={classes.LiveCourse}>
        <div className={classes.AllVideoContainer}>
          <div
            className={
              isShowShareScreen
                ? classes.ShareScreenStreamContainer
                : classes.DisplayNone
            }
          >
            <video
              className={classes.ShareScreenStream}
              ref={shareVideoRef}
            ></video>
          </div>

          <div className={classes.OuterVideoContainer}>
            <div
              className={
                !isShowShareScreen && !shareVideoRef.current?.srcObject
                  ? classes.VideoContainer
                  : classes.VerticalVideoLayout
              }
              ref={videoContainerRef}
            >
              <div>
                <video className={classes.MyVideo} ref={myVideoRef}></video>
              </div>
            </div>
            <div className={classes.FunctionContainer}>
              {isShowRoulette && <Roulette usernames={users} />}
              {isShowChatroom && (
                <Chatroom
                  ref={chatroomRef}
                  messages={messages}
                  handleSendMessage={handleSendMessage}
                  name={name}
                />
              )}
              {isShowRaiseHandList && (
                <RaiseHand
                  raiseHandList={raiseHandList}
                  sendRaiseHandFn={sendRaiseHandFn}
                />
              )}
              {isShowWarning && (
                <Backdrop>
                  <div className={classes.InteractionContainer}>
                    <p>User is inactive!</p>
                    <button onClick={handleInteraction}>Interact</button>
                  </div>
                </Backdrop>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className={classes.BtnContainer}>
        <button onClick={showChatroom}>
          <FontAwesomeIcon icon={faComment} />
        </button>

        <button onClick={showRaiseHandList}>
          <FontAwesomeIcon icon={faUsers} />
        </button>
        <button onClick={raiseHandFn}>
          <FontAwesomeIcon icon={faHandPaper} />
        </button>
        <button onClick={shareCameraStream}>
          {isOpenCamera ? (
            <FontAwesomeIcon icon={faVideoSlash} />
          ) : (
            <FontAwesomeIcon icon={faVideo} />
          )}
        </button>
        <button onClick={shareStream}>
          {isShareScreen ? (
            <FontAwesomeIcon icon={faStop} />
          ) : (
            <FontAwesomeIcon icon={faDesktop} />
          )}
        </button>
        <button onClick={shareAudio}>
          {isShareAudio ? (
            <FontAwesomeIcon icon={faMicrophoneAltSlash} />
          ) : (
            <FontAwesomeIcon icon={faMicrophone} />
          )}
        </button>
        <button onClick={toggleRecording}>
          {isRecording ? (
            <FontAwesomeIcon icon={faStop} />
          ) : (
            <FontAwesomeIcon icon={faRecordVinyl} />
          )}
        </button>
        <button>
          <Link to="/white-board" target="_blank">
            <FontAwesomeIcon icon={faPen} />
          </Link>
        </button>
        <button onClick={muteAllAudioFn}>
          <FontAwesomeIcon icon={faVolumeMute} />
        </button>
        <button onClick={chooseUserFn}>
          <FontAwesomeIcon icon={faSpinner} spin={isSpin} />
        </button>
        <button onClick={openSoundFn}>open Sound</button>
        <button onClick={sendInfo}>info</button>
      </nav>
    </div>
  );
};

export default LiveCourse;
