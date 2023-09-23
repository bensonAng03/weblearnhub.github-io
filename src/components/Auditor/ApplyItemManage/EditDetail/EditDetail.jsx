import { useState } from "react";
import classes from "./EditDetail.module.css";
import Backdrop from "../../../UI/Backdrop/Backdrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { responseApi } from "../../../../store/api/responseApi";
import { courseApi } from "../../../../store/api/courseApi";
import { quizApi } from "../../../../store/api/quizApi";
const EditDetail = ({ id,itemId, authorId, type, rejectFn, toggleFn }) => {
  const [defaultChoices, setDefaultChoices] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const chooseResponseInfoFn = (e) => {
    let newChoices = [...defaultChoices];
    if (newChoices.length !== 0 && newChoices.includes(e.target.textContent)) {
      newChoices = newChoices.filter((choice) => choice !== e.target.textContent);
    } else {
      newChoices.push(e.target.textContent);
    }
    setDefaultChoices(newChoices);
  };
  const handleRejectFeedback = () => {
    if (type=="reportCourse" || type=="reportNote") return
    if(type=="approveCourse" ){
      courseApi.updateCourse({
        status:"rejected"
      },itemId)  
    }else if(type=="approveQuiz"){
      quizApi.updateQuiz({
        status:"rejected"
      },itemId)  
    }
    if (rejectReason.trim() !== "" || defaultChoices.length !== 0) {
      let content = "";
      let choices = [...defaultChoices].join(",");
      if (rejectReason.trim()) {
        content = rejectReason.trim();
      }
      if (choices.length !== 0) {
        content += `\n${choices}`;
      }
      responseApi
        .addResponse({
          content,
          authorId,
          itemId,
          type,
        })
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            rejectFn(id);
            toggleFn();
          } else {
            console.error("Error:", response.error);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      alert(
        "Please fill in the reason for reporting or select at least one default choice."
      );
    }
  };
  return (
    <Backdrop>
      <div className={classes.EditDetail}>
        <FontAwesomeIcon
          icon={faXmark}
          onClick={toggleFn}
          className={classes.CloseBtn}
        />
        <p>Feedback:</p>
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
                onClick={chooseResponseInfoFn}
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
        <textarea
          id="rejectReason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        ></textarea>
        <button onClick={handleRejectFeedback} className={classes.SubmitBtn}>submit</button>
      </div>
    </Backdrop>
  );
};

export default EditDetail;
