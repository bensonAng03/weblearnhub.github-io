import { useEffect, useRef, useState } from "react";
import { applyApi } from "../../../store/api/applyApi";
import classes from "./ApplyItemManage.module.css";
import { quizApi } from "../../../store/api/quizApi";
import { courseApi } from "../../../store/api/courseApi";
import EditDetail from "./EditDetail/EditDetail";
import { reportApi } from "../../../store/api/reportApi";
import InfoDetail from "./InfoDetail/InfoDetail";

const ApplyItemManage = ({ type }) => {
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [isShowInfoDetail, setIsShowInfoDetail] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const inputRef = useRef(null);
  const fetchApplyItem = () => {
    setIsSuccess(false);
    applyApi
      .getAppliesByType(type)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setData(data);
          setIsSuccess(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchApplyItem();
  }, [type]);
  const deleteApply = (id) => {
    applyApi
      .delApply(id)
      .then((response) => {
        const {isSuccess } = response;
        if (isSuccess) {
          fetchApplyItem();
          setIsUpdateSuccess(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const acceptFn = (
    applyId,
    id,
    price = 0,
    content = "",
    authorId = 0,
    choice = []
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
              const {isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          break;
        case "changeCoursePrice":
          courseApi
            .updateCourse({ price }, id)
            .then((response) => {
              const {isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          break;
        case "approveQuiz":
          if (inputRef.current.value > 0) {
            quizApi
              .updateQuiz(
                {
                  score: inputRef.current.value,
                  status: "approved",
                },
                id
              )
              .then((response) => {
                const {isSuccess } = response;
                if (isSuccess) {
                  fetchApplyItem();
                  deleteApply(applyId);
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
          break;
        case "deleteQuiz":
          quizApi
            .delQuiz(id)
            .then((response) => {
              const {isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          break;
        case "deleteCourse":
          courseApi
            .delCourse(id)
            .then((response) => {
              const {isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              }
            })
            .catch((error) => {
              console.error(error);
            });
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
              const {isSuccess } = response;
              if (isSuccess) {
                fetchApplyItem();
                deleteApply(applyId);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          break;
        default:
          break;
      }
    }
  };
  const toggleShowEditDetail = () => {
    setIsReject(!isReject);
  };
  const rejectFn = (id) => {
    deleteApply(id);
  };
  const toggleShowInfoDetail=(id)=>{
    setSelectedItemId(id)
    setIsShowInfoDetail(prevState=>!prevState)
  }
  return (
    <div className={classes.ApplyItemManage}>
      {isSuccess ? (
        <>
          {data.length == 0 ? (
            <div>Not Found</div>
          ) : (
            data.map((applyItem, index) => {
              return (
                <div key={index} className={classes.ApplyItem}>
                  {isShowInfoDetail && <InfoDetail type={type} id={selectedItemId} content={applyItem.attributes} closeFn={toggleShowInfoDetail}/>}
                  
                  <p onClick={()=>toggleShowInfoDetail(applyItem.attributes.itemId)} className={classes.ItemId}>
                    {type === "approveQuiz" || type === "deleteQuiz"
                      ? "Quiz"
                      : type === "reportNote"
                      ? "Note"
                      : "Course"}
                    Id:{applyItem.attributes.itemId}
                  </p>
                  
                  {type === "approveCourse" && (
                    <>
                      <p>Reason:{applyItem.attributes.content}</p>
                      <p>Price:{applyItem.attributes.price}</p>
                    </>
                  )}
                  {type === "approveQuiz" && (
                    <div className={classes.ScoreContainer}>
                      <label className={classes.Score}>
                        Score:
                        <input ref={inputRef} type="number" />
                      </label>
                    </div>
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
                          applyItem.attributes.choice
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
