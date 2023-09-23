import { useEffect, useState } from "react";
import { responseApi } from "../../../store/api/responseApi";
import { reportApi } from "../../../store/api/reportApi";
import classes from "./Feedback.module.css";
const Feedback = ({ navItem }) => {
  const [feedbackData, setResponseData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [isResponseSuccess, setIsResponseSuccess] = useState(false);
  const [isReportSuccess, setIsResportSuccess] = useState(false);
  const [selectItemIdArr, setSelectItemIdArr] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const fetchResponse = () => {
    responseApi
      .getResponsesByUserId()
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setIsResponseSuccess(true);
          setResponseData(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const fetchReport = () => {
    reportApi
      .getReportsByUserId()
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setIsResportSuccess(true);
          setReportData(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchResponse();
    fetchReport();
  }, []);
  useEffect(() => {
    setSelectItemIdArr([]);
    setSelectAll(false);
  }, [navItem]);
  const handleSelectItemFn = (id) => {
    setSelectAll(false);
    let tempItemArr = [...selectItemIdArr];
    if (tempItemArr.includes(id)) {
      tempItemArr = tempItemArr.filter((item) => item !== id);
    } else {
      tempItemArr.push(id);
    }
    setSelectItemIdArr(tempItemArr);
  };
  const selectAllFn = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      let tempData = navItem === "report" ? reportData : feedbackData;
      let tempItemArr = [];
      for (let i = 0; i < tempData.length; i++) {
        tempItemArr.push(tempData[i].id);
      }
      setSelectItemIdArr(tempItemArr);
    } else {
      setSelectItemIdArr([]);
    }
  };
  const format = (type, itemId, content, createdAt) => {
    const actionVerb = {
      approveCourse: "approve the course",
      approveQuiz: "approve the quiz",
      changeCoursePrice: "modify the price",
      deleteCourse: "remove the course",
      deleteQuiz: "remove the quiz",
      reportCourse: "report the course",
      reportNote: "report the note",
    };
    let feedbackData, feedbackReason, feedbackDate, feedbackAction;
    if (navItem === "response") {
      feedbackAction = actionVerb[type] || "unknown action";

      feedbackData =
        feedbackAction !== "unknown action"
          ? `Your request to ${feedbackAction} (ID: ${itemId}) has been declined.`
          : itemId !== null
          ? `You have successfully purchased Course (ID ${itemId}), utilizing RM112.2 and deducting 15840 points.`
          : content;
    } else {
      feedbackData = `Your course (ID ${itemId}) has been reported by another user.`;
    }
    feedbackReason =
      feedbackAction !== "unknown action" ? `Reason: ${content}` : "";
    feedbackDate = `Date: ${new Date(createdAt).toLocaleDateString()}`;

    return [feedbackData, feedbackReason, feedbackDate];
  };
  const mapFeedbackItem = (data) => {
    if (data.length === 0) {
      return <p className={classes.NotFound}>Not Found</p>;
    }
    return data.map((item) => (
      <div key={item.id} className={classes.FeedbackItem}>
        <input
          type="checkbox"
          onChange={() => handleSelectItemFn(item.id)}
          checked={selectAll || selectItemIdArr.includes(item.id)}
        />
        {format(
          item.attributes.type,
          item.attributes.itemId,
          item.attributes.content,
          item.attributes.createdAt
        ).map((text, index) => (
          <p key={index} className={classes.FeedbackItemInfo}>
            {text}
          </p>
        ))}
      </div>
    ));
  };
  const deleteFn = () => {
    if (selectItemIdArr.length > 0) {
      let tempItemArr = [...selectItemIdArr];
      if (navItem === "response") {
        for (let item of selectItemIdArr) {
          responseApi.delResponse(item).then((res) => {
            if (res.isSuccess) {
              tempItemArr = tempItemArr.filter((itemId) => itemId !== item);
              setSelectItemIdArr(tempItemArr);
              fetchResponse();
            }
          });
        }
      } else {
        for (let item of selectItemIdArr) {
          reportApi.delReport(item).then((res) => {
            if (res.isSuccess) {
              tempItemArr = tempItemArr.filter((itemId) => itemId !== item);
              setSelectItemIdArr(tempItemArr);
              fetchReport();
            }
          });
        }
      }
    }
  };
  return (
    <div className={classes.Feedback}>
      <div className={classes.BtnContainer}>
      <button onClick={selectAllFn}>Select all</button>
      <button onClick={deleteFn}>Delete</button>
      </div>
      <div>
        {(isResponseSuccess || isReportSuccess) &&
          (navItem === "response"
            ? mapFeedbackItem(feedbackData)
            : mapFeedbackItem(reportData))}
      </div>
    </div>
  );
};

export default Feedback;
