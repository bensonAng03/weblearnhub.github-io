import { useEffect, useState, useRef } from "react";
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
  faStop,
  faTemperature2,
  faUsers,
  faVideo,
  faVideoSlash,
  faVolumeMute,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./LiveCourse.module.css";
import RandomNamePicker from "./RandomNamePicker/RandomNamePicker";
import Backdrop from "../UI/Backdrop/Backdrop";
import ConfirmModal from "./ConfirmModal/ConfirmModal";
const socket = io("https://socket-server-rwl3.onrender.com");
let userCameraIdData = "";
let userScreenIdData = "";
let userCameraIdList = [];
let userScreenIdList = [];
let cameraVideo = null;
let screenVideo = null;
let mutedStatus = true;
let isScreenSharingRequested = false;
let username = JSON.parse(localStorage.getItem("user"))?.username;
let userId = JSON.parse(localStorage.getItem("user"))?.id;
let sharePeer = new Peer(undefined, {
  host: "0.peerjs.com",
  secure: true,
  port: 443,
});
let cameraPeer = new Peer(undefined, {
  host: "0.peerjs.com",
  secure: true,
  port: 443,
});
const LiveCourse = () => {
  const [isShowWarning, setIsShowWarning] = useState(false);
  const [users, setUsers] = useState([]);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isShareScreen, setIsShareScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [raiseHandList, setRaiseHandList] = useState([]);
  const [isShareAudio, setIsShareAudio] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60 * 1000);
  const [paused, setPaused] = useState(false);
  const [inactivityThreshold, setInactivityThreshold] = useState(30 * 60);
  const [isCheckInteractionStatus, setIsCheckInteractionStatus] =
    useState(true);
  const [isUsersListSuccess, setIsUsersListSuccess] = useState(false);
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false);
  const [confirmModalInfo, setConfirmModalInfo] = useState({});
  const [isToggleStreamLoading, setIsToggleStreamLoading] = useState(false);
  const [isToggleShareScreenLoading, setIsToggleShareScreenLoading] =
    useState(false);
  const { room, id: authorId } = useParams(null);
  const videoContainerRef = useRef(null);
  const shareVideoRef = useRef(null);
  const chatroomRef = useRef(null);
  const myVideoRef = useRef(null);
  const interactionTimeInputRef = useRef(null);
  window.onbeforeunload = () => {
    socket.emit("disconnect");
    removeVideoStream(userCameraIdData);
    removeVideoStream(userScreenIdData);
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
    if (userId == authorId) return;
    let timer;
    if (isCheckInteractionStatus) {
      if (!paused) {
        timer = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
      }
      if (countdown === 0) {
        if (myVideoRef.current.srcObject == null) {
          myVideoRef.current.parentNode.style.backgroundColor = "red";
          socket.emit("user-inactive", room, userCameraIdData, true);
          setIsShowWarning(true);
          setPaused(true);
        } else {
          restartTimer();
        }
      }
    }
    return () => clearInterval(timer);
  }, [countdown, paused, isCheckInteractionStatus]);

  const restartTimer = (time = 0) => {
    setCountdown(time != 0 && time > 0 ? time : inactivityThreshold);
    setIsShowWarning(false);
    setPaused(false); // 重新开始计时
    myVideoRef.current.parentNode.style.backgroundColor = ""; // 恢复初始背景颜色
  };
  useEffect(() => {
    sharePeer.on("open", (id) => {
      const userIdTemp = "share" + id;
      userScreenIdData = userIdTemp;
      console.log("userScreenIdData;", userScreenIdData);
      socket.emit("join-room", room, userIdTemp, username, authorId == userId);
      socket.emit("request-share-video-stream", room, userScreenIdData);
      sendPersonalStatus(isShareScreen, isOpenCamera, isShareAudio);
    });
    cameraPeer.on("open", (id) => {
      const userIdTemp = "camera" + id;
      userCameraIdData = userIdTemp;
      console.log(authorId == userId);
      socket.emit("join-room", room, userIdTemp, username, authorId == userId);
      socket.emit("request-video-stream", room, userCameraIdData);
      sendPersonalStatus(isShareScreen, isOpenCamera, isShareAudio);
    });
    socket.on("user-connected", (userId, usernameData) => {
      if (
        userId != userCameraIdData &&
        userId != userScreenIdData &&
        !userCameraIdList.includes(userId) &&
        !userScreenIdList.includes(userId)
      ) {
        console.log("add" + userId + "username:" + usernameData);
        if (userId.startsWith("camera")) {
          userCameraIdList.push(userId);
          socket.emit("request-video-stream", room, userCameraIdData, username);
          ("add user-connected");
          addVideoStream(userId, usernameData);
        } else if (userId.startsWith("share")) {
          userScreenIdList.push(userId);
          socket.emit(
            "request-share-video-stream",
            room,
            userScreenIdData,
            username
          );
        }
      }
    });
    socket.on("user-disconnected", (username, userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user != username));
      if (userId.startsWith("camera")) {
        const videoToRemove = document.getElementById(userId);
        const videoWrapperToRemove = videoToRemove?.parentNode;
        videoToRemove?.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        if (videoToRemove) {
          videoContainerRef.current.removeChild(videoWrapperToRemove);
        }
        userCameraIdList = userCameraIdList.filter((id) => id != userId);
      } else if (userId.startsWith("share")) {
        if (shareVideoRef.current.id == userId) {
          setIsShowShareScreen(false);
          shareVideoRef.current.id = "";
          shareVideoRef.current.srcObject = null;
        }
        userScreenIdList = userScreenIdList.filter((id) => id != userId);
      }
    });
    socket.on("get-info", (existingUsersId, existingUsers, time) => {
      if (time >= 0) {
        setInactivityThreshold(time);
        handleInteraction(time);
      }
      console.log("get-info");
      console.log(existingUsersId);
      console.log(existingUsers);
      if (
        existingUsersId.includes(userCameraIdData) ||
        existingUsersId.includes(userScreenIdData)
      ) {
        // 如果数组中已经包含自己的用户ID，则删除自己的用户ID
        if (existingUsersId[0].startsWith("camera")) {
          let userIdSet = Array.from(new Set(existingUsersId));
          userCameraIdList = userIdSet.filter((id) => id != userCameraIdData);
        } else if (existingUsersId[0].startsWith("share")) {
          let userIdSet = Array.from(new Set(existingUsersId));
          userScreenIdList = userIdSet.filter((id) => id != userScreenIdData);
        }
      } else {
        console.log("change the list");
        if (existingUsersId[0].startsWith("camera")) {
          userCameraIdList = existingUsersId;
          existingUsersId.forEach((userId) => {
            console.log("add existing");
            addVideoStream(userId, existingUsers);
          });
        } else if (existingUsersId[0].startsWith("share")) {
          userScreenIdList = existingUsersId;
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
      socket.off("get-info");
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
          myVideoRef.current.muted = true;
          myVideoRef.current.addEventListener("loadedmetadata", () => {
            myVideoRef.current.play();
          });
          for (let i = 0; i < userCameraIdList.length; i++) {
            let peer = userCameraIdList[i];
            if (peer != userCameraIdData) {
              // 排除当前用户
              console.log("Calling peer: ", peer);
              console.log(peer);
              cameraPeer.call(peer.replace("camera", ""), cameraVideo);
            }
          }
          setIsToggleStreamLoading(false);
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setIsToggleStreamLoading(false);
        });
    } else {
      myVideoRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      myVideoRef.current.srcObject = null;
      socket.emit("stop-video-stream", room, userCameraIdData);
      setIsToggleStreamLoading(false);
    }
    sendPersonalStatus(isShareScreen, isOpenCameraData, isShareAudioData);
  };
  const toggleShareScreen = () => {
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
              if (peer != userScreenIdData) {
                sharePeer.call(peer.replace("share", ""), stream);
              }
            }
            setIsToggleShareScreenLoading(false);
            setIsShowShareScreen(true);
          })
          .catch((error) => {
            console.error(error);
            shareVideoRef.current.srcObject = null;
            setIsShareScreen(false);
            setIsShowShareScreen(false);
            setIsToggleShareScreenLoading(false);
          });
      } else if (userScreenIdData != shareVideoRef.current.id) {
        socket.emit(
          "request-share-myvideo-stream",
          room,
          userScreenIdData,
          shareVideoRef.current.id
        );
        setIsShowShareScreen(true);
      }
    } else {
      if (shareVideoRef.current.id === userScreenIdData) {
        shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        socket.emit("stop-share-video-stream", room, userScreenIdData);
        shareVideoRef.current.setAttribute("id", "");
        shareVideoRef.current.srcObject = null;
        setIsToggleShareScreenLoading(false);
        setIsShowShareScreen(false);
      }
    }
  };
  useEffect(() => {
    socket.on("stopped-video-stream", (userId) => {
      const videoToRemove = document.getElementById(userId);
      videoToRemove.srcObject?.getTracks().forEach((track) => {
        track.stop();
      });
      videoToRemove.srcObject = null;
      const tempVideo = document.getElementById(userId);
      tempVideo.parentNode.style.backgroundColor = "";
      console.log("stopped change the color");
      tempVideo.previousSibling.style.color = "";
    });
    socket.on("stopped-share-video-stream", (userId, publisherId) => {
      if (userScreenIdData == publisherId) {
        setIsShareScreen(true);
        toggleShareScreen();
      } else {
        console.log("stopped-share-video-stream");
        shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
          track.stop();
        });
        shareVideoRef.current.srcObject = null;
        shareVideoRef.current.setAttribute("id", "");
        setIsShareScreen(false);
        setIsShowShareScreen(false);
      }
      if (
        publisherId &&
        userScreenIdData != publisherId &&
        userScreenIdData == userId
      ) {
        alert(
          "The broadcaster of the live stream has asked you to close the video."
        );
      }
    });
    socket.on("requested-video-stream", (userId) => {
      if (cameraVideo != null) {
        cameraPeer.call(userId.replace("camera", ""), cameraVideo);
      }
    });
    socket.on("requested-share-video-stream", (userId) => {
      if (screenVideo != null) {
        console.log("share:", userId.replace("share", ""), screenVideo);
        sharePeer.call(userId.replace("share", ""), screenVideo);
      } else {
        setIsShareScreen(false);
      }
    });
    socket.on(
      "requested-share-myvideo-stream",
      (userId, screenPublisherId, publisherId = "") => {
        let isShare;
        if (userCameraIdData != userId) {
          isScreenSharingRequested = true;
        }
        if (publisherId) {
          if (userScreenIdData == publisherId) {
            if (userScreenIdData == userId) {
              isShare = true;
              setIsShareScreen(true);
              shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
                track.stop();
              });
              shareVideoRef.current.srcObject = null;
              sendPersonalStatus(!isShareScreen, isOpenCamera, isShareAudio);
              socket.emit(
                "stop-share-video-stream",
                room,
                screenPublisherId,
                publisherId
              );
              socket.emit(
                "request-share-yourvideo-stream",
                room,
                userId,
                isShare
              );
              socket.emit("screen-sharing-requested", room, false);
              isScreenSharingRequested = false;
            } else {
              setIsShowConfirmModal(true);
              setConfirmModalInfo({
                message: `Are you sure you want to share the video with ${userId}? Confirming will close the currently shared video.`,
                userId,
                publisherId,
                screenPublisherId,
              });
              // socket.emit(
              //   "request-share-yourvideo-stream",
              //   room,
              //   userId,
              //   isShare
              // );
            }
          }
        } else {
          console.log("publsiherId:none");
          if (userScreenIdData == screenPublisherId) {
            console.log("userScreenIdData == screenPublisherId");
            setIsShowConfirmModal(true);
            setConfirmModalInfo({
              message: `Are you sure you want to share the video with ${userId}? Confirming will close the currently shared video.`,
              userId,
              publisherId,
              screenPublisherId,
            });
          }
        }
      }
    );
    socket.on("requested-share-yourvideo-stream", (userId, isShare) => {
      console.log("requested-share-yourvideo-stream");
      if (userId == userScreenIdData) {
        if (isShare) {
          setIsShareScreen(true);
          toggleShareScreen();
          setIsToggleShareScreenLoading(false);
        } else {
          setIsShareScreen(false);
          setIsShowShareScreen(true);
          alert(
            "The person currently sharing the video has declined your video sharing request."
          );
          setIsToggleShareScreenLoading(false);
        }
      }
    });
    socket.on("raised-hand", (userId, username, isRaiseHand) => {
      console.log("raise hand");
      if (isRaiseHand) {
        setRaiseHandList((prevMessages) => [
          ...prevMessages,
          { userId, name: username },
        ]);
      } else {
        setRaiseHandList((prevMessages) =>
          prevMessages.filter((item) => item.userId != userId)
        );
      }
    });
    socket.on("got-all-user-info", (users, userId) => {
      console.log(users);
      if (userId === userCameraIdData) {
        setUsers(users);
        setIsUsersListSuccess(true);
      }
    });
    socket.on("muted-audio", (publisherId) => {
      console.log("publisherId", publisherId);
      console.log("userCameraIdData", userCameraIdData);
      const newArray = userCameraIdList.filter((item) => item != publisherId);
      console.log(newArray);
      for (let i = 0; i < newArray.length; i++) {
        let tempUserId = newArray[i];
        const streamElement = document.getElementById(tempUserId);
        if (streamElement && streamElement.length != 0) {
          console.log("changeColor");
          console.log(streamElement);
          streamElement.parentNode.style.backgroundColor = "";
          streamElement.previousSibling.style.color = "";
        }
      }
      if (publisherId != undefined && publisherId === userCameraIdData) {
        console.log("same");
      } else {
        setIsShareAudio(false);
        if (myVideoRef.current.srcObject != null) {
          const videoTracks = myVideoRef.current.srcObject.getVideoTracks();
          const audioTracks = myVideoRef.current.srcObject.getAudioTracks();

          if (videoTracks.length > 0) {
            toggleStream(true, false);
          } else if (audioTracks.length > 0) {
            myVideoRef.current.srcObject?.getTracks().forEach((track) => {
              track.stop();
            });
            console.log(videoContainerRef.current);
          }
        }
      }
    });
    socket.on("user-inactivated", (userId, isShowWarningData) => {
      console.log("132232");
      const videoToRemove = document.getElementById(userId);
      console.log(userId);
      const pElement = videoToRemove?.previousSibling;
      if (isShowWarningData) {
        console.log("change color");
        pElement.style.color = "red";
      } else {
        pElement.style.color = "";
      }
    });
    socket.on("modified-interaction-time", (interactionTime) => {
      setInactivityThreshold(interactionTime);
      handleInteraction(interactionTime);
    });
    socket.on("screen-sharing-requested-status", (requestStatus) => {
      isScreenSharingRequested = requestStatus;
    });

    cameraPeer.on("call", (call) => {
      const tempVideo = document.getElementById(`camera${call.peer}`);
      console.log(tempVideo);
      tempVideo.parentNode.style.backgroundColor = "blue";
      tempVideo.previousSibling.style.color = "white";
      console.log(tempVideo);
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
    return () => {
      socket.off("stopped-video-stream");
      socket.off("stopped-share-video-stream");
      socket.off("requested-video-stream");
      socket.off("requested-share-video-stream");
      socket.off("requested-share-myvideo-stream");
      socket.off("requested-share-yourvideo-stream");
      socket.off("raised-hand");
      socket.off("muted-audio");
    };
  }, []);
  const toggleVideoStream = (stream, userId) => {
    console.log(userId);
    const videoTemp = document.getElementById(userId);
    if (videoTemp && videoTemp?.srcObject) {
      videoTemp.srcObject = stream;
      videoTemp.muted = mutedStatus;
      videoTemp.addEventListener("loadedmetadata", () => {
        videoTemp.play();
      });
    } else {
      videoTemp.srcObject = stream;
      videoTemp.muted = mutedStatus;
      videoTemp.addEventListener("loadedmetadata", () => {
        videoTemp.play();
      });
    }
  };
  const addVideoStream = (tempUserId, tempUsername = "") => {
    console.log(tempUserId);
    console.log(tempUsername);
    if (tempUsername == username) return;
    let tempUsernameData;
    if (Array.isArray(tempUsername)) {
      const tempUserArr = tempUsername.filter(
        (item) =>
          item.userCameraId.length != 0 && item.userCameraId != userCameraIdData
      );
      tempUsernameData = tempUserArr;
      console.log(tempUsernameData);
      if (!tempUsernameData) return;
      tempUsernameData.forEach((item) => {
        const isHave = document.getElementById(item.userCameraId);
        if (!isHave) {
          const videoWrapper = document.createElement("div");
          const video = document.createElement("video");
          video.setAttribute("id", item.userCameraId);
          video.srcObject = null;
          const p = document.createElement("p");
          p.textContent = item.username;
          videoWrapper.appendChild(p);
          videoWrapper.appendChild(video);
          videoContainerRef.current.appendChild(videoWrapper);
        }
      });
    } else {
      const videoWrapper = document.createElement("div");
      const video = document.createElement("video");
      video.setAttribute("id", tempUserId);
      video.srcObject = null;
      const p = document.createElement("p");
      p.textContent = tempUsername;
      videoWrapper.appendChild(p);
      videoWrapper.appendChild(video);
      videoContainerRef.current.appendChild(videoWrapper);
      return;
    }
  };
  const removeVideoStream = (tempUserId) => {
    console.log(userScreenIdList);
    if (tempUserId.startsWith("camera")) {
      const videoToRemove = document.getElementById(tempUserId);
      const videoWrapperToRemove = videoToRemove?.parentNode;
      videoToRemove?.srcObject?.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoToRemove) {
        videoContainerRef.current.removeChild(videoWrapperToRemove);
      }
      userCameraIdList = userCameraIdList.filter((id) => id != tempUserId);
    } else if (tempUserId.startsWith("share")) {
      const videoToRemove = document.getElementById(tempUserId);
      const videoWrapperToRemove = videoToRemove?.parentNode;
      videoToRemove?.srcObject?.getTracks().forEach((track) => {
        track.stop();
      });
      if (videoToRemove) {
        videoContainerRef.current.removeChild(videoWrapperToRemove);
      }
      userScreenIdList = userScreenIdList.filter((id) => id != tempUserId);
    }
  };
  const handleSendMessage = (messageInput) => {
    if (messageInput.trim() != "") {
      socket.emit("message", {
        content: messageInput,
        sender: username,
        roomId: room, // 使用当前选择的聊天室ID
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: messageInput,
          sender: username,
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
    socket.emit(
      "personal-status",
      room,
      username,
      userCameraIdData,
      userScreenIdData,
      isShareScreen,
      isOpenCamera,
      isShareAudio
    );
  };
  const openSoundFn = () => {
    mutedStatus = false;
    for (let i = 0; i < userCameraIdList.length; i++) {
      let tempUserId = userCameraIdList[i];
      const streamElement = document.getElementById(tempUserId);
      if (streamElement && streamElement.length != 0) {
        streamElement.muted = mutedStatus;
        streamElement.addEventListener("loadedmetadata", () => {
          streamElement.play();
        });
      }
    }
  };
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpin, setIsSpin] = useState(false);
  const [isShowShareScreen, setIsShowShareScreen] = useState(false);
  const [type, setType] = useState("");
  const [isRaiseHand, setIsRaiseHand] = useState(false);
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
          name: username,
        },
      ]);
    } else {
      setRaiseHandList((prevMessages) =>
        prevMessages.filter((item) => item.userId != userCameraIdData)
      );
    }
    socket.emit("raise-hand", room, userCameraIdData, username, isRaiseHand);
  };
  const handleInteraction = (time = 0) => {
    myVideoRef.current.parentNode.style.backgroundColor = "";
    socket.emit("user-inactive", room, userCameraIdData, false);
    restartTimer(time);
  };
  const showChatroom = () => {
    handleInteraction();
    setType(type === "chatroom" ? "" : "chatroom");
  };
  const shareAudio = () => {
    setIsShareAudio(!isShareAudio);
    toggleStream(isOpenCamera, !isShareAudio);
  };
  const shareCameraStream = () => {
    if (!isToggleStreamLoading) {
      setIsToggleStreamLoading(true);
      handleInteraction();
      setIsOpenCamera(!isOpenCamera);
      toggleStream(!isOpenCamera, isShareAudio);
    }
  };
  const shareStream = () => {
    if (!isToggleShareScreenLoading) {
      setIsToggleShareScreenLoading(true);
      setIsShareScreen(!isShareScreen);
      toggleShareScreen();
    }
  };
  const showRaiseHandList = () => {
    setType(type === "raiseHandList" ? "" : "raiseHandList");
  };
  const raiseHandFn = () => {
    handleInteraction();
    setIsRaiseHand(!isRaiseHand);
    sendRaiseHandFn(!isRaiseHand);
  };
  const chooseUserFn = () => {
    setIsUsersListSuccess(false);
    setIsSpin(!isSpin);
    if (!isSpin) {
      socket.emit("get-all-user-info", room, userCameraIdData);
    }
    setType(type === "randomNamePicker" ? "" : "randomNamePicker");
  };
  const muteAllAudioFn = () => {
    socket.emit("reset-publisher-id", room, userCameraIdData, userScreenIdData);
    socket.emit("mute-audio", room, userCameraIdData);
  };
  const modifyInteractionTimeFn = () => {
    console.log(interactionTimeInputRef.current.value || inactivityThreshold);
    if (+interactionTimeInputRef.current.value <= 0) return;
    setInactivityThreshold(interactionTimeInputRef.current.value);
    handleInteraction(interactionTimeInputRef.current.value);
    setType("");
    socket.emit(
      "modify-interaction-time",
      room,
      interactionTimeInputRef.current.value
    );
  };
  useEffect(() => {
    if (userId == authorId) {
      socket.emit(
        "reset-publisher-id",
        room,
        userCameraIdData,
        userScreenIdData
      );
    }
  }, []);
  const confirmFn = (screenPublisherId, publisherId, userIdTemp) => {
    setIsShowConfirmModal(false);
    setIsShareScreen(false);
    setConfirmModalInfo({});
    shareVideoRef.current.srcObject?.getTracks().forEach((track) => {
      track.stop();
    });
    shareVideoRef.current.srcObject = null;
    sendPersonalStatus(!isShareScreen, isOpenCamera, isShareAudio);
    socket.emit(
      "stop-share-video-stream",
      room,
      screenPublisherId,
      publisherId
    );
    isScreenSharingRequested = false;
    socket.emit("request-share-yourvideo-stream", room, userIdTemp, true);
    socket.emit("screen-sharing-requested", room, false);
  };

  const cancelFn = (userIdTemp) => {
    setIsShowConfirmModal(false);
    setIsShareScreen(true);
    setConfirmModalInfo({});
    isScreenSharingRequested = false;
    socket.emit("request-share-yourvideo-stream", room, userIdTemp, false);
    socket.emit("screen-sharing-requested", room, false);
  };
  return (
    <div className={classes.LiveCourseContainer}>
      {isShowConfirmModal && (
        <ConfirmModal
          info={confirmModalInfo}
          confirmFn={confirmFn}
          cancelFn={cancelFn}
        />
      )}
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
              <div
                className={
                  isShareAudio
                    ? `${classes.VideoLayoutContainer} ${classes.Active}`
                    : classes.VideoLayoutContainer
                }
              >
                {myVideoRef.current?.srcObject?.getVideoTracks() != [] && (
                  <p className={classes.Username}>{username}</p>
                )}
                <video className={classes.MyVideo} ref={myVideoRef} />
              </div>
            </div>
            <div className={classes.FunctionContainer}>
              {type == "randomNamePicker" ? (
                isUsersListSuccess && <RandomNamePicker users={users} />
              ) : type == "chatroom" ? (
                <Chatroom
                  ref={chatroomRef}
                  messages={messages}
                  handleSendMessage={handleSendMessage}
                  name={username}
                />
              ) : type == "raiseHandList" ? (
                <RaiseHand
                  raiseHandList={raiseHandList}
                  sendRaiseHandFn={sendRaiseHandFn}
                />
              ) : type == "setInteractionTime" ? (
                <div className={classes.InteractionTimeContainer}>
                  <input
                    ref={interactionTimeInputRef}
                    type="number"
                    placeholder={inactivityThreshold}
                  />
                  <button onClick={modifyInteractionTimeFn}>Modify</button>
                </div>
              ) : (
                ""
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
        {userId != authorId && (
          <button onClick={raiseHandFn}>
            <FontAwesomeIcon icon={faHandPaper} />
          </button>
        )}
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
        {mutedStatus && (
          <button className={classes.OpenSound} onClick={openSoundFn}>
            <FontAwesomeIcon icon={faVolumeMute} />
          </button>
        )}
        {userId == authorId && (
          <>
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
            <button
              onClick={() => {
                setIsCheckInteractionStatus(true);
                setType(
                  type === "setInteractionTime" ? "" : "setInteractionTime"
                );
              }}
            >
              <FontAwesomeIcon icon={faWarning} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default LiveCourse;
