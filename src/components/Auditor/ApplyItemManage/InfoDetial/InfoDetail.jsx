import React, { useEffect, useState } from "react";
import classes from "./InfoDetail.module.css";
import { topicApi } from "../../../../store/api/topicApi";
import { assignmentApi } from "../../../../store/api/assignmentApi";
import { quizApi } from "../../../../store/api/quizApi";
import { noteApi } from "../../../../store/api/noteApi";
import Backdrop from "../../../UI/Backdrop/Backdrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faFile,
  faFileArchive,
  faFileAudio,
  faFileExcel,
  faFilePdf,
  faFilePowerpoint,
  faFileVideo,
  faFileWord,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { questionApi } from "../../../../store/api/questionApi";

const InfoDetail = ({ type, id, content, closeFn }) => {
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [item, setItem] = useState([]);
  const [itemType, setItemType] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [courseType, setCourseType] = useState("topic");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    console.log(type);
    switch (type) {
      case "deleteCourse":
      case "changeCoursePrice":
      case "reportCourse":
      case "approveCourse":
        setItemType("course");
        topicApi
          .getTopicsById(id)
          .then((response) => {
            if (response.isSuccess) {
              setItem(response.data);
              console.log(response.data);
              console.log();
              if (response.data.attributes.topics.data.length != 0) {
                console.log("has topic");
                console.log(response.data.attributes.topics.data);
                setTopicsData(response.data.attributes.topics.data);
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
        assignmentApi
          .getAssignmentsById(id)
          .then((response) => {
            if (response.isSuccess) {
              if (response.data.attributes.assignments.data.length != 0) {
                console.log("has assignment");
                setAssignmentsData(response.data.attributes.assignments.data);
              }
              setIsSuccess(true);
              setIsLoading(false);
            }
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
        break;
      case "approveQuiz":
      case "deleteQuiz":
        setItemType("quiz");
        questionApi
          .getQuestionsById(id)
          .then((response) => {
            if (response.isSuccess) {
              console.log(response.data);
              setItem(response.data);
              if (
                response.data.attributes.questions &&
                response.data.attributes.questions.data.length !== 0
              ) {
                setQuestionsData(response.data.attributes.questions.data);
              }
              setIsSuccess(true);
              setIsLoading(false);
            }
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
        break;
      case "reportNote":
        setItemType("note");
        noteApi
          .getNoteById(id)
          .then((response) => {
            if (response.isSuccess) {
              console.log(response.data);
              setIsSuccess(true);
              setIsLoading(false);
            }
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
        break;
      default:
        break;
    }
  }, []);
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
  const toggleCourseType = () => {
    if (courseType == "topic") {
      setCourseType("assignment");
    } else {
      setCourseType("topic");
    }
  };
  const closeInfoDetailFn = () => {
    setAssignmentsData([]);
    setTopicsData([]);
    setItem([]);
    setDescriptions("");
    setCourseType("topic");
    setIsLoading(false);
    setIsSuccess(false);
    closeFn();
  };
  const course = (
      courseType == "topic" ? (
        topicsData && topicsData.length > 0 ? (
          topicsData.map((topicItem, topicIndex) => (
            <li key={topicIndex}>
              <p>{topicItem.attributes.title}</p>
              <p
                className={
                  descriptions[topicIndex]
                    ? classes.SmallDescription
                    : classes.BigDescription
                }
              >
                {topicItem.attributes.description}
              </p>
              {topicItem.attributes.description &&
                topicItem.attributes.description.length > 100 && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={classes.FaChevronDownIcon}
                    onClick={() =>
                      setDescriptions((prevState) => {
                        const newShowDescriptions = [...prevState];
                        newShowDescriptions[topicIndex] =
                          !newShowDescriptions[topicIndex];
                        return newShowDescriptions;
                      })
                    }
                  />
                )}
              <div className={classes.AssetsContainer}>
                {topicItem.attributes.asset &&
                  topicItem.attributes.asset.map((item, index) => {
                    let content;
                    if (item.mime.startsWith("image/")) {
                      content = (
                        <div className={classes.ItemImg} key={index}>
                          <Link to={item.url} target="_blank">
                            <img src={item.url} alt="Topic Image" />
                          </Link>
                        </div>
                      );
                    } else {
                      content = (
                        <div className={classes.ItemFile} key={index}>
                          <Link to={item.url}>
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
                  })}
              </div>
            </li>
          ))
        ) : (
          <p>Not found</p>
        )
      ) : assignmentsData && assignmentsData.length > 0 ? (
        assignmentsData.map((assignmentItem, assignmentIndex) => (
          <li key={assignmentIndex}>
            {console.log("assignment")}
            <p>{assignmentItem.attributes.title}</p>
            <p
              className={
                descriptions[assignmentIndex]
                  ? classes.SmallDescription
                  : classes.BigDescription
              }
            >
              {assignmentItem.description}
            </p>
            {assignmentItem.attributes.description &&
              assignmentItem.attributes.description.length > 100 && (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={classes.FaChevronDownIcon}
                  onClick={() =>
                    setDescriptions((prevState) => {
                      const newShowDescriptions = [...prevState];
                      newShowDescriptions[assignmentIndex] =
                        !newShowDescriptions[assignmentIndex];
                      return newShowDescriptions;
                    })
                  }
                />
              )}
            <div className={classes.AssetsContainer}>
              {assignmentItem.attributes.asset &&
                assignmentItem.attributes.asset.map((item, index) => {
                  let content;
                  if (item.mime.startsWith("image/")) {
                    content = (
                      <div className={classes.ItemImg} key={index}>
                        <Link to={item.url} target="_blank">
                          <img src={item.url} alt="Assignment Image" />
                        </Link>
                      </div>
                    );
                  } else {
                    content = (
                      <div className={classes.ItemFile} key={index}>
                        <Link to={item.url}>
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
                })}
            </div>
          </li>
        ))
      ) : (
        <p>Not found</p>
      )
    )
const quiz = (
  questionsData && questionsData.length > 0 ? (
    <ul> {/* Use a parent container like <ul> or <ol> */}
      {questionsData.map((questionItem, questionIndex) => (
        <li key={questionIndex}>
          <p>{questionItem.attributes.title}</p>
          {console.log(questionItem.attributes)}
          <ul> {/* Wrap nested <li> elements in a parent <ul> */}
            {questionItem.attributes.choices.data.map((item, index) => (
              <li
                key={index}
                className={`${classes.ChoiceItem} ${
                  questionItem.attributes.answers.data.includes(item)
                    ? classes.SelectedChoice
                    : ""
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  ) : (
    <p>Not Found</p>
  )
);
  return (
    <Backdrop>
      {isSuccess && !isLoading && item.length !== 0 && (
        <div className={classes.InfoDetail}>
          <div className={classes.InfoHeader}>
            <p>Title:{item.attributes.title}</p>
            {itemType == "course" && (
              <>
                <p>
                  Price:
                  {item.attributes.price != 0
                    ? `RM${item.attributes.price}`
                    : "Free"}
                </p>
                <p>
                  Sold:
                  {item.attributes.students
                    ? item.attributes.students.length
                    : 0}
                </p>
                <button
                  onClick={toggleCourseType}
                  className={classes.CourseTypeBtn}
                >
                  {courseType == "topic" ? "Topic" : "Assignment"}
                </button>
              </>
            )}
            <FontAwesomeIcon
              icon={faXmark}
              className={classes.CloseBtn}
              onClick={closeInfoDetailFn}
            />
          </div>
          <div className={classes.InfoContent}>
            <ul className={classes.InfoContentList}>
              {itemType == "course" && course}
              {itemType == "quiz" && quiz}
            </ul>
          </div>
        </div>
      )}
    </Backdrop>
  );
};

export default InfoDetail;
