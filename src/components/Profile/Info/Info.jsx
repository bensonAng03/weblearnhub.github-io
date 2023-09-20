import { useEffect, useState } from "react";
import classes from "./Info.module.css";
import { userApi } from "../../../store/api/userApi";
import assetApi from "../../../store/api/assetApi";
import { authApi } from "../../../store/api/authApi";
import { rankApi } from "../../../store/api/rankApi";
import { noteRankApi } from "../../../store/api/noteRankApi";
import { quizRankApi } from "../../../store/api/quizRankApi";
import { quizApi } from "../../../store/api/quizApi";
import { noteApi } from "../../../store/api/noteApi";
import { courseApi } from "../../../store/api/courseApi";
const userId = JSON.parse(localStorage.getItem("user"))?.id;
const avatarId = localStorage.getItem("user")?.avatar
  ? JSON.parse(localStorage.getItem("user"))?.avatar.id
  : 0;
let originalAvatar = {},
  originalUsername = "";
const Info = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState({});
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [warnInfo, setWarnInfo] = useState("");
  const isImage = (file) => {
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
    ];
    return validImageTypes.includes(file.type);
  };
  const handleFileChange = (event) => {
    setIsImageLoading(true)
    const file = event.target.files[0];
    if (file && isImage(file)) {
      assetApi
        .addAsset(file)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            setIsImageLoading(false)
            const newAvatar = {
              mime: data[0].mime,
              url: data[0].url,
              id: data[0].id,
            };
            setAvatar(newAvatar);
          } else {
            setIsImageLoading(false)
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    }
  };

  const fetchUser = () => {
    userApi
      .getUserById(userId)
      .then(({ data, isSuccess }) => {
        if (isSuccess) {
          setIsSuccess(true);
          setAvatar(data.avatar);
          setUsername(data.username);
          originalAvatar = data.avatar;
          originalUsername = data.username;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const updateAllData = async (data) => {
    console.log(data);
    console.log(userId);
    try {
      const rankResponse = rankApi.getRankById(userId);
      const noteRankResponse = noteRankApi.getNoteRankById(userId);
      const quizRankResponse = quizRankApi.getQuizRankById(userId);
      const quizResponse = quizApi.getQuizzes("all", userId);
      const noteResponse = noteApi.getNotesByUserId(userId);
      const courseResponse = courseApi.getCoursesByUserId(userId);
      const [
        rankData,
        noteRankData,
        quizRankData,
        quizData,
        noteData,
        courseData,
      ] = await Promise.all([
        rankResponse,
        noteRankResponse,
        quizRankResponse,
        quizResponse,
        noteResponse,
        courseResponse,
      ]);
      if (data.username) {
        if (rankData.isSuccess && rankData.data.length !== 0) {
          console.log(rankData.data);
          rankApi.updateRank({ username: data.username }, rankData.data[0].id);
        }
        if (noteRankData.isSuccess && noteRankData.data.length !== 0) {
          noteRankApi.updateNoteRank(
            { username: data.username },
            noteRankData.data[0].id
          );
        }

        if (quizRankData.isSuccess && quizRankData.data.length !== 0) {
          quizRankApi.updateQuizRank(
            { username: data.username },
            quizRankData.data[0].id
          );
        }

        if (quizData.isSuccess && quizData.data.length !== 0) {
          for (const item of quizData.data) {
            quizApi.updateQuiz({ author: data.username }, item.id);
          }
        }

        if (noteData.isSuccess && noteData.data.length !== 0) {
          for (const item of noteData.data) {
            noteApi.updateNote({ author: data.username }, item.id);
          }
        }
      }
      if(data.avatar){
        if (avatarId !== 0) {
          console.log("delete");
          assetApi.deleteAsset(avatarId);
        }
      }
      if (courseData.isSuccess && courseData.data.length !== 0) {
        courseApi.updateCourse(
          {
            author: data.username || courseData.data[0].username,
            avatar: data.avatar || courseData.data[0].avatar,
          },
          courseData.data[0].id
        );
      }
    } catch (err) {
      console.log(err);
    }
    return true;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleOldPasswordChange = (event) => {
    setOldPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };
  const handleUserNameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleUpdateSuccess = (data) => {
    let userData = data;
    userData.role = data.role.type;
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoading(false);
    window.location.reload()
  };
  const updateLocalStorage = async (updateData, data) => {
    const isFinish = await updateAllData(updateData);
    if (isFinish) {
      handleUpdateSuccess(data);
    }
  };
  const updateUserInfo = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    let isSameData = true;
    let updateData = {};
    if (username.trim() !== "" && username !== originalUsername) {
      updateData.username = username;
      isSameData = false;
    }
    if (
      avatar?.url &&
      (!originalAvatar?.url || avatar?.url !== originalAvatar?.url)
    ) {
      updateData.avatar = avatar;
      isSameData = false;
    }
    if (Object.keys(updateData).length > 0 && !isSameData) {
      userApi
        .updateUser(updateData, userId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            if (!newPassword || !confirmPassword) {
              updateLocalStorage(updateData, data);
            }
          } else {
            alert(response.error);
          }
        })
        .catch((error) => {
          setWarnInfo(error);
          setIsLoading(false);
        });
    }
    if (newPassword && confirmPassword) {
      if (newPassword === confirmPassword) {
        authApi
          .changePassword({
            currentPassword: oldPassword,
            password: newPassword,
            passwordConfirmation: confirmPassword,
          })
          .then((response) => {
            const { data, isSuccess } = response;
            if (isSuccess) {
              let userData = data;
              userData.role = data.role.type;
              localStorage.setItem("user", JSON.stringify(userData));
              setConfirmPassword("");
              setOldPassword("");
              setNewPassword("");
              setWarnInfo("");
              setIsLoading(false);
            }
          })
          .catch((error) => {
            setWarnInfo(error);
            setIsLoading(false);
          });
      } else {
        setWarnInfo("New password and confirm password do not match!");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    if (!isLoading) {
      fetchUser();
    }
  };
  const logoutFn = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("token");
    window.location.reload();
  };
  return (
    <>
      {isSuccess ? (
        <div className={classes.InfoContainer}>
          <label htmlFor="avatar" className={classes.ImgContainer}>
            {(isImageLoading || isLoading) ? <div className={classes.Loading}>loading...</div> :
            <img
              className={classes.Img}
              src={
                avatar?.url
                  ? avatar?.url
                  : "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg"
              }
              alt="user image"
            />
            }
          </label>
          <input
            type="file"
            id="avatar"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <p className={classes.WarnInfo}>{warnInfo.toString()}</p>
          <div className={classes.InputField}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUserNameChange}
            />
          </div>
          <div className={classes.InputField}>
            <label htmlFor="oldPassword">Old Password:</label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={handleOldPasswordChange}
            />
          </div>
          <div className={classes.InputField}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </div>
          <div className={classes.InputField}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
          </div>
          <div className={classes.BtnContainer}>
            <button onClick={updateUserInfo}>
              {isLoading ? "Loading..." : "Update"}
            </button>
            <button onClick={logoutFn}>logout</button>
          </div>
        </div>
      ) : (
        <>Loading...</>
      )}
    </>
  );
};

export default Info;
