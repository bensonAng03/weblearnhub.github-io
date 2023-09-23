import { useState, useEffect } from "react";
import classes from "./Quiz.module.css";
import { useParams } from "react-router-dom";
import { questionApi } from "../../../store/api/questionApi";
import { historyApi } from "../../../store/api/historyApi";
import { quizRankApi } from "../../../store/api/quizRankApi";
import { rankApi } from "../../../store/api/rankApi";
import QuizResult from "./QuizResult/QuizResult";
let openTime = Date.now();
let user = JSON.parse(localStorage.getItem("user"));
const Quiz = () => {
  const { id, author_id: authorId } = useParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [questionData, setQuestionData] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [isFirst, setIsFirst] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isShowResult, setIsShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [AllbaseScore, setBaseScore] = useState(0);
  const [questionInfo, setQuestionInfo] = useState([]);
  const [correctQuestion, setCorrectQuestion] = useState(0);
  const [isNotFound, setIsNotFound] = useState(false);
  const [correctAnswersLength, setCorrectAnswersLength] = useState(0);
  const [numCorrectSelected, setNumCorrectSelected] = useState(0);
  const [courseId, setCourseId] = useState(0);
  useEffect(() => {
    getQuestions();
    handleIsFirst();
  }, []);
  const getQuestions = () => {
    questionApi
      .getQuestionsById(+id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data.attributes.questions.data) {
            let numCorrectAnswers = 0;
            setIsNotFound(false);
            setBaseScore(data.attributes.score);
            setQuestionData(data.attributes.questions.data);
            setCourseId(data.attributes.courseId);
            data.attributes.questions.data.map((item) => {
              item.attributes.answers.data.map((item) => {
                if (item) {
                  numCorrectAnswers++;
                }
              });
            });
            setCorrectAnswersLength(numCorrectAnswers);
            setIsSuccess(true);
          }
        } else {
          setQuestionData([]);
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleIsFirst = () => {
    quizRankApi
      .getQuizRankById(user.id, courseId)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data[0]?.attributes !== undefined) {
            historyApi
              .geHistoryById()
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  if (data[0]?.attributes?.answeredQuizzes) {
                    for (
                      let i = 0;
                      i < data[0].attributes.answeredQuizzes.length;
                      i++
                    ) {
                      if (data[0].attributes.answeredQuizzes[i] === id) {
                        setIsFirst(false);
                        setHistoryData(data);
                      } else {
                        setIsFirst(true);
                      }
                    }
                  } else {
                    setIsFirst(true);
                  }
                  setIsSuccess(true);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const updateRank = (finalScore) => {
    if (user.id !== authorId) {
      quizRankApi
        .getQuizRankById(user.id, courseId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            if (data[0]?.attributes !== undefined) {
              quizRankApi.updateQuizRank(
                {
                  score: +data[0].attributes.score + finalScore,
                },
                data[0].id
              )
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      rankApi
        .getRankById(user.id, courseId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            if (data[0] != undefined) {
              rankApi.updateRank(
                {
                  score: +data[0].attributes.score + finalScore,
                },
                data[0].id
              );
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  const updateHistory = () => {
    historyApi
      .geHistoryById()
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data[0]?.attributes === undefined) {
            historyApi.addHistory({
              userId: user.id,
              answeredQuizzes: historyData.answeredQuizzes
                ? [...historyData.answeredQuizzes, id]
                : [id],
            });
          } else {
            historyApi.updateHistory(
              {
                ...data[0].attributes,
                answeredQuizzes: [...data[0].attributes.answeredQuizzes, id],
              },
              data[0].id
            );
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleChoiceSelect = (choice, questionIndex) => {
    setSelectedChoices((prevChoices) => {
      const updatedChoices = [...prevChoices];
      updatedChoices[questionIndex] = updatedChoices[questionIndex] || [];
      const choiceIndex = updatedChoices[questionIndex].indexOf(choice);
      if (choiceIndex > -1) {
        // Already selected, deselect the choice
        updatedChoices[questionIndex].splice(choiceIndex, 1);
      } else {
        // Not selected, select the choice
        updatedChoices[questionIndex].push(choice);
      }
      return updatedChoices;
    });
  };
  const handleQuizSubmit = () => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - openTime) / 1000; // Calculate elapsed time in seconds
    const baseScore = Math.floor(AllbaseScore / questionData.length);
    let chooseCorrectAnswer = 0;
    let choosePartiallyCorrectAnswer = 0;
    let tempQuestionInfo = {};
    let tempQuestionInfoArr = [];
    for (let i = 0; i < questionData.length; i++) {
      const correctAnswers = questionData[i].attributes.answers.data;
      const selectedAnswer = selectedChoices[i] || [];
      tempQuestionInfo = {
        question: questionData[i].attributes.title,
        isCorrect: false,
        correctAnswers: questionData[i].attributes.answers.data,
      };

      if (correctAnswers.length === 1) {
        // Single choice question
        if (correctAnswers[0] === selectedAnswer[0]) {
          chooseCorrectAnswer++;
          tempQuestionInfo.isCorrect = true;
        }
      } else {
        // Multiple choice question
        const intersection = correctAnswers.filter((answer) =>
          selectedAnswer.includes(answer)
        );
        const difference = selectedAnswer.filter(
          (answer) => !correctAnswers.includes(answer)
        );

        if (
          intersection.length === correctAnswers.length &&
          difference.length === 0
        ) {
          // All choices are correct
          choosePartiallyCorrectAnswer += correctAnswers.length;
          tempQuestionInfo.isCorrect = true;
        } else if (
          intersection.length > 0 &&
          intersection.length < correctAnswers.length
        ) {
          // Partially correct
          choosePartiallyCorrectAnswer++;
        }
      }
      tempQuestionInfoArr.push(tempQuestionInfo);
    }
    // Calculate time bonus
    setCorrectQuestion(chooseCorrectAnswer);
    setQuestionInfo(tempQuestionInfoArr);
    setNumCorrectSelected(chooseCorrectAnswer + choosePartiallyCorrectAnswer);
    //Maximum time for a single question (seconds)
    let maxTime = 120 * chooseCorrectAnswer; 
    maxTime += 120 * choosePartiallyCorrectAnswer; 
    //Maximum time addition score
    const maxTimeBonus = baseScore * 2 * chooseCorrectAnswer; 
    const maxPartiallyTimeBonus =
      baseScore * 1.5 * choosePartiallyCorrectAnswer; 
    let timeBonus = maxTimeBonus + maxPartiallyTimeBonus;
    if (elapsedTime <= maxTime) {
      let timeMultiplier = 0;
      if (maxTimeBonus !== 0) {
        timeMultiplier = maxTimeBonus - 7.5 * elapsedTime;
      }
      if (maxPartiallyTimeBonus !== 0) {
        timeMultiplier += maxPartiallyTimeBonus - 7.5 * elapsedTime;
      }
      timeBonus = Math.round(timeMultiplier);
    } else {
      timeBonus = 0;
    }

    // Calculate final score
    const finalScore = Math.round(totalScore + timeBonus);
    setTotalScore(questionData.length * (baseScore * 2) + baseScore);
    setScore(finalScore);
    if (isFirst) {
      updateRank(finalScore);
      updateHistory();
    }
    setIsShowResult(true);
  };

  return (
    <div className={classes.Quiz}>
      {isSuccess && !isNotFound && questionData.length !== 0 ? (
        <>
          {questionData.map((questionItem, questionIndex) => (
            <div key={questionIndex} className={classes.QuestionContainer}>
              <h3 className={classes.Question}>
                {questionItem.attributes.title}
              </h3>
              <ul className={classes.ChoicesList}>
                {questionItem.attributes.choices.data.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleChoiceSelect(item, questionIndex)}
                    className={`${classes.ChoiceItem} ${
                      selectedChoices[questionIndex]?.includes(item)
                        ? classes.Selected
                        : ""
                    }`}
                  >
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button className={classes.SubmitBtn} onClick={handleQuizSubmit}>
            Submit
          </button>
          {score !== 0 && <p>Score: {score}</p>}
          {isShowResult && (
            <QuizResult
              score={score}
              numCorrectQuestions={correctQuestion}
              numQuestions={questionData.length}
              numCorrectSelected={numCorrectSelected}
              numCorrectAnswerLength={correctAnswersLength}
              questionInfo={questionInfo}
            />
          )}
        </>
      ) : (
        <div className={classes.NotFound}>Not Found</div>
      )}
    </div>
  );
};

export default Quiz;
