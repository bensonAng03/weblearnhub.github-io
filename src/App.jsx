import "./App.css";
import { Routes, Route} from "react-router-dom";
import CourseList from "./components/CourseList/CourseList";
import Home from "./components/Home/Home";
import LiveCourse from "./components/LiveCourse/LiveCourse";
import Profile from "./components/Profile/Profile";
import Course from "./components/CourseList/Course/Course";
import CourseCategory from "./components/CourseList/Course/CourseCategory/CourseCategory";
import ClassworkCategory from "./components/CourseList/Course/ClassworkCategory/ClassworkCategory";
import NoteCategory from "./components/CourseList/Course/NoteCategory/NoteCategory";
import useAutoLogout from "./hooks/useAutoLogout";
import NeedAuth from "./components/NeedAuth/NeedAuth";
import AuthForm from "./components/AuthForm/AuthForm";
import WhiteBoard from "./components/LiveCourse/WriteBoard/WriteBoard"
import Quiz from "./components/Quizzes/Quiz/Quiz";
import Quizzes from "./components/Quizzes/Quizzes";
import RankingBoard from "./components/CourseList/Course/RankingBoard/RankingBoard";
import QuestionManage from "./components/Quizzes/QuestionManage/QuestionManage";
import Review from "./components/Auditor/Review/Review";
import NeedAuditor from "./components/NeedAuditor/NeedAuditor";
import Header from "./components/Header/Header";
import PublishPage from "./components/CourseList/Course/PublishPage/PublishPage";
const App = () => {
  useAutoLogout();
  let user = JSON.parse(localStorage.getItem("user"));
  let role = JSON.parse(localStorage.getItem("user"))?.role;
  return (
    <>
    {(role=="authenticated" || role=="public" || role==undefined )?
    <div className="AppContainer">
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="courses" element={<NeedAuth><CourseList/></NeedAuth>} />
        <Route
          path="courses/:id"
          element={<NeedAuth><Course/></NeedAuth>}
        >
          <Route path="course" element={<NeedAuth><CourseCategory/></NeedAuth>} />
          <Route
            path="classwork"
            element={<NeedAuth><ClassworkCategory/></NeedAuth>}
          />
          <Route path="rank" element={<NeedAuth><RankingBoard username={user?.username} userId={user?.id}/></NeedAuth>}/>
          <Route path="note" element={<NeedAuth><NoteCategory scope="course"/></NeedAuth>}/>
          <Route
            path="publish/:item_type/:item_id"
            element={<NeedAuth><PublishPage/></NeedAuth>}
          />
        </Route>
        <Route path="live/:room/:id" element={<NeedAuth><LiveCourse/></NeedAuth>}/>
        <Route path="notes" element={<NeedAuth><NoteCategory scope="none"/></NeedAuth>} />
        <Route path="quizzes" element={<NeedAuth><Quizzes /></NeedAuth>} />
        <Route path="quizzes/:id/quiz/:author_id" element={<NeedAuth><Quiz/></NeedAuth>} />
        <Route path="quizzes/:id/create-quiz" element={<NeedAuth><QuestionManage /></NeedAuth>} />
        <Route path="me" element={<NeedAuth><Profile /></NeedAuth>} />
        <Route path='auth-form' element={<AuthForm/>}/>
        <Route path='white-board' element={<NeedAuth><WhiteBoard/></NeedAuth>}/>
      </Routes>
    </div> :
    <div className="AppContainer">
      <NeedAuditor>
        <Review/>
      </NeedAuditor>
    </div>}
    
    </>
  );
};

export default App;
