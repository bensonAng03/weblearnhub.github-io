import { useState } from "react";
import classes from "./IssuanceApplicationForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { applyApi } from "../../../store/api/applyApi";
import Backdrop from "../Backdrop/Backdrop";
import { courseApi } from "../../../store/api/courseApi";
const userId = JSON.parse(localStorage.getItem("user"))?.id;
const IssuanceApplicationForm = ({
  itemId,
  type,
  closeFn,
  fetchFn = () => {},
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [outline, setOutline] = useState("");
  const [price, setPrice] = useState(0);
  const [deleteReason, setDeleteReason] = useState("");
  const [defaultChoices, setDefaultChoices] = useState([]);
  const [reportReason, setReportReason] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [changePrice, setChangePrice] = useState("");
  console.log(itemId)
  const ApplyFn = () => {
    let contextData = "",
      priceData = 0,
      choiceData = null,
      error = "";
    switch (type) {
      case "approveCourse":
        if (!outline.trim()) {
          error = "Please fill in all required fields.";
        } else {
          contextData = outline;
          priceData = price;
        }
        break;
      case "deleteCourse":
      case "deleteQuiz":
        if (!deleteReason.trim()) {
          error = "Please fill in all required fields.";
        } else {
          contextData = deleteReason;
        }
        break;
      case "reportNote":
      case "reportCourse":
        if (!reportReason.trim() && defaultChoices.length === 0) {
          error =
            "Please fill in the reason for reporting or select at least one default choice.";
        } else {
          contextData = reportReason;
          choiceData = defaultChoices;
        }
        break;
      case "changeCoursePrice":
        if (!changeReason.trim()) {
          error = "Please fill in all required fields.";
        } else {
          contextData = changeReason;
          priceData = changePrice;
        }
        break;
      default:
        break;
    }
    if (error.length !== 0) {
      setErrorMessage(error);
    }
    if (error == "") {
      contextData = contextData.trim();
      applyApi
        .addApply({
          type,
          content: contextData,
          price: priceData,
          choice: choiceData?.length !== 0 ? choiceData : null,
          itemId,
          authorId: userId,
        })
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            if (type == "approveCourse") {
              courseApi
                .updateCourse({ status: "pending" }, itemId)
                .then((response) => {
                  const { data, isSuccess } = response;
                  if (isSuccess) {
                    fetchFn && fetchFn("customCourses");
                  } else {
                    console.log(response.error);
                  }
                });
            }
            closeFn(itemId);
          } else {
            console.error("Error:", response.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  const chooseReportInfoFn = (e) => {
    console.log(e.target.textContent);
    let newChoices = [...defaultChoices];
    if (newChoices.length !== 0 && newChoices.includes(e.target.textContent)) {
      newChoices = newChoices.filter((choice) => choice !== e.target.textContent);
    } else {
      newChoices.push(e.target.textContent);
    }
    setDefaultChoices(newChoices);
  };
  return (
    <Backdrop>
      <div className={classes.IssuanceApplicationForm}>
        <FontAwesomeIcon
          icon={faXmark}
          className={classes.DeleteBtn}
          onClick={() => closeFn(itemId)}
        />
        {type === "approveCourse" && (
          <div>
            <h2>Apply to Create Course</h2>
            <label htmlFor="outline">Course Outline:</label>
            <textarea
              id="outline"
              placeholder={`Introducing course information\nTitle\n1. Item 1\n2. Item 2\n3. Item 3`}
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
            />
            <label htmlFor="price">Course Price:</label>
            RM:
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}
        {(type === "deleteCourse" || type === "deleteQuiz") && (
          <div>
            <h2>Delete {type === "deleteCourse" ? "Course" : "Quiz"}</h2>
            <label htmlFor="deleteReason">Reason for Deletion:</label>
            <textarea
              id="deleteReason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
        )}
        {(type === "reportCourse" || type === "reportNote") && (
          <div>
            <h2>Report {type === "reportCourse" ? "Course" : "Note"} </h2>
            <p>Default Choices:</p>
            <div className={classes.DefaultChoices}>
              {[
                "False Information",
                "Copyright Infringement",
                "Plagiarism",
                "Offensive Content",
                "Inaccurate Citations",
                "Inappropriate Language",
                "Misleading Title",
                "Spammy Links",
                "Personal Attacks",
              ].map((choice) => (
                <div key={choice} className={classes.ChoicesItem}>
                  <button
                    onClick={chooseReportInfoFn}
                    className={
                      defaultChoices.includes(choice)
                        ? `${classes.Active} ${classes.ChoicesBtn}`
                        : classes.ChoicesBtn
                    }
                  >
                    {choice}
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="reportReason">Reason for Reporting:</label>
            <textarea
              id="reportReason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
        )}
        {type === "changeCoursePrice" && (
          <div>
            <h2>Change Course Price</h2>
            <label htmlFor="changeReason">Reason for Price Change:</label>
            <textarea
              id="changeReason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
            />
            <label htmlFor="changePrice">Price:</label>
            RM:
            <input
              type="number"
              id="changePrice"
              value={changePrice}
              onChange={(e) => setChangePrice(e.target.value)}
            />
          </div>
        )}
        <p
          className={`${classes.WarnInfo} ${
            errorMessage ? classes.ShowClass : ""
          }`}
        >
          {errorMessage ?? errorMessage}
        </p>
        <button onClick={ApplyFn} className={classes.ApplyBtn}>Apply</button>
      </div>
    </Backdrop>
  );
};

export default IssuanceApplicationForm;
