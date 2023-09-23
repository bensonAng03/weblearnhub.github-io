import { useEffect, useState } from "react";
import classes from "./Home.module.css";
import { userApi } from "../../store/api/userApi";
import { courseApi } from "../../store/api/courseApi";
import { useNavigate } from "react-router-dom";
import ContentLayout from "./ContentLayout/ContentLayout";
const Home = () => {
  const [courseInfoArr, setCourseInfoArr] = useState([]);
  const [teacherInfoArr, setTeacherInfoArr] = useState([]);
  const [isCourseInfoLoading, setIsCourseInfoLoading] = useState(true);
  const [isTeacherInfoLoading, setIsTeacherInfoLoading] = useState(true);
  const [type, setType] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchTeacherInfo();
    fetchCourseInfo();
  }, []);
  const fetchTeacherInfo = async () => {
    try {
      setIsTeacherInfoLoading(true);
      setTeacherInfoArr([]);
      const response = await userApi.getUsers();
      if (response.isSuccess) {
        setTeacherInfoArr(response.data.filter((item) => item.position));
        setIsTeacherInfoLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsTeacherInfoLoading(false);
    }
  };
  const fetchCourseInfo = async () => {
    try {
      setIsCourseInfoLoading(true);
      setCourseInfoArr([]);
      const response = await courseApi.getCourses();
      if (response.isSuccess) {
        setCourseInfoArr(
          response.data.filter((item) => item.attributes.description)
        );
        setIsCourseInfoLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsCourseInfoLoading(false);
    }
  };
  const generateCourseInfo = (item, index) => {
    return (
      <div key={index} className={classes.CourseInfoItem}>
        <h3 className={classes.Title}>{item.attributes.title}</h3>
        {item.attributes.description && (
          <p className={classes.Description}>{item.attributes.description}</p>
        )}
        <div className={classes.PriceContainer}>
          <p className={classes.Price}>RM {item.attributes.price}</p>
          <button
            className={classes.BuyCourseBtn}
            onClick={() => navigate("/courses")}
          >
            Buy Course Now
          </button>
        </div>
      </div>
    );
  };
  
  const generateTeacherInfo = (item, index) => {
    const avatarUrl =
      item.avatar?.url || "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg";
    return (
      <div key={index} className={classes.TeacherInfoItem}>
        <img src={avatarUrl} alt="teacher image" />
        <h3>{item.username}</h3>
        <p className={classes.Position}>{item.position}</p>
        <p className={classes.TeacherDescription}>{item.description}</p>
      </div>
    );
  };
  const getContentTypeFn = (typeTemp) => {
    setType(typeTemp);
  };
  return (
    <>
      {type.length == 0 ? (
        <div className={classes.Home}>
          <div className={classes.ContentContainer}>
            <div className={classes.WebsiteInfo}>
              <div className={classes.BackgroundImage}></div>
              <p>
                Web LearnHub is a five-star worldwide learning platform that
                offers a comprehensive selection of courses to meet a variety of
                demands. Our user-friendly layout makes it simple to navigate
                our large information resource. Despite the fact that our
                platform lacks major social capabilities, it creates a thriving
                worldwide learning community. While we lack showy tools, video
                courses and examinations are vital resources. Renowned
                professors recommend us for our diverse course options and
                knowledgeable instructors, which equip students for personal and
                professional development. Join Web LearnHub today to discover
                the future of learning and set off on a path to a great
                tomorrow!
              </p>
            </div>
            <div className={classes.CourseInfoContainer}>
              {!isCourseInfoLoading &&
                courseInfoArr.map((item, index) =>
                  generateCourseInfo(item, index)
                )}
            </div>
            <div className={classes.TeacherInfoOuterContainer}>
              <div className={classes.TeacherInfoContainer}>
                {!isTeacherInfoLoading &&
                  teacherInfoArr.map((item, index) =>
                    generateTeacherInfo(item, index)
                  )}
              </div>
            </div>
            <footer className={classes.Footer}>
              <ul>
                <li onClick={() => setType("teach")}>Teach on WebLearnHub</li>
                <li onClick={() => setType("about")}>About us</li>
                <li onClick={() => setType("FAQ")}>FAQ</li>
                <li onClick={() => setType("term")}>Term of Use</li>
                <li onClick={() => setType("privacyPolicy")}>Privacy Policy</li>
              </ul>
            </footer>
          </div>
        </div>
      ) : (
        <ContentLayout type={type} getContentTypeFn={getContentTypeFn} />
      )}
    </>
  );
};

export default Home;
