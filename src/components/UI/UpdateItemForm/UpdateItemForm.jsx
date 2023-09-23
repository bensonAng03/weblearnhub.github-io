import { useState } from "react";
import classes from "./UpdateItemForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { courseApi } from "../../../store/api/courseApi";
import Backdrop from "../Backdrop/Backdrop";
import { quizApi } from "../../../store/api/quizApi";
let username = JSON.parse(localStorage.getItem("user"))?.username;
let userId = JSON.parse(localStorage.getItem("user"))?.id;
let userData = JSON.parse(localStorage.getItem("user"));
const UpdateItemForm = ({
  type = "",
  id = 0,
  update = false,
  toggleFn = null,
  fetchFn = null,
}) => {
  const [itemName, setItemName] = useState("");
  const addItemFn = () => {
    if (type == "Course") {
      if (!update) {
        courseApi
          .addCourse({
            author: username,
            title: itemName,
            avatar: userData.avatar ?? null,
            authorId: userId,
            price: 0,
            status: "not_reviewed",
          })
          .then((response) => {
            const { isSuccess } = response;
            if (isSuccess) {
              fetchFn && fetchFn("customCourses");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        setItemName("");
        toggleFn();
      } else {
        courseApi
          .updateCourse(
            {
              title: itemName,
            },
            id
          )
          .then((response) => {
            const { isSuccess } = response;
            if (isSuccess) {
              fetchFn && fetchFn("customCourses");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        setItemName("");
        toggleFn();
      }
    } else if (type == "Quiz") {
      if (!update) {
        quizApi
          .addQuiz({
            author: username,
            title: itemName,
            authorId: userId,
            status: "not_reviewed",
          })
          .then((response) => {
            const {isSuccess } = response;
            if (isSuccess) {
              fetchFn && fetchFn("customQuizzes");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        setItemName("");
        toggleFn();
      } else {
        quizApi
          .updateQuiz(
            {
              title: itemName,
            },
            id
          )
          .then((response) => {
            const {isSuccess } = response;
            if (isSuccess) {
              fetchFn && fetchFn("customQuizzes");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        setItemName("");
        toggleFn();
      }
    }
  };

  const handleItemNameChange = (event) => {
    setItemName(event.target.value);
  };
  return (
    <Backdrop>
      <div className={classes.UpdateItemForm}>
        <FontAwesomeIcon
          icon={faXmark}
          className={classes.CloseBtn}
          onClick={toggleFn}
        />
        <h2>{type} Information Form</h2>
        <label htmlFor="name">{type} Name:</label>
        <input
          type="text"
          id="name"
          className={classes.NameInput}
          name="name"
          value={itemName}
          onChange={handleItemNameChange}
          required
        />
        <button className={classes.SubmitBtn} onClick={addItemFn}>
          Submit
        </button>
      </div>
    </Backdrop>
  );
};

export default UpdateItemForm;
