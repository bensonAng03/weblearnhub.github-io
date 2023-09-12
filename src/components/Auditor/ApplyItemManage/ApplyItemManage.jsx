import { useEffect, useRef, useState } from "react";
import { applyApi } from "../../../store/api/applyApi";
import classes from "./ApplyItemManage.module.css";
import { quizApi } from "../../../store/api/quizApi";
import { courseApi } from "../../../store/api/courseApi";
import EditDetail from "./EditDetail/EditDetail";
import { userApi } from "../../../store/api/userApi";
import { reportApi } from "../../../store/api/reportApi";
import { responseApi } from "../../../store/api/responseApi";
import { noteRankApi } from "../../../store/api/noteRankApi";
import { rankApi } from "../../../store/api/rankApi";
import { quizRankApi } from "../../../store/api/quizRankApi";

const ApplyItemManage = ({ type }) => {
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const inputRef = useRef(null);
  const fetchApplyItem = () => {
    setIsSuccess(false);
    applyApi
      .getAppliesByType(type)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          console.log(data);
          setData(data);
          setIsSuccess(true);
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    fetchApplyItem();
  }, [type]);
  const deleteApply = (id) => {
    applyApi
      .delApply(id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          fetchApplyItem();
          setIsUpdateSuccess(false);
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const acceptFn = (
    applyId,
    id,
    price = 0,
    content = "",
    authorId = 0,
    choice = [],
    point = 0
  ) => {
    if (!isUpdateSuccess) {
      setIsUpdateSuccess(true);
      let updateContent = "";
      let updateChoices = [];
      switch (type) {
        case "approveCourse":
          courseApi
            .updateCourse({ status: "approved", price }, id)
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              } else {
                console.error("Error:", response.error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          break;
        case "changeCoursePrice":
          courseApi
            .updateCourse({ price }, id)
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              } else {
                console.error("Error:", response.error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          break;
        case "approveQuiz":
          if (inputRef.current.value > 0) {
            console.log("1232");
            quizApi
              .updateQuiz(
                {
                  score: inputRef.current.value,
                  status: "approved",
                },
                id
              )
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  fetchApplyItem();
                  deleteApply(applyId);
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
          break;
        case "deleteQuiz":
          quizApi
            .delQuiz(id)
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              } else {
                console.error("Error:", response.error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          break;
        case "deleteCourse":
          courseApi
            .delCourse(id)
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              } else {
                console.error("Error:", response.error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          break;
          if (content == "Recharge") {
            userApi
              .getUserById(authorId)
              .then((response) => {
                const { data, isSuccess } = response;
                let rechargePoint;
                console.log("223");
                if (isSuccess) {
                  switch (price) {
                    case 10:
                      rechargePoint = 8000;
                      break;
                    case 20:
                      rechargePoint = 16800;
                      break;
                    case 50:
                      rechargePoint = 43200;
                      break;
                    case 100:
                      rechargePoint = 88800;
                      break;
                    case 200:
                      rechargePoint = 182400;
                      break;
                    default:
                      break;
                  }
                  const updatedPoint = +data.point + rechargePoint;
                  userApi
                    .updateUser(
                      {
                        point: updatedPoint,
                      },
                      authorId
                    )
                    .then((response) => {
                      const { data, isSuccess } = response;
                      if (isSuccess) {
                        responseApi
                          .addResponse({
                            content: `You have successfully recharged with RM${price}, equivalent to ${point} points.`,
                            authorId,
                            type,
                          })
                          .then((response) => {
                            const { data, isSuccess } = response;
                            if (isSuccess) {
                              console.log(data);
                              fetchApplyItem();
                              deleteApply(applyId);
                            }
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      } else {
                        console.error("Error:", response.error);
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          } else if (content == "Purchase Course") {
            courseApi
              .getCourseById(id)
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  let updatedStudents;
                  if (data.attributes.students !== null) {
                    updatedStudents = [...data.attributes.students, authorId];
                  } else {
                    updatedStudents = [authorId];
                  }
                  courseApi
                    .updateCourse(
                      {
                        students: updatedStudents,
                      },
                      id
                    )
                    .then((response) => {
                      const { isSuccess } = response;
                      if (isSuccess) {
                        responseApi
                          .addResponse({
                            content: `utilizing RM${price} and deducting ${point} points.`,
                            authorId,
                            itemId: id,
                            type,
                          })
                          .then((response) => {
                            const { data, isSuccess } = response;
                            if (isSuccess) {
                              userApi.getUserById(authorId).then((response) => {
                                if (response.isSuccess) {
                                  const newPoint =
                                    +response.data.point - +point;
                                  userApi.updateUser(
                                    {
                                      point: newPoint,
                                    },
                                    authorId
                                  );
                                }
                              });
                            }
                          })
                          .catch((error) => {
                            console.log(error);
                          });

                        noteRankApi
                          .getNoteRankById(authorId)
                          .then((response) => {
                            const { isSuccess, data } = response;
                            if (isSuccess) {
                              if (data.length == 0) {
                                userApi
                                  .getUserById(authorId)
                                  .then((response) => {
                                    const { data, isSuccess } = response;
                                    if (isSuccess) {
                                      noteRankApi.addNoteRank({
                                        username: data.username,
                                        userId: authorId,
                                        score: 0,
                                      });
                                    }
                                  });
                              }
                            }
                          });
                        rankApi.getRankById(authorId).then((response) => {
                          const { isSuccess, data } = response;
                          if (isSuccess) {
                            if (data.length == 0) {
                              userApi.getUserById(authorId).then((response) => {
                                const { data, isSuccess } = response;
                                if (isSuccess) {
                                  rankApi.addRank({
                                    username: data.username,
                                    userId: authorId,
                                    score: 0,
                                  });
                                }
                              });
                            }
                          }
                        });
                        quizRankApi
                          .getQuizRankById(authorId)
                          .then((response) => {
                            const { isSuccess, data } = response;
                            if (isSuccess) {
                              if (data.length !== 0) {
                                userApi
                                  .getUserById(authorId)
                                  .then((response) => {
                                    const { data, isSuccess } = response;
                                    if (isSuccess) {
                                      quizRankApi.addQuizRank({
                                        username: data.username,
                                        userId: authorId,
                                        score: 0,
                                      });
                                      fetchApplyItem();
                                      deleteApply(applyId);
                                    }
                                  });
                              }
                            }
                          });
                      }
                    });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
          break;
        case "reportCourse":
        case "reportQuiz":
          if (content !== null) {
            updateContent = content;
          }
          if (choice !== null) {
            updateChoices = [...choice].join(",");
          }
          if (choice !== null) {
            updateContent += `\n${updateChoices}`;
          }
          reportApi
            .addReport({
              content: updateContent,
              authorId,
              itemId: id,
              type,
            })
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                console.log(data);
                fetchApplyItem();
                deleteApply(applyId);
              } else {
                console.error("Error:", response.error);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          break;
        default:
          break;
      }
    }
  };
  const toggleShowEditDetail = () => {
    console.log(isReject);
    setIsReject(!isReject);
  };
  const rejectFn = (id) => {
    deleteApply(id);
  };
  return (
    <div className={classes.ApplyItemManage}>
      {isSuccess ? (
        <>
          {data.length == 0 ? (
            <div>Resource Not Found</div>
          ) : (
            data.map((applyItem, index) => {
              return (
                <div key={index} className={classes.ApplyItem}>
                  {type === "updateReceipt" &&
                  applyItem.attributes.content === "Recharge" ? (
                    ""
                  ) : (
                    <p>
                      {type === "approveQuiz" || type === "deleteQuiz"
                        ? "Quiz"
                        : type === "reportNote"
                        ? "Note"
                        : "Course"}
                      Id:{applyItem.attributes.itemId}
                    </p>
                  )}
                  {type === "approveCourse" && (
                    <>
                      <p>Reason:{applyItem.attributes.content}</p>
                      <p>Price:{applyItem.attributes.price}</p>
                    </>
                  )}
                  {type === "approveQuiz" && (
                    <>
                      <label>
                        score:
                        <input ref={inputRef} type="number" />
                      </label>
                    </>
                  )}
                  {(type === "deleteCourse" || type === "deleteQuiz") && (
                    <p>Reason:{applyItem.attributes.content}</p>
                  )}
                  {(type === "reportCourse" || type === "reportNote") && (
                    <>
                      {applyItem.attributes.choice !== null && (
                        <>
                          <label className={classes.Title}>Choice:</label>
                          {applyItem.attributes.choice?.length > 1 ? (
                            applyItem.attributes.choice.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))
                          ) : (
                            <p>{applyItem.attributes.choice}</p>
                          )}
                        </>
                      )}
                      {applyItem.attributes.content !== "" && (
                        <p>Reason:{applyItem.attributes.content}</p>
                      )}
                    </>
                  )}
                  {type === "changeCoursePrice" && (
                    <>
                      <p>Reason:{applyItem.attributes.content}</p>
                      <p>Price:{applyItem.attributes.price}</p>
                    </>
                  )}
                  <div className={classes.ButtonContainer}>
                    <button
                      onClick={() =>
                        acceptFn(
                          applyItem.id,
                          applyItem.attributes.itemId,
                          applyItem.attributes.price,
                          applyItem.attributes.content,
                          applyItem.attributes.authorId,
                          applyItem.attributes.choice,
                          applyItem.attributes.point
                        )
                      }
                    >
                      Accept
                    </button>
                    <button onClick={toggleShowEditDetail}>Reject</button>
                    {isReject && (
                      <EditDetail
                        id={applyItem.id}
                        itemId={applyItem.attributes.itemId}
                        authorId={applyItem.attributes.authorId}
                        type={type}
                        rejectFn={rejectFn}
                        toggleFn={toggleShowEditDetail}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
};

export default ApplyItemManage;
