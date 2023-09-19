import React from "react";
import classes from "./QuizResult.module.css"; // 引入CSS模块
import Backdrop from "../../../UI/Backdrop/Backdrop";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const QuizResult = ({ score, numCorrectQuestions, numQuestions,numCorrectSelected,numCorrectAnswerLength,questionInfo }) => {
  console.log(numCorrectSelected)
  const percentage = ((numCorrectSelected / numCorrectAnswerLength) * 100).toFixed(2);
  let encouragementMessage = "";

  if (percentage >= 90) {
    encouragementMessage = "Excellent! You did a fantastic job!";
  } else if (percentage >= 70) {
    encouragementMessage = "Great! You did well, keep it up!";
  } else if (percentage >= 50) {
    encouragementMessage = "Not bad! You passed, but you can do even better!";
  } else {
    encouragementMessage = "Don't give up! Keep practicing and try again!";
  }

  return (
    <Backdrop>
      <div className={classes.QuizResult}> {/* 应用CSS模块类名 */}
        <Link to="/quizzes">
          <FontAwesomeIcon icon={faXmark} className={classes.CloseBtn} /> {/* 应用CSS模块类名 */}
        </Link>
        <h2>Quiz Result</h2>
        <p>{percentage}% - {encouragementMessage}</p>
        <p className={classes.Score}>{score}</p>
        <p className={classes.ScoreFraction}>
          {numCorrectQuestions}/{numQuestions}
        </p>
        <div className={classes.TableContainer}>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Question</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {questionInfo.map((item, index) => {
                            console.log(item.isCorrect)
              return(
                
                <tr key={index} className={item.isCorrect==false ? classes.RedColor:""}>
                  <td>{index + 1}</td>
                  <td><p className={classes.Question}>{item.question}</p></td>
                  <td><p className={classes.CorrectAnswers}>{item.correctAnswers.join(", ")}</p></td>
                </tr>
                )

              })}
            </tbody>
          </table>
        </div>
      </div>
    </Backdrop>
  );
};

export default QuizResult;
