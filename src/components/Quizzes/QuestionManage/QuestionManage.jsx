import { useEffect, useRef, useState } from "react";
import classes from "./QuestionManage.module.css";
import { questionApi } from "../../../store/api/questionApi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import UpdateItemForm from "../../UI/UpdateItemForm/UpdateItemForm";
import { courseApi } from "../../../store/api/courseApi";
import { quizApi } from "../../../store/api/quizApi";
let userId=JSON.parse(localStorage.getItem("user"))?.id;
const QuestionManage = () => {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [isGetQuestionsByIdSuccess, setIsGetQuestionsByIdSuccess] =
    useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [questionId, setQuestionId] = useState("");
  const [isQuizNameEdit, setIsQuizNameEdit] = useState(false);
  const [courseInfo, setCourseInfo] = useState([]);
  const [courseId, setCourseId] = useState(0);
  const params = useParams();
  const choicesListRef = useRef(null);
  useEffect(() => {
    fetchQuestions();
    fetchCourseInfo();
  }, []);
  const navigate = useNavigate();
  const fetchQuestions = () => {
    questionApi
      .getQuestionsById(+params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          if (data.attributes.staus == "approved") {
            throw new Error(
              "This quiz has been approved and cannot be edited again!"
            );
          } else {
            setQuestionData(data.attributes.questions.data);
            setQuizTitle(data.attributes.title);
            if(data.attributes.courseId && data.attributes.courseId!==0){
              setCourseId(data.attributes.courseId);
            }
            setIsGetQuestionsByIdSuccess(true);
          }
        } else {
          setQuestionData([]);
          setIsGetQuestionsByIdSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        navigate(-1);
      });
  };
  const fetchCourseInfo=()=>{
    courseApi.getCoursesByUserId(userId)
    .then((response) => {
      const { data, isSuccess } = response;
      if (isSuccess) {
        const tempCourseInfo = data.map((course) => ({
          id: course.id,
          title: course.attributes.title,
        }));
        setCourseInfo(tempCourseInfo)
      } 
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }
  const delQuestion = (id) => {
    questionApi
      .delQuestion(id)
      .then((response) => {
        const { isSuccess } = response;
        if (isSuccess) {
          console.log("ok");
          fetchQuestions();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleAddChoice = () => {
    setChoices([...choices, ""]);
  };
  const handleDeleteChoice = (index) => {
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    setChoices(updatedChoices);

    const updatedSelectedAnswers = selectedAnswers.filter(
      (answerIndex) => answerIndex !== index
    );
    setSelectedAnswers(updatedSelectedAnswers);
  };
  const handleChoiceChange = (index, value) => {
    if (value !== "") {
      const updatedChoices = [...choices];
      updatedChoices[index] = value;
      setChoices(updatedChoices);
    }
  };
  const handleAnswerChange = (index) => {
    const selectedIndex = selectedAnswers.indexOf(index);
    if (selectedIndex === -1) {
      setSelectedAnswers([...selectedAnswers, index]);
    } else {
      const updatedSelectedAnswers = selectedAnswers.filter(
        (answerIndex) => answerIndex !== index
      );
      setSelectedAnswers(updatedSelectedAnswers);
    }
  };
  const updateQuestionFn = (newQuestion, choices) => {
    const data = {
      title: newQuestion,
      choices: {
        data: choices.map((choice) => choice.trim()),
      },
      answers: {
        data: selectedAnswers.map((answerIndex) => choices[answerIndex]),
      },
      quizzes: [+params.id],
    };
    console.log("data", data, questionId);
    if (isEdit) {
      questionApi
        .updateQuestion(data, questionId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            console.log("update");
            fetchQuestions();
            setQuestion("");
            setChoices([]);
            setSelectedAnswers([]);
            setQuestionId("");
            setIsEdit(false);
            const choicesListElement = choicesListRef.current;
            if (choicesListElement && choicesListElement.firstChild) {
              while (choicesListElement.firstChild) {
                choicesListElement.removeChild(choicesListElement.firstChild);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      questionApi
        .addQuestion(data)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            console.log("add");
            fetchQuestions();
            setQuestion("");
            setChoices([]);
            setSelectedAnswers([]);
            const choicesListElement = choicesListRef.current;
            if (choicesListElement && choicesListElement.firstChild) {
              while (choicesListElement.firstChild) {
                choicesListElement.removeChild(choicesListElement.firstChild);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  const createQuestionFn = () => {
    const newQuestion = question.trim();
    const trimmedChoices = choices.map((choice) => choice.trim());
    // Check for empty values
    if (newQuestion === "" || trimmedChoices.some((choice) => choice === "")) {
      // Display error message or perform the desired action
      return;
    }
    // Check for duplicate choices
    const uniqueChoices = [...new Set(trimmedChoices)];
    if (trimmedChoices.length !== uniqueChoices.length) {
      alert("Duplicate choices are not allowed.");
      return;
    }

    // Check if at least one answer is selected
    if (selectedAnswers.length === 0) {
      console.log(selectedAnswers);
      // Display error message or perform the desired action
      return;
    }

    // Call the updateQuestionFn or perform the desired action
    updateQuestionFn(newQuestion, trimmedChoices);
    setChoices([]);
    fetchQuestions();
  };
  const deleteQuestionFn = (index) => {
    const updatedQuestionData = [...questionData];
    updatedQuestionData.splice(index, 1);
    setQuestionData(updatedQuestionData);
    delQuestion(index);
  };
  const editQuestionFn = (index, newQuestion, choicesData, answersData) => {
    setIsEdit(true);
    setQuestion(newQuestion);
    setChoices(choicesData.map((item) => item.trim()));
    const selectedAnswerIndexes = answersData.map((answer) =>
      choicesData.findIndex((choice) => choice.trim() === answer.trim())
    );
    setSelectedAnswers(selectedAnswerIndexes);
    setQuestionId(index);
  };
  const editQuizNameFn = () => {
    setIsQuizNameEdit((prevState) => !prevState);
  };
  const handleCourseId=(e)=>{
    setCourseId(e.target.value)
    if(e.target.value!=0){
      quizApi.updateQuiz({courseId:e.target.value},+params.id)
    }
    fetchQuestions();
  }
  return (
    <div className={classes.QuizContainer}>
      {isQuizNameEdit && (
        <UpdateItemForm
          type="Quiz"
          id={params.id}
          update={true}
          toggleFn={editQuizNameFn}
          fetchFn={fetchQuestions}
        />
      )}
      <div className={classes.CreateQuestionContainer}>
        <h3>Create a Quiz</h3>
        <div>
          <label>Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div>
          <label>Choices:</label>
          <div ref={choicesListRef}>
            {choices?.map((choice, index) => (
              <div className={classes.ChoiceBox} key={index}>
                <input
                  type="text"
                  value={choice}
                  onChange={(e) =>
                    handleChoiceChange(index, e.target.value.trim())
                  }
                />
                <input
                  type={selectedAnswers.includes(index) ? "checkbox" : "radio"}
                  checked={selectedAnswers.includes(index)}
                  onChange={() => handleAnswerChange(index)}
                />
                <FontAwesomeIcon
                  icon={faTrash}
                  className={classes.FaTrash}
                  onClick={() => handleDeleteChoice(index)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={classes.DisplayBox}>
          <button onClick={handleAddChoice}>Add Choice</button>
          <button onClick={createQuestionFn}>Generate Question</button>
          <Link to={"/quizzes"}>
            <button>Complete</button>
          </Link>
        </div>
      </div>
      <div className={classes.QuestionDataContainer}>
        {isGetQuestionsByIdSuccess && (
          <>
            <div className={classes.TitleContainer}>
              <h3>{quizTitle}</h3>
              <FontAwesomeIcon
                icon={faEdit}
                className={classes.FaEdit}
                onClick={editQuizNameFn}
              />
              <select onChange={handleCourseId} value={courseId}>
              <option value={0}>Unassigned</option>
                {courseInfo.map((item,index)=>(
                  <option value={item.id} key={index}>{item.title}</option>
                ))}
              </select>
            </div>

            {Array.isArray(questionData) && questionData.length !== 0 && (
              <ul className={classes.QuestionDataList}>
                {questionData?.map((questionItem, questionIndex) => (
                  <div className={classes.QuestionItem} key={questionItem.id}>
                    <div className={classes.FaIconContainer}>
                      <FontAwesomeIcon
                        className={classes.FaIcon}
                        icon={faEdit}
                        onClick={() =>
                          editQuestionFn(
                            questionItem.id,
                            questionItem.attributes.title,
                            questionItem.attributes.choices.data,
                            questionItem.attributes.answers.data
                          )
                        }
                      />
                      <FontAwesomeIcon
                        className={classes.FaIcon}
                        icon={faTrash}
                        onClick={() => deleteQuestionFn(questionItem.id)}
                      />
                    </div>
                    <div className={classes.QuestionTitleContainer}>
                      Q{questionIndex + 1}:
                      <p>{questionItem.attributes.title}</p>
                    </div>
                    <ul className={classes.ChoicesList}>
                      {questionItem.attributes.choices.data.map(
                        (item, index) => (
                          <li
                            className={`${classes.ChoiceItem} ${
                              questionItem.attributes.answers.data.includes(
                                item
                              )
                                ? classes.SelectedChoice
                                : ""
                            }`}
                            key={index}
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionManage;
