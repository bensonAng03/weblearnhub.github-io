import { useState, useEffect } from "react";
import classes from "./Quiz.module.css";
import { useParams } from "react-router-dom";
import { questionApi } from "../../../store/api/questionApi";
import { historyApi } from "../../../store/api/historyApi";
import { quizRankApi } from "../../../store/api/quizRankApi";
import { rankApi } from "../../../store/api/rankApi";
import QuizResult from "./QuizResult/QuizResult";
let openTime=Date.now();
let user = JSON.parse(localStorage.getItem("user"));
const Quiz = () => {
  const {id,author_id:authorId} = useParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [questionData, setQuestionData] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [isFirst, setIsFirst] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isShowResult,setIsShowResult]=useState(false)
  const [totalScore,setTotalScore]=useState(0)
  const [AllbaseScore,setBaseScore]=useState(0)
  const [questionInfo,setQuestionInfo]=useState([])
  const [correctQuestion,setCorrectQuestion]=useState(0)
  const getQuestions = () => {
    questionApi
      .getQuestionsById(+id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setBaseScore(data.attributes.score)
          setQuestionData(data.attributes.questions.data);
          setIsSuccess(true);
        } else {
          console.error("Error:", response.error);
          setQuestionData([]);
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const updateRank = (finalScore) => {
    if(user.id!==authorId){
    quizRankApi
      .getQuizRankById()
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data[0]?.attributes === undefined) {
            quizRankApi
              .addQuizRank({
                username: user.username,
                userId: user.id,
                score: finalScore,
              })
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          } else {
            quizRankApi
              .updateQuizRank({
                username: user.username,
                userId: user.id,
                score:+data[0].attributes.score+ finalScore,
              },data[0].id)
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    rankApi
      .getRankById(user.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          console.log(data);
          if (data[0] === undefined) {
            rankApi
              .addRank({
                username: user.username,
                userId: user.id,
                score: finalScore,
              })

              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  // setQuestionData(data.attributes.questions.data);
                  // setIsSuccess(true);
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                  // setQuestionData([]);
                  // setIsSuccess(false);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          } else {
            rankApi
              .updateRank(
                {
                  ...data[0].attributes,
                  score: +data[0].attributes.score + finalScore,
                },
                data[0].id
              )
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  // setQuestionData(data.attributes.questions.data);
                  // setIsSuccess(true);
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                  // setQuestionData([]);
                  // setIsSuccess(false);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
  const updateHistory = () => {
    historyApi
      .geHistoryById()
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data[0]?.attributes === undefined) {
            historyApi
              .addHistory({
                userId: user.id,
                answeredQuizzes: historyData.answeredQuizzes
                  ? [...historyData.answeredQuizzes,id]
                  : [id],
              })
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log("ok");
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          } else {
            historyApi
              .updateHistory(
                {
                  ...data[0].attributes,
                  answeredQuizzes: [
                    ...data[0].attributes.answeredQuizzes,
                    id,
                  ],
                },
                data[0].id
              )
              .then((response) => {
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log("ok");
                  console.log(data);
                } else {
                  console.error("Error:", response.error);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleIsFirst = () => {
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
                console.log("more time");
              } else {
                setIsFirst(true);
                console.log("first time");
              }
            }
          } else {
            setIsFirst(true);
            console.log("first time");
          }
          setIsSuccess(true);
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  useEffect(() => {
    getQuestions();
    handleIsFirst();
  }, []);

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
    // totalScore,numQuestions
    const currentTime = Date.now();
    const elapsedTime = (currentTime - openTime) / 1000; // Calculate elapsed time in seconds
    const baseScore=Math.floor(AllbaseScore / questionData.length)
    let chooseCorrectAnswer = 0;
    let tempTotalScore = 0;
    let tempQuestionInfo={};
    let tempQuestionInfoArr=[];
    for (let i = 0; i < questionData.length; i++) {
      const correctAnswers = questionData[i].attributes.answers.data;
      const selectedAnswer = selectedChoices[i] || [];
      console.log(correctAnswers);
      console.log(selectedAnswer);
      tempQuestionInfo={
        "question":questionData[i].attributes.title,
        "isCorrect":false,
        "correctAnswers":questionData[i].attributes.answers.data
      }
      let questionScore = 0;

      if (correctAnswers.length === 1) {
        // Single choice question
        if (correctAnswers[0] === selectedAnswer[0]) {
          questionScore = baseScore
          chooseCorrectAnswer++;
          tempQuestionInfo.isCorrect=true;
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
          questionScore =  baseScore
          chooseCorrectAnswer++;
          tempQuestionInfo.isCorrect=true;
        } else if (
          intersection.length > 0 &&
          intersection.length < correctAnswers.length
        ) {
          // Partially correct
          const scoreMultiplier = intersection.length / correctAnswers.length;
          questionScore =  baseScore * scoreMultiplier;
          chooseCorrectAnswer++;
        }
      }

      tempTotalScore += questionScore;
      tempQuestionInfoArr.push(tempQuestionInfo)
      console.log(tempTotalScore);
    }
    // Calculate time bonus
    console.log(chooseCorrectAnswer)
    setCorrectQuestion(chooseCorrectAnswer)
    setQuestionInfo(tempQuestionInfoArr)
    const maxTime = 120 * chooseCorrectAnswer; // 单题最大时间（秒）
    const maxTimeBonus = (baseScore*2) * chooseCorrectAnswer; // 最大时间加成分数
    let timeBonus = maxTimeBonus;
    if (elapsedTime <= maxTime) {
      const timeMultiplier = maxTimeBonus - 7.5 * elapsedTime;
      timeBonus = Math.round(timeMultiplier);
    } else {
      timeBonus = 0;
    }

    // Calculate final score
    const finalScore = Math.round(totalScore + timeBonus);  
  console.log(questionData.length)
  console.log(questionData.score)
    setTotalScore(questionData.length * (baseScore*2) +baseScore)
    setScore(finalScore);
    console.log(finalScore);
    if (isFirst) {
      updateRank(finalScore);
      updateHistory();
    }
    setIsShowResult(true);
  };

  return (
    <div className={classes.Quiz}>
      {isSuccess &&
        questionData.length !== 0 &&
        questionData.map((questionItem, questionIndex) => {
          return (
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
          );
        })}
      <button className={classes.SubmitBtn} onClick={()=>{handleQuizSubmit()}}>Submit</button>
      {score !== 0 && <p>Score: {score}</p>}
      {isShowResult && <QuizResult score={score} numCorrectQuestions={correctQuestion} numQuestions={questionData.length} questionInfo={questionInfo}/>}
    </div>
  );
};

export default Quiz;
