import { useEffect, useState } from "react";
import classes from "./RankingBoard.module.css";
import { rankApi } from "../../../../store/api/rankApi";
import { quizRankApi } from "../../../../store/api/quizRankApi";
import { noteRankApi } from "../../../../store/api/noteRankApi";
import { useParams } from "react-router-dom";
import ManagePoint from "./ManagePoint/ManagePoint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { courseApi } from "../../../../store/api/courseApi";
import { userApi } from "../../../../store/api/userApi";
let studentsArr = [];
let ratio = {
  more: [35, 20, 10, 5, 5, 5, 5, 5, 5, 5],
  three: [50, 30, 20],
  two: [60, 40],
  one: [100],
};
let userId = JSON.parse(localStorage.getItem("user"))?.id;
const RankingBoard = ({ username }) => {
  const { id } = useParams();
  const [rankingsType, setRankingsType] = useState("quiz");
  const [rankingData, setRankingData] = useState([]);
  const [quizRankingData, setQuizRankingData] = useState([]);
  const [noteRankingData, setNoteRankingData] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scoreType, setScoreType] = useState("quiz");
  const [point, setPoint] = useState(0);
  const [isManagePoint, setIsManagePoint] = useState(false);
  const [amountPoint, setAmountPoint] = useState(0);
  const [authorId, setAuthorId] = useState(0);
  const sortFn = (data) => {
    data.sort((a, b) => {
      const scoreA = +a.attributes.score;
      const scoreB = +b.attributes.score;
      console.log(scoreA, scoreB);
      return scoreB - scoreA;
    });
  };
  const getRanks = async (index, type = scoreType) => {
    switch (type) {
      case "total":
        try {
          const response = await rankApi.getRanks(index,id,studentsArr);
          const { data, isSuccess } = response;
          if (isSuccess) {
            sortFn(data);
            setRankingData((prevData) => [...prevData, ...data]);
            setIsSuccess(true);
          } else {
            console.error("Error:", response.error);
            setRankingData([]);
            setIsSuccess(false);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        break;
      case "quiz":
        try {
          const response = await quizRankApi.getQuizRanks(index, id,studentsArr);
          const { data, isSuccess } = response;
          if (isSuccess) {
            sortFn(data);
            setQuizRankingData((prevData) => [...prevData, ...data]);
            setIsSuccess(true);
          } else {
            console.error("Error:", response.error);
            setQuizRankingData([]);
            setIsSuccess(false);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        break;
      case "note":
        try {
          const response = await noteRankApi.getNoteRanks(index,id,studentsArr);
          const { data, isSuccess } = response;
          if (isSuccess) {
            sortFn(data);
            setNoteRankingData((prevData) => [...prevData, ...data]);
            setIsSuccess(true);
          } else {
            console.error("Error:", response.error);
            setNoteRankingData([]);
            setIsSuccess(false);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        break;
    }
  };

  const handleRankingsTypeChange = (type) => {
    setRankingsType(type);
    setScoreType(type);
    setRankingData([]);
    setNoteRankingData([]);
    setQuizRankingData([]);
    getRanks(0, type);
  };

  useEffect(() => {
    setRankingData([]);
    setQuizRankingData([]);
    setNoteRankingData([]);
    fetchUserInfo();
    courseApi.getCourseById(id).then((response) => {
      const { data, isSuccess } = response;
      if (isSuccess) {
        studentsArr = data.attributes.students;
        setAuthorId(data.attributes.authorId)
        getRanks(0, scoreType);
      }
    });
  }, []);
  const handlePointInput = (e) => {
    setPoint(e.target.value);
  };

  const rewardRanking = async () => {
    console.log("point:" + point, "amountPoint:" + amountPoint);
    console.log(rankingsType);
    console.log("amountPoint:" +amountPoint)
    if (point === 0 || point < 500 || point > +amountPoint) {
      return;
    }
    console.log("1")
  
    let rankData;
    switch (rankingsType) {
      case "total":
        rankData = rankingData;
        break;
      case "quiz":
        rankData = quizRankingData;
        break;
      case "note":
        rankData = noteRankingData;
        break;
      default:
        rankData = [];
        break;
    }
  
    if (rankData.length === 0) {
      return;
    }
  
    const response = await userApi.getUserById(userId);
    const { isSuccess, data } = response;
    const newPointAfterDeduction = +data.point - point;
  
    if (newPointAfterDeduction >= 0 && isSuccess) {
      try {
        await userApi.updateUser({ point: newPointAfterDeduction }, userId);
        console.log("2");
        const rewardRatio =
          rankData.length > 3
            ? ratio.more
            : rankData.length === 3
            ? ratio.three
            : rankData.length === 2
            ? ratio.two
            : ratio.one;
        let remainingPoint = 0;
        if (rankData.length < ratio.more.length) {
          remainingPoint =
            point *
            (1 - rewardRatio.reduce((sum, value) => sum + value, 0) / 100);
            console.log(remainingPoint)
        }
  
        console.log(rankData);
  
        for (let i = 0; i < rankData.length; i++) {
          const rank = rankData[i];
          const response = await userApi.getUserById(rank.attributes.userId);
          const { isSuccess, data } = response;
          if (isSuccess) {
            let pointToAdd = (point * rewardRatio[i]) / 100;
  
            if (remainingPoint > 0 && i === 0) {
              pointToAdd += remainingPoint;
              remainingPoint = 0;
            }
  
            let newPoint = pointToAdd + (+data.point || 0);
            console.log("userId:"+rank.attributes.userId,"add:"+pointToAdd)
            const updateResponse = await userApi.updateUser(
              { point: newPoint },
              rank.attributes.userId
            );
  
            if (updateResponse.isSuccess) {
              fetchUserInfo();
              setIsManagePoint(false);
              console.log(updateResponse.data)
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  

  const toggleManagePoint = () => {
    setIsManagePoint((prevState) => !prevState);
  };
  const fetchUserInfo = () => {
    userApi
      .getUserById(userId)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          console.log(data);
          setAmountPoint(data.point);
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <>
      {isSuccess && (
        <div className={classes.RankContainer}>
          <h2>Ranking Board</h2>
          <div className={classes.RankButtons}>
            <button
              className={rankingsType === "quiz" ? classes.Active : ""}
              onClick={() => handleRankingsTypeChange("quiz")}
            >
              Quiz
            </button>
            <button
              className={rankingsType === "note" ? classes.Active : ""}
              onClick={() => handleRankingsTypeChange("note")}
            >
              Note
            </button>
            <button
              className={rankingsType === "total" ? classes.Active : ""}
              onClick={() => handleRankingsTypeChange("total")}
            >
              All
            </button>
            {authorId == userId && (
            <FontAwesomeIcon
              icon={faCog}
              onClick={toggleManagePoint}
              className={classes.SetBtn}
            />
            )}
            {isManagePoint && (
              <ManagePoint
                maxPoint={amountPoint}
                point={point}
                handlePointInput={handlePointInput}
                rewardRanking={rewardRanking}
                toggleManagePoint={toggleManagePoint}
              />
            )}
          </div>
          <table className={classes.RankTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Ranking Score</th>
              </tr>
            </thead>
          </table>
          <div className={classes.RankBodyContainer}>
            <table className={classes.RankBody}>
              <tbody>
                <>
                  {rankingsType === "total" &&
                    rankingData.map((ranking, index) => {
                      const isCurrentUser =
                        ranking.attributes.username === username;
                      const MyUsername = isCurrentUser
                        ? classes.MyUsername
                        : "";
                      return (
                        <tr key={index} className={MyUsername}>
                          <td>{index + 1}</td>
                          <td>{ranking.attributes.username}</td>
                          <td>{ranking.attributes.score}</td>
                        </tr>
                      );
                    })}
                  {rankingsType === "quiz" &&
                    quizRankingData.map((ranking, index) => {
                      const isCurrentUser =
                        ranking.attributes.username === username;
                      const MyUsername = isCurrentUser
                        ? classes.MyUsername
                        : "";
                      return (
                        <tr key={index} className={MyUsername}>
                          <td>{index + 1}</td>
                          <td>{ranking.attributes.username}</td>
                          <td>{ranking.attributes.score}</td>
                        </tr>
                      );
                    })}
                  {rankingsType === "note" &&
                    noteRankingData.map((ranking, index) => {
                      const isCurrentUser =
                        ranking.attributes.username === username;
                      const MyUsername = isCurrentUser
                        ? classes.MyUsername
                        : "";
                      return (
                        <tr key={index} className={MyUsername}>
                          <td>{index + 1}</td>
                          <td>{ranking.attributes.username}</td>
                          <td>{ranking.attributes.score}</td>
                        </tr>
                      );
                    })}
                </>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default RankingBoard;
