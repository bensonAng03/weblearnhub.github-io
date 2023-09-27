import classes from "./CourseList.module.css";
import { courseApi } from "../../store/api/courseApi";
import { useState, useEffect } from "react";
import Point from "../Point/Point";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faEllipsisV,
  faPlus,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import IssuanceApplicationForm from "../UI/IssuanceApplicationForm/IssuanceApplicationForm";
import { useNavigate } from "react-router-dom";
import Payment from "./Payment/Payment";
import CoursePrice from "./CoursePrice/CoursePrice";
import UpdateItemForm from "../UI/UpdateItemForm/UpdateItemForm";
import RechargePage from "./RechargePage/RechargePage";
import { userApi } from "../../store/api/userApi";
import { updatePoint } from "../../store/reducer/pointSlice";
import { useDispatch } from "react-redux";
import ConfirmModal from "../UI/ConfirmModal/ConfirmModal";

let userId = JSON.parse(localStorage.getItem("user"))?.id;
let username = JSON.parse(localStorage.getItem("user"))?.username;
const CourseList = () => {
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAddCourse, setIsAddCourse] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isPublish, setIsPublish] = useState(false);
  const [isDeleteCourse, setIsDeleteCourse] = useState(false);
  const [applyCourseId, setApplyCourseId] = useState(false);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [toggleCourseType, setToggleCourseType] = useState(false);
  const [courseType, setCourseType] = useState("purchasedCourses");
  const [pointType, setPointType] = useState("discount");
  const [barContainers, setBarContainers] = useState({});
  const [isRecharge, setIsRecharge] = useState(false);
  const [rechargePrice, setRechargePrice] = useState(0);
  const [point, setPoint] = useState(0);
  const [courseTitle, setCourseTitle] = useState("");
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const dispatch=useDispatch();
  useEffect(() => {
    fetchFn();
  }, [courseType, isShowPayment]);
  const fetchFn = () => {
    fetchCourse(courseType);
    fetchUserInfo();
  };

  const fetchCourse = (type) => {
    courseApi
      .getCourses(type)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          let tempArr = [...data];
          if (courseType === "notPurchasedCourses") {
            const filteredCourses = data.filter((course) => {
              if (
                course.attributes.students !== null &&
                course.attributes.students.includes(userId.toString())
              ) {
                return false;
              }
              return true;
            });
            setCourses(filteredCourses);
          } else if (courseType === "purchasedCourses") {
            for (let index = data.length - 1; index >= 0; index--) {
              const course = data[index];
              if (course.attributes.students == null) {
                tempArr.splice(index, 1);
              } else if (
                !course.attributes.students.includes(userId.toString())
              ) {
                tempArr.splice(index, 1);
              }
            }
            setCourses(tempArr);
          } else if (courseType === "customCourses") {
            setCourses(data);
          }
          setIsSuccess(true);
        } else {
          setCourses({});
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const fetchUserInfo = () => {
    userApi
      .getUserById(userId)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          dispatch(updatePoint({point:data.point}))
          setPoint(data.point);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const deleteCourseFn = (courseId, status = "") => {
    if (status == "not_reviewed" || status == "rejected") {
        toggleShowDeleteModal()
        setApplyCourseId(courseId);
    } else if (status == "approved") {
      setApplyCourseId(courseId);
      setIsDeleteCourse(true);
    } else if (status == "") {
      setIsDeleteCourse(!isDeleteCourse);
    }
  };
  const toggleShowDeleteModal=()=>{
      setIsShowDeleteModal(!isShowDeleteModal)
  }
  const confirmDeleteCourseFn=()=>{
    courseApi
    .delCourse(applyCourseId)
    .then((response) => {
      const {isSuccess } = response;
      if (isSuccess) {
        fetchCourse(courseType);
        setIsShowDeleteModal(false)
      } 
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }
  const handleSearchInputChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const searchCourseFn = () => {
    courseApi
      .getCourses("notPurchasedCourses", searchKeyword.toLowerCase())
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setCourseType("notPurchasedCourses")
          setCourses(data);
          setIsSuccess(true);
        } else {
          setCourses({});
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const toggleCourseFn = () => {
    setIsAddCourse(!isAddCourse);
  };
  const publishCourseFn = (id, status = "") => {
    if (status == "not_reviewed" || status == "rejected") {
      setIsPublish(!isPublish);
      setApplyCourseId(id);
    } else if (status == "") {
      setIsPublish(!isPublish);
    }
  };
  const fetchSelectedCourse =()=>{
    setSelectedCourse("");
  }
  const toggleShowPaymentFn = () => {
    setIsShowPayment(!isShowPayment);
  };
  const openCourseFn = (course, id, title, authorId, students) => {
    setCourseTitle(title);
    if (
      authorId == userId ||
      (students !== null && students.includes(userId.toString()))
    ) {
      navigate(`/courses/${id}/course`);
    } else {
      setPointType("discount");
      setSelectedCourse(course);
      toggleShowPaymentFn(true);
    }
  };
  const formatStatus = (status) => {
    let result = "";
    if (status !== "not_reviewed") {
      result = status.charAt(0).toUpperCase() + status.slice(1);
    } else {
      result = "Not Reviewed";
    }
    return result;
  };
  const handleMouseLeave = (courseId) => {
    setBarContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [courseId]: false,
    }));
  };
  const toggleBarContainer = (courseId) => {
    setBarContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [courseId]: !prevEditContainers[courseId],
    }));
  };
  const rechargedFn = (price) => {
    setRechargePrice(price);
    setIsRecharge(false);
    setPointType("recharge");
    setIsShowPayment(true);
  };
  const toggleChargeFn = () => {
    setIsRecharge((prevState) => !prevState);
  };
  return (
    <div className={classes.CourseListOuter}>
      {
        isShowDeleteModal && <ConfirmModal deleteFn={confirmDeleteCourseFn} toggleFn={toggleShowDeleteModal} message={`Are you sure you want to delete the course?`}/>

      }
      <div className={classes.FunctionContainer}>
        <div className={classes.LeftContainer}>
          <input
            type="text"
            className={classes.SearchBar}
            placeholder="Search for courses"
            value={searchKeyword}
            onChange={handleSearchInputChange}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className={classes.SearchBtn}
            onClick={searchCourseFn}
          />
        </div>
        <div className={classes.RightContainer}>
          <FontAwesomeIcon
            icon={faPlus}
            className={classes.AddBtn}
            onClick={toggleCourseFn}
          />
          <Point toggleFn={toggleChargeFn}/>
        </div>
      </div>
      <div className={classes.BarBtnContainer}>
        <FontAwesomeIcon
          icon={faBars}
          className={classes.BarBtn}
          onClick={() => setToggleCourseType(!toggleCourseType)}
        />
        <ul
          className={` ${classes.CourseTypeList} ${
            toggleCourseType ? classes.ShowClass : ""
          }`}
          onMouseLeave={() => setToggleCourseType(false)}
        >
          <li onClick={() => setCourseType("purchasedCourses")}>
            Purchased Courses
          </li>
          <li onClick={() => setCourseType("notPurchasedCourses")}>
            Not Purchased Courses
          </li>
          <li onClick={() => setCourseType("customCourses")}>Custom Courses</li>
        </ul>
      </div>
      {isRecharge && (
        <RechargePage toggleFn={toggleChargeFn} rechargedFn={rechargedFn} />
      )}
      {isAddCourse && (
        <UpdateItemForm
          type="Course"
          update={false}
          toggleFn={toggleCourseFn}
          fetchFn={() => fetchCourse(courseType)}
        />
      )}
      {(isPublish || isDeleteCourse) && (
        <IssuanceApplicationForm
          itemId={applyCourseId}
          type={isPublish ? "approveCourse" : "deleteCourse"}
          closeFn={isPublish ? publishCourseFn : deleteCourseFn}
          fetchFn={fetchCourse}
        />
      )}
      {isSuccess ? (
        <ul className={classes.CoursesList}>
          {isShowPayment && (
            <Payment
              fetchFn={fetchSelectedCourse}
              courseName={pointType !== "recharge" ? courseTitle : ""}
              username={username}
              userId={userId}
              type={pointType}
              point={pointType !== "recharge" ? point : 0}
              courseId={pointType !== "recharge" ? selectedCourse.id : 0}
              price={
                pointType !== "recharge"
                  ? selectedCourse?.attributes?.price
                  : rechargePrice
              }
              closeFn={toggleShowPaymentFn}
            />
          )}
          {courses.length > 0 ? (
            courses.map((course) => {
              const avatarUrl =
                course.attributes?.avatar?.url ||
                "https://res.cloudinary.com/dwrgzjjsz/image/upload/v1694510353/unknown_Avatar_8a0b7af8bd.jpg";
              return (
                <li className={classes.Course} key={course.id}>
                  <div className={classes.CourseInfo}>
                    {course.attributes.authorId == userId && (
                      <div className={classes.StatusBox}>
                        {formatStatus(course.attributes.status)}
                      </div>
                    )}

                    <button
                      onClick={() =>
                        openCourseFn(
                          course,
                          course.id,
                          course.attributes.title,
                          course.attributes.authorId,
                          course.attributes.students
                        )
                      }
                      className={classes.Title}
                    >
                      {course.attributes.title}
                    </button>
                    <p className={classes.TchName}>
                      {course.attributes.author}
                    </p>
                    {course.attributes.authorId == userId &&
                      course.attributes.status != "approved" && (
                        <>
                          <FontAwesomeIcon
                            icon={faEllipsisV}
                            className={classes.ManageBtn}
                            onClick={() => toggleBarContainer(course.id)}
                          />
                          <ul
                            className={`${classes.ManageContainer} ${
                              barContainers[course.id] ? classes.ShowClass : ""
                            }`}
                            onMouseLeave={() => handleMouseLeave(course.id)}
                          >
                            <li
                              onClick={() => {
                                toggleBarContainer(course.id);
                                publishCourseFn(
                                  course.id,
                                  course.attributes.status
                                );
                              }}
                            >
                              Publish
                            </li>

                            <li
                              onClick={() => {
                                deleteCourseFn(
                                  course.id,
                                  course.attributes.status
                                );
                              }}
                            >
                              Delete
                            </li>
                          </ul>
                        </>
                      )}
                    {course.attributes.authorId == userId &&
                      course.attributes.status == "approved" && (
                        <FontAwesomeIcon
                          icon={faTrash}
                          className={classes.DeleteBtn}
                          onClick={() => {
                            deleteCourseFn(course.id, course.attributes.status);
                          }}
                        />
                      )}
                  </div>
                  <div className={classes.TchImg}>
                    <img src={avatarUrl} alt="teacher image" />
                  </div>
                  {course.attributes.status === "approved" &&
                    ((course.attributes.students !== null &&
                      !course.attributes.students.includes(
                        userId.toString()
                      )) ||
                      course.attributes.students === null) && (
                      <CoursePrice
                        price={course.attributes.price}
                        status={course.attributes.status}
                      />
                    )}
                </li>
              );
            })
          ) : (
            <div className={classes.NotFound}>Not Found</div>
          )}
        </ul>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
};
export default CourseList;
