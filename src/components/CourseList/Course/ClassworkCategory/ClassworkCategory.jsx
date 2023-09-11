import { useState, useEffect } from "react";
import classes from "./ClassworkCategory.module.css";
import { Link, useParams } from "react-router-dom";
import assignmentApi from "../../../../store/api/assignmentApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileVideo,
  faFileAudio,
  faFileArchive,
  faTrash,
  faEdit,
  faChevronDown,
  faExpand,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import FileUploader from "../../../UI/FileUploader/FileUploader";
import { userApi } from "../../../../store/api/userApi";
import assetApi from "../../../../store/api/assetApi";
let userId = JSON.parse(localStorage.getItem("user"))?.id;
let username = JSON.parse(localStorage.getItem("user"))?.username;
const ClassworkCategory = () => {
  const [assignmentsData, setAssignmentsData] = useState({});
  const [isSuccess, setIsSuccess] = useState({});
  const [descriptions, setDescriptions] = useState([]);
  const [authorId, setAuthorId] = useState("");
  const [isShowFileUploader, setIsShowFileUploader] = useState(
    new Array(assignmentsData.assignments?.data.length).fill(false)
  );
  const [otherPersonSubmission, setOtherPersonSubmission] = useState({});
  const [mySubmission, setMySubmission] = useState({});
  const [userIdArr, setUserIdArr] = useState([]);
  const [usernameArr, setUsernameArr] = useState([]);
  const [isUsernameArrSuccess, setIsUsernameArrSuccess] = useState(false);
  const [isShowUserList, setIsShowUserList] = useState(
    new Array(assignmentsData.assignments?.data.length).fill(false)
  );
  const [isShowUserAssignment, setIsShowUserAssignment] = useState(
    new Array(assignmentsData.assignments?.data.length).fill(false)
  );
  const [showAssignmentByUserId, setShowAssignmentByUserId] = useState(null);
  const [previousAssignmentIndex, setPreviousAssignmentIndex] = useState(null);
  const params = useParams();
  useEffect(() => {
    getAssignments();
  }, [params.id]);
  useEffect(() => {
    // 初始化 showDescriptions 数组，长度与 assignmentsData.assignments.data 相同
    setDescriptions(
      Array(assignmentsData?.assignments?.data.length).fill(false)
    );
  }, [assignmentsData]);
  const getAssignments = () => {
    setIsUsernameArrSuccess(false);
    assignmentApi
      .getAssignmentsById(params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          let tempUserIdArr = [];
          tempUserIdArr = data.attributes.students;
          setUserIdArr(tempUserIdArr);
          if (data.attributes.authorId == userId) {
            let newUsernameArr = [];
            if (data.attributes?.students) {
              for (const item of data.attributes.students) {
                userApi.getUserById(item).then((response) => {
                  const { isSuccess, data } = response;
                  if (isSuccess) {
                    newUsernameArr.push(data.username);

                    setUsernameArr(newUsernameArr);
                    if (tempUserIdArr.length == newUsernameArr.length) {
                      setIsUsernameArrSuccess(true);
                    }
                  }
                });
              }
            }
          }
          setAssignmentsData(data.attributes);
          setAuthorId(data.attributes.authorId);
          if (data.attributes.assignments.data.length > 0) {
            const newSubmission = data.attributes.assignments.data.map(
              (item) => {
                let submissionForUser = null;
                if (item.attributes.submission) {
                  submissionForUser = item.attributes.submission[userId]
                    ? item.attributes.submission[userId]
                    : null;
                  console.log(item.attributes.submission);
                  console.log(submissionForUser);
                  console.log(item.attributes.submission[userId]);
                }
                return {
                  id: item.id,
                  submission: {
                    [userId]:
                      submissionForUser !== null ? submissionForUser : null,
                  },
                };
              }
            );
            setMySubmission(newSubmission);
          }
          if (data.attributes.authorId == userId) {
            if (data.attributes.assignments.data.length > 0) {
              const allSubmission = data.attributes.assignments.data.map(
                (item) => ({
                  id: item.id,
                  submission: item.attributes.submission,
                })
              );

              // 删除item.attributes.submission[userId]
              allSubmission.forEach((item) => {
                if (item.submission && item.submission[userId] !== undefined) {
                  delete item.submission[userId];
                }
              });
              // setSubmittedUserIdArr(allSubmission)

              setOtherPersonSubmission(allSubmission);
              console.log(allSubmission);
            }
          }

          setIsSuccess(true);
        } else {
          console.error("Error:", response.error);
          setAssignmentsData({});
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const getIconByMime = (mime) => {
    switch (mime) {
      case "application/pdf":
        return faFilePdf;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/vnd.oasis.opendocument.text":
      case "application/rtf":
      case "text/plain":
        return faFileWord;
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.oasis.opendocument.spreadsheet":
      case "text/csv":
        return faFileExcel;
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.oasis.opendocument.presentation":
      case "application/vnd.ms-powerpoint.addin.macroEnabled.12":
      case "application/vnd.ms-powerpoint.presentation.macroEnabled.12":
      case "application/vnd.ms-powerpoint.slideshow.macroEnabled.12":
        return faFilePowerpoint;
      case "audio/mpeg":
      case "audio/x-m4a":
      case "audio/ogg":
      case "audio/wav":
        return faFileAudio;
      case "video/mp4":
      case "video/quicktime":
      case "video/x-msvideo":
      case "video/x-flv":
      case "video/webm":
        return faFileVideo;
      case "application/zip":
      case "application/x-rar-compressed":
      case "application/x-7z-compressed":
        return faFileArchive;
      default:
        return faFile;
    }
  };
  const deleteClasswork = async (id, asset) => {
    let deleteAssetResponse;
    if (asset.length) {
      for (const item of asset) {
        deleteAssetResponse = await assetApi.deleteAsset(item.id);
      }
    }
    console.log(asset);
    if (asset.length == 0 || deleteAssetResponse?.isSuccess) {
      assignmentApi
        .delAssignment(id)
        .then((response) => {
          const { isSuccess } = response;
          if (isSuccess) {
            getAssignments();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  const showFileUploaderFn = (index) => {
    setIsShowFileUploader((prevState) => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };
  const hideFileUploaderFn = (index) => {
    setIsShowFileUploader((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };
  const getFilesInfo = (files, assignmentId, index) => {
    if (mySubmission[index].submission[userId] !== null) {
      mySubmission[index].submission[userId].homework = files;
    } else {
      mySubmission[index].submission = {
        [userId]: {
          username,
          score:0,
          homework: files,
        },
      };
    }
    let tempAllSubmission = [];
    assignmentApi
      .getAssignmentsById(params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data.attributes.assignments.data.length > 0) {
            tempAllSubmission = data.attributes.assignments.data.map(
              (item) => ({
                id: item.id,
                submission: item.attributes.submission,
              })
            );
            console.log(tempAllSubmission);

            // 删除item.attributes.submission[userId]
            tempAllSubmission.forEach((item) => {
              if (item.submission && item.submission[userId] !== undefined) {
                delete item.submission[userId];
              }
            });
            console.log(tempAllSubmission);
            let tempSubmission = {
              ...tempAllSubmission[index].submission,
              ...mySubmission[index].submission,
            };
            assignmentApi
              .updateAssignment(
                {
                  submission: tempSubmission,
                },
                assignmentId
              )
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log(data);
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const showUserListFn = (index) => {
    setIsShowUserList((prevState) => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };
  const hideUserListFn = (index) => {
    setIsShowUserList((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };
  const showUserAssignmentFn = (assignmentsIndex, id) => {
    if(previousAssignmentIndex!==null){
      setIsShowUserAssignment((prevState) => {
        const newState = [...prevState];
        newState[previousAssignmentIndex] = false;
        return newState;
      });
    }
    if (
      otherPersonSubmission[assignmentsIndex].submission &&
      otherPersonSubmission[assignmentsIndex].submission[id]
    ) {
      setShowAssignmentByUserId(id);
      setPreviousAssignmentIndex(assignmentsIndex)
      setIsShowUserAssignment((prevState) => {
        const newState = [...prevState];
        newState[assignmentsIndex] = true;
        return newState;
      });
    }
  };
  const hideUserAssignmentFn = () => {

    if (showAssignmentByUserId) {
      setIsShowUserAssignment((prevState) => {
        const newState = [...prevState];
        newState[previousAssignmentIndex] = false;
        return newState;
      });
    }
    setShowAssignmentByUserId(0);
  };
  const handleMarkFn = (assignmentsId, index, e) => {
    let tempAllSubmission = [];
    assignmentApi
      .getAssignmentsById(params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data.attributes.assignments.data.length > 0) {
            tempAllSubmission = data.attributes.assignments.data.map(
              (item) => ({
                id: item.id,
                submission: item.attributes.submission,
              })
            );
            let tempMySubmission=[]
            // 删除item.attributes.submission[userId]
            tempAllSubmission.forEach((item) => {
              if (item.submission && item.submission[showAssignmentByUserId] !== undefined) {
                tempMySubmission={
                  [showAssignmentByUserId]:{
                    ...item.submission[showAssignmentByUserId],
                    score:e.target.value+"",
                  }
                }
                delete item.submission[showAssignmentByUserId];
              }
            });
            console.log(tempMySubmission)
            let tempSubmission = {
              ...tempAllSubmission[index].submission,
              ...tempMySubmission,
            };
            assignmentApi
              .updateAssignment(
                {
                  submission: tempSubmission,
                },
                assignmentsId
              )
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log(data);
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <>
      {isSuccess ? (
        assignmentsData.assignments?.data.length !== 0 ? (
          assignmentsData.assignments?.data.map(
            (assignmentsItem, assignmentsIndex) => (
              <div
                className={classes.ClassworkContainer}
                key={assignmentsIndex}
              >
                <div className={classes.TopBox}>
                  {isShowUserList[assignmentsIndex] && (
                    <div className={classes.UserIdTableContainer}>
                      <table
                        className={classes.UserIdTable}
                        onMouseLeave={() => {
                          hideUserListFn(assignmentsIndex);
                        }}
                      >
                        <tbody>
                          {userIdArr &&
                            userIdArr.map((item, index) => {
                              let tempSubmissionItem = [];
                              if (
                                otherPersonSubmission[assignmentsIndex]
                                  ?.submission &&
                                otherPersonSubmission[assignmentsIndex]
                                  ?.submission[item]
                              ) {
                                tempSubmissionItem =
                                  otherPersonSubmission[assignmentsIndex]
                                    ?.submission[item];
                              }
                              const tempIsUsernameMatch =
                                tempSubmissionItem?.username ===
                                usernameArr[index];
                              return (
                                <tr
                                  key={index}
                                  className={classes.UserIdTableItem}
                                >
                                  {isUsernameArrSuccess && (
                                    <>
                                      <td className={classes.UsernameIndex}>
                                        {index + 1}
                                      </td>
                                      <td
                                        onClick={() =>
                                          showUserAssignmentFn(
                                            assignmentsIndex,
                                            item
                                          )
                                        }
                                        className={`${classes.Username} ${
                                          tempIsUsernameMatch
                                            ? ""
                                            : classes.RedText
                                        }`}
                                      >
                                        {usernameArr[index]}
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <h2 className={classes.ClassworkTitle}>
                    {assignmentsItem.attributes.title}
                  </h2>
                  {authorId == userId ? (
                    <div className={classes.IconContainer}>
                      <div
                        className={classes.SubmissionCount}
                        onClick={() => {
                          if (userIdArr.length > 0) {
                            showUserListFn(assignmentsIndex);
                          }
                        }}
                      >
                        {otherPersonSubmission[assignmentsIndex]?.submission
                          ? Object.keys(
                              otherPersonSubmission[assignmentsIndex]
                                ?.submission
                            ).length
                          : 0}
                        /{userIdArr ? userIdArr.length : 0}
                      </div>
                      <FontAwesomeIcon
                        classes={classes.FaIcon}
                        onClick={() => hideUserAssignmentFn()}
                        icon={faHome}
                      />
                      <Link to={`/courses/${params.id}/publish/classwork/${assignmentsItem.id}`}>
                      <FontAwesomeIcon
                        className={classes.FaIcon}
                        icon={faEdit}
                      />
                      </Link>
                      <FontAwesomeIcon
                        className={classes.FaIcon}
                        onClick={() =>
                          deleteClasswork(
                            assignmentsItem.id,
                            assignmentsItem.attributes.asset
                          )
                        }
                        icon={faTrash}
                      />
                    </div>
                  ) : (
                    
                      <div className={classes.FlexBox}>
                        <div className={classes.ScoreContainer}>Score:{mySubmission[assignmentsIndex]?.submission?.[
                                  userId
                                ]?.score}</div>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={classes.FaIcon}
                          onClick={() => showFileUploaderFn(assignmentsIndex)}
                        />
                        {isShowFileUploader[assignmentsIndex] == true && (
                          <div
                            className={classes.FileUploaderContainer}
                            onMouseLeave={() =>
                              hideFileUploaderFn(assignmentsIndex)
                            }
                          >
                            <FileUploader
                              type="small"
                              // isPublish={false}
                              getFilesInfo={getFilesInfo}
                              data={
                                mySubmission[assignmentsIndex]?.submission?.[
                                  userId
                                ]?.homework || null
                              }
                              assignmentId={mySubmission[assignmentsIndex].id}
                              index={assignmentsIndex}
                            />
                          </div>
                        )}
                      </div>
                    
                  )}
                </div>
                <div className={classes.BottomBox}>
                  {isShowUserAssignment[assignmentsIndex] ? (
                  <div className={classes.ScoreInputContainer}>Score:<input type="number" onKeyUp={(e)=>handleMarkFn(assignmentsItem.id,assignmentsIndex,e)}/></div>
                  
                  ) : (
                    <>
                      {assignmentsItem.attributes.description && (
                        <p
                          className={
                            descriptions[assignmentsIndex]
                              ? classes.SmallDescription
                              : classes.BigDescription
                          }
                        >
                          {assignmentsItem.attributes.description}
                        </p>
                      )}
                      {assignmentsItem.attributes.description &&
                        assignmentsItem.attributes.description.length > 100 && (
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={classes.FaChevronDownIcon}
                            onClick={() =>
                              setDescriptions((prevState) => {
                                const newShowDescriptions = [...prevState];
                                newShowDescriptions[assignmentsIndex] =
                                  !newShowDescriptions[assignmentsIndex];
                                return newShowDescriptions;
                              })
                            }
                          />
                        )}
                    </>
                  )}

                  {assignmentsItem?.attributes?.asset !== undefined && (
                    <div className={classes.AssetsContainer}>
                      {isShowUserAssignment[assignmentsIndex]
                        ? otherPersonSubmission &&
                          otherPersonSubmission[assignmentsIndex].submission[
                            showAssignmentByUserId
                          ].homework.map((item, index) => {
                            let content;
                            if (item.mime.startsWith("image/")) {
                              content = (
                                <div
                                  className={classes.ClassworkImg}
                                  key={index}
                                >
                                  <Link
                                    to={`http://localhost:1337${item.url}`}
                                    target="_blank"
                                  >
                                  <img
                                    src={`http://localhost:1337${item.url}`}
                                    alt="Classwork Image"
                                  />
                                  </Link>
                                </div>
                              );
                            } else {
                              content = (
                                <div
                                  className={classes.ClassworkFile}
                                  key={index}
                                >
                                  <Link to={`http://localhost:1337${item.url}`}>
                                  <FontAwesomeIcon
                                    icon={getIconByMime(item.mime)}
                                    className={classes.FileIcon}
                                  />
                                  <p className={classes.Title}>{item.name}</p>
                                  </Link>
                                </div>
                              );
                            }
                            return content;
                          })
                        : assignmentsItem.attributes.asset.map(
                            (item, index) => {
                              let content;
                              if (item.mime.startsWith("image/")) {
                                content = (
                                  <div
                                    className={classes.ClassworkImg}
                                    key={index}
                                  >
                                    <img
                                      src={`http://localhost:1337${item.url}`}
                                      alt="Classwork Image"
                                    />

                                    <Link
                                      to={`http://localhost:1337${item.url}`}
                                      target="_blank"
                                    >
                                      <FontAwesomeIcon
                                        icon={faExpand}
                                        className={classes.ExpandBtn}
                                      />
                                    </Link>
                                  </div>
                                );
                              } else {
                                content = (
                                  <div
                                    className={classes.ClassworkFile}
                                    key={index}
                                  >
                                    <Link 
                                      to={`http://localhost:1337${item.url}`}
                                    >
                                      <FontAwesomeIcon
                                        icon={getIconByMime(item.mime)}
                                        className={classes.FileIcon}
                                      />

                                      <p className={classes.Title}>
                                        {item.name}
                                      </p>
                                    </Link>
                                  </div>
                                );
                              }
                              return content;
                            }
                          )}
                    </div>
                  )}
                </div>
              </div>
            )
          )
        ) : (
          <div className={classes.NotResourse}>
            You can make your courses and give out assignments using the publish
            button.
          </div>
        )
      ) : (
        <>loading...</>
      )}
    </>
  );
};

export default ClassworkCategory;
