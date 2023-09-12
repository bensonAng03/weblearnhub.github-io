import { useState, useEffect } from "react";
import Card from "../../../UI/Card/Card";
import classes from "./CourseCategory.module.css";
import { Link, useParams } from "react-router-dom";
import topicApi from "../../../../store/api/topicApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileVideo,
  faFileAudio,
  faFileArchive,
  faTrash,
  faEdit,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import assetApi from "../../../../store/api/assetApi";
let userId = JSON.parse(localStorage.getItem("user"))?.id;
const CourseCategory = () => {
  const params = useParams();
  const [topicsData, setTopicsData] = useState({});
  const [isSuccess, setIsSuccess] = useState({});
  const [descriptions, setDescriptions] = useState([]);
  const [authorId, setAuthorId] = useState("");
  useEffect(() => {
    getTopics();
  }, [params.id]);
  useEffect(() => {
    // 初始化 showDescriptions 数组，长度与 assignmentsData.assignments.data 相同
    setDescriptions(Array(topicsData?.topics?.data.length).fill(false));
  }, [topicsData]);
  const getTopics = () => {
    topicApi
      .getTopicsById(params.id)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setTopicsData(data.attributes);
          setAuthorId(data.attributes.authorId)
          setIsSuccess(true);
        } else {
          console.error("Error:", response.error);
          setTopicsData({});
          setIsSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const getIconByMime = (mime) => {
    switch (mime) {
      case "application/pdf":
        return faFilePdf;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/vnd.oasis.opendocument.text":
      case "application/rtf":
      case "text/plain":
        return faFileWord;
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.oasis.opendocument.spreadsheet":
      case "text/csv":
        return faFileExcel;
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.oasis.opendocument.presentation":
      case "application/vnd.ms-powerpoint.addin.macroEnabled.12":
      case "application/vnd.ms-powerpoint.presentation.macroEnabled.12":
      case "application/vnd.ms-powerpoint.slideshow.macroEnabled.12":
        return faFilePowerpoint;
      case "audio/mpeg":
      case "audio/x-m4a":
      case "audio/ogg":
      case "audio/wav":
        return faFileAudio;
      case "video/mp4":
      case "video/quicktime":
      case "video/x-msvideo":
      case "video/x-flv":
      case "video/webm":
        return faFileVideo;
      case "application/zip":
      case "application/x-rar-compressed":
      case "application/x-7z-compressed":
        return faFileArchive;
      default:
        return faFile;
    }
  };
  const deleteTopic = async(id,asset) => {
    let deleteAssetResponse;
    if(asset.length){
      for (const item of asset){
        deleteAssetResponse= await assetApi.deleteAsset(item.id)
      }
    }
    if(asset.length==0 || deleteAssetResponse?.isSuccess){
      topicApi
        .delTopic(id)
        .then((response) => {
          const {isSuccess } = response;
          if (isSuccess) {
            getTopics();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  return (
    <>
      {isSuccess ? (
        topicsData.topics?.data.length !== 0 ? (
          topicsData.topics?.data.map((topicsItem, topicsIndex) => (
            <Card
              className={classes.CourseContainer}
              key={topicsIndex}
              shadow="false"
            >
              <div className={classes.TopBox}>
                <h2 className={classes.CourseTitle}>
                  {topicsItem.attributes.title}
                </h2>
                {authorId==userId&&
                <div className={classes.IconContainer}>
                  <Link to={`/courses/${params.id}/publish/course/${topicsItem.id}`}>
                  <FontAwesomeIcon
                    className={classes.FaIcon}
      
                    icon={faEdit}
                  />
                  </Link>
                  <FontAwesomeIcon
                    className={classes.FaIcon}
                    onClick={() => deleteTopic(topicsItem.id,topicsItem.attributes.asset)}
                    icon={faTrash}
                  />
                </div>
                }
              </div>
              <div className={classes.BottomBox}>
                {topicsItem.attributes.description && (
                  <p
                    className={
                      descriptions[topicsIndex]
                        ? classes.SmallDescription
                        : classes.BigDescription
                    }
                  >
                    {topicsItem.attributes.description}
                  </p>
                )}
                {topicsItem.attributes.description.length > 100 && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={classes.FaChevronDownIcon}
                    onClick={() =>
                      setDescriptions((prevState) => {
                        const newShowDescriptions = [...prevState];
                        newShowDescriptions[topicsIndex] =
                          !newShowDescriptions[topicsIndex];
                        return newShowDescriptions;
                      })
                    }
                  />
                )}
                {topicsItem?.attributes?.asset !== undefined && (
                  <div className={classes.AssetsContainer}>
                    {topicsItem.attributes.asset.map((item, index) => {
                      let content;
                      if (item.mime.startsWith("image/")) {
                        content = (
                          <div className={classes.CourseImg} key={index}>
                            <Link
                                to={`http://localhost:1337${item.url}`}
                                target="_blank"
                              >
                            <img
                              
                              src={`http://localhost:1337${item.url}`}
                              alt="Course Image"
                            />
                              </Link>
                          </div>
                        );
                      } else {
                        content = (
                          <div className={classes.CourseFile} key={index}>
                            <Link to={`http://localhost:1337${item.url}`}>
                            <FontAwesomeIcon
                              icon={getIconByMime(item.mime)}
                              className={classes.FileIcon}
                            />
                              <p className={classes.Title}>{item.name}</p>
                              </Link>
                          </div>
                        );
                      }

                      return content;
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className={classes.NotResourse}>
            You can make your courses and give out assignments using the publish
            button.
          </div>
        )
      ) : (
        <>loading...</>
      )}
    </>
  );
};

export default CourseCategory;
