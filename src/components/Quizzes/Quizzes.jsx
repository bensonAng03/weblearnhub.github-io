import { useEffect } from "react";
import { useState } from "react";
import { quizApi } from "../../store/api/quizApi";
import classes from "./Quizzes.module.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faEllipsisV,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import IssuanceApplicationForm from "../UI/IssuanceApplicationForm/IssuanceApplicationForm";
import { applyApi } from "../../store/api/applyApi";
import UpdateItemForm from "../UI/UpdateItemForm/UpdateItemForm";
let userId=JSON.parse(localStorage.getItem("user"))?.id;
const Quizzes = () => {
  const [quizzes, setQuizzes] = useState({});
  const [isAddQuiz, setIsAddQuiz] = useState(false);
  const [editContainers, setEditContainers] = useState({});
  const [isDeleteQuiz, setIsDeleteQuiz] = useState(false);
  const [applyId, setApplyId] = useState("");
  const [toggleCourseType, setToggleCourseType] = useState(false);
  const [courseType, setCourseType] = useState("publishQuizzes");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchQuizzes(courseType);
  }, [courseType]);
  const fetchQuizzes = (type) => {
    setIsLoading(true);
    quizApi
      .getQuizzes(type)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setQuizzes(data);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };
  const toggleQuizFn = () => {
    setIsAddQuiz((prevIsAddQuiz) => !prevIsAddQuiz);
  };
  const deleteQuizFn = (quizId, status = "") => {
    if (status == "not_reviewed" || status == "rejected") {
      quizApi
        .delQuiz(quizId)
        .then((response) => {
          const {isSuccess } = response;
          if (isSuccess) {
            fetchQuizzes(courseType);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (status == "approved") {
      setIsDeleteQuiz(true);
      setApplyId(quizId);
    } else if (status == "") {
      setIsDeleteQuiz(!isDeleteQuiz);
    }
  };
  const publishQuizFn = (quizId, status) => {
    if (status == "not_reviewed" || status == "rejected") {
      applyApi
        .addApply({
          type: "approveQuiz",
          content: "",
          price: 0,
          choice: null,
          itemId: quizId,
          authorId:userId
        })
        .then((response) => {
          const {isSuccess } = response;
          if (isSuccess) {
            quizApi
              .updateQuiz({ status: "pending" }, quizId)
              .then((response) => {
                const { isSuccess } = response;
                if (isSuccess) {
                  fetchQuizzes(courseType);
                }
              });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  const handleMouseLeave = (quizId) => {
    setEditContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [quizId]: false,
    }));
  };
  const toggleEditContainer = (quizId) => {
    setEditContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [quizId]: !prevEditContainers[quizId],
    }));
  };
  const formatStatus = (status) => {
    let result = "";
    if (status !== "not_reviewed") {
      result = status.charAt(0).toUpperCase() + status.slice(1);
    } else {
      result = "Not Reviewed";
    }
    return result;
  };
  return (
    <>
      {!isLoading ? (
        <div className={classes.Quizzes}>
          {isAddQuiz && (
            <UpdateItemForm
              type="Quiz"
              update={false}
              toggleFn={toggleQuizFn}
              fetchFn={fetchQuizzes}
            />
          )}
          {isDeleteQuiz && (
            <IssuanceApplicationForm
              itemId={applyId}
              type={"deleteQuiz"}
              closeFn={deleteQuizFn}
              fetchFn={fetchQuizzes}
            />
          )}
          <FontAwesomeIcon
            icon={faPlus}
            className={classes.AddBtn}
            onClick={toggleQuizFn}
          />
            <FontAwesomeIcon
              icon={faBars}
              className={classes.BarBtn}
              onClick={() => setToggleCourseType(!toggleCourseType)}/>
            <ul
              className={` ${classes.QuizTypeList} ${
                toggleCourseType ? classes.ShowClass : ""
              }`}
              onMouseLeave={() => setToggleCourseType(false)}
            >
              <li onClick={() => setCourseType("publishQuizzes")}>
                Approved Quizzes
              </li>
              <li onClick={() => setCourseType("customQuizzes")}>
                Custom Quizzes
              </li>
            </ul>
          {Object.keys(quizzes).length > 0 ? (
            <ul className={classes.QuizzesList}>
              {Object.keys(quizzes).map((id) => {
                const quiz = quizzes[id];
                return (
                  <li className={classes.Quiz} key={id}>
                    <Link to={`/quizzes/${quiz.id}/quiz/${quiz.attributes.authorId}`}>
                      <div className={classes.QuizInfo}>
                        {quiz.attributes.authorId == userId && (
                          <div className={classes.StatusBox}>
                            {formatStatus(quiz.attributes.status)}
                          </div>
                        )}
                        <p className={classes.Title}>{quiz.attributes.title}</p>
                        <p className={classes.TchName}>
                          {quiz.attributes.author}
                        </p>
                      </div>
                    </Link>
                    {quiz.attributes.authorId == userId &&
                      (quiz.attributes.status !== "approved" ? (
                        <>
                          <FontAwesomeIcon
                            icon={faEllipsisV}
                            className={classes.ManageBtn}
                            onClick={() => toggleEditContainer(quiz.id)}
                          />
                          <ul
                            className={`${classes.ManageContainer} ${
                              editContainers[quiz.id] ? classes.ShowClass : ""
                            }`}
                            onMouseLeave={() => handleMouseLeave(quiz.id)}
                          >
                            {quiz.attributes.status !=="pending" &&
                            <li
                              onClick={() => {
                                publishQuizFn(quiz.id, quiz.attributes.status);
                              }}
                            >
                              Publish
                            </li>
                            }

                            <li
                              onClick={() => {
                                navigate(`/quizzes/${quiz.id}/create-quiz`);
                              }}
                            >
                              Edit
                            </li>
                            <li
                              onClick={() => {
                                deleteQuizFn(quiz.id, quiz.attributes.status);
                              }}
                            >
                              Delete
                            </li>
                          </ul>
                        </>
                      ) : (
                        <FontAwesomeIcon
                          icon={faTrash}
                          className={classes.DeleteBtn}
                          onClick={() => {
                            deleteQuizFn(quiz.id, quiz.attributes.status);
                          }}
                        />
                      ))}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>Not Found</div>
          )}
        </div>
      ) : (
        <>loading...</>
      )}
    </>
  );
};

export default Quizzes;
