import { NavLink, useParams, Outlet } from "react-router-dom";
import classes from "./Course.module.css";
import { useState, useEffect} from "react";
import { courseApi } from "../../../store/api/courseApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faVideo } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import IssuanceApplicationForm from "../../UI/IssuanceApplicationForm/IssuanceApplicationForm";
import UpdateItemForm from "../../UI/UpdateItemForm/UpdateItemForm";
import Point from "../../Point/Point";
import { userApi } from "../../../store/api/userApi";
import RechargePage from "../RechargePage/RechargePage";
import Payment from "../Payment/Payment";
let userId = JSON.parse(localStorage.getItem("user"))?.id;
let username = JSON.parse(localStorage.getItem("user"))?.username;
const Course = () => {
  const params = useParams();
  const [courseData, setCourseData] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCourseNameEdit, setIsCourseNameEdit] = useState(false);
  const [isCoursePriceEdit, setIsCoursePriceEdit] = useState(false);
  const [isReportCourse, setIsReportCourse] = useState(false);
  const [showEditContainer, setShowEditContainer] = useState(false);
  const [point, setPoint] = useState(false);
  const [isRecharge, setIsRecharge] = useState(false);
  const [rechargePrice, setRechargePrice] = useState(0);
  const [isShowPayment, setIsShowPayment] = useState(false);
  useEffect(() => {
    fetchUserInfo();
    fetchCourse()
  }, []);
  const fetchUserInfo = () => {
    userApi
      .getUserById(userId)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setPoint(data.point);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const fetchCourse = () => {
    courseApi
      .getCourseById(params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setCourseData(data.attributes);
          setIsSuccess(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setCourseData({});
        setIsSuccess(false);
      });
  };
  const editCourseNameFn = () => {
    setIsCourseNameEdit(!isCourseNameEdit);
  };
  const editCoursePriceFn = () => {
    setIsCoursePriceEdit(!isCoursePriceEdit);
  };
  const toggleEditContainer = () => {
    setShowEditContainer(!showEditContainer);
  };
  const handleMouseLeave = () => {
    setShowEditContainer(false);
  };
  const reportCourseFn = () => {
    setIsReportCourse(!isReportCourse);
  };
  const toggleChargeFn = () => {
    setIsRecharge((prevState) => !prevState);
  };
  const rechargedFn = (price) => {
    setRechargePrice(price);
    setIsRecharge((prevState) => !prevState);
    setIsShowPayment((prevState) => !prevState);
    toggleChargeFn();
  };
  const toggleShowPaymentFn = () => {
    setIsShowPayment(!isShowPayment);
  };
  return (
    <>
      {isCourseNameEdit && (
        <UpdateItemForm
          type="Course"
          id={params.id}
          update={true}
          toggleFn={editCourseNameFn}
          fetchFn={fetchCourse}
        />
      )}
      {isCoursePriceEdit && (
        <IssuanceApplicationForm
          itemId={params.id}
          type={"changeCoursePrice"}
          closeFn={editCoursePriceFn}
        />
      )}
      {isReportCourse && (
        <IssuanceApplicationForm
          itemId={params.id}
          type={"reportCourse"}
          closeFn={reportCourseFn}
        />
      )}
      {isRecharge && (
        <RechargePage toggleFn={toggleChargeFn} rechargedFn={rechargedFn} />
      )}
      {isShowPayment && (
        <Payment
        username={username}
          userId={userId}
          type={"recharge"}
          courseId={0}
          price={rechargePrice}
          point={point}
          fetchFn={fetchUserInfo}
          closeFn={toggleShowPaymentFn}
        />
      )}
      {isSuccess && courseData.length != 0 && (
        <div className={classes.Course}>
          <div className={classes.RightContainer}>
          <Point toggleFn={toggleChargeFn} point={point} />
          </div>
          <div className={classes.Contain}>
            <div className={classes.CourseInfo}>
              <h2>{courseData.title}</h2>
              <p>{courseData.author}</p>
              {+courseData.authorId === userId ? (
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  className={classes.SetBtn}
                  onClick={toggleEditContainer}
                />
              ) : (
                <button className={classes.ReportBtn} onClick={reportCourseFn}>
                  Report
                </button>
              )}
              <ul
                className={`${classes.EditContainer} ${
                  showEditContainer ? classes.ShowClass : ""
                }`}
                onMouseLeave={handleMouseLeave}
              >
                <li onClick={editCourseNameFn}>Course Name</li>
                <li onClick={editCoursePriceFn}>Course Price</li>
              </ul>
              <div className={classes.TchImg}>
                <img
                  src={courseData?.avatar?.url || 'https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg'}
                  alt="teacher image"
                />
              </div>
              <div className={classes.BtnContainer}>
                <button className={classes.VideoBtn}>
                  <Link target="_blank" to={`/live/${params.id}/${courseData.authorId}`}>
                    <FontAwesomeIcon icon={faVideo} />
                  </Link>
                </button>
                {courseData.authorId == userId && (
                  <Link to={`publish/none/0`} className={classes.PublishBtn}>
                    Publish
                  </Link>
                )}
              </div>
            </div>
              <>
                <nav className={classes.CourseNavbar}>
                  <ul>
                    <li className={classes.Link}>
                      <NavLink
                        to={`/courses/${params.id}/course`}
                        className={({ isActive }) =>
                          isActive ? classes.Active : ""
                        }
                      >
                        Course
                      </NavLink>
                    </li>
                    <li className={classes.Link}>
                      <NavLink
                        to={`/courses/${params.id}/classwork`}
                        className={({ isActive }) =>
                          isActive ? classes.Active : ""
                        }
                      >
                        Classwork
                      </NavLink>
                    </li>
                    <li className={classes.Link}>
                      <NavLink
                        to={`/courses/${params.id}/note`}
                        className={({ isActive }) =>
                          isActive ? classes.Active : ""
                        }
                      >
                        Note
                      </NavLink>
                    </li>
                    <li className={classes.Link}>
                      <NavLink
                        to={`/courses/${params.id}/rank`}
                        className={({ isActive }) =>
                          isActive ? classes.Active : ""
                        }
                      >
                        Rank
                      </NavLink>
                    </li>
                  </ul>
                </nav>
                <Outlet />
              </>
            
          </div>
        </div>
      )}
    </>
  );
};

export default Course;
