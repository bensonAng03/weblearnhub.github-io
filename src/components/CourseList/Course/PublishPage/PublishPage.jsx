import FileUploader from "../../../UI/FileUploader/FileUploader";
import classes from "./PublishPage.module.css";
import { useEffect, useState } from "react";
import {topicApi} from "../../../../store/api/topicApi";
import {assignmentApi} from "../../../../store/api/assignmentApi";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
const PublishPage = () => {
  const { id: courseId, item_type: itemType, item_id: itemId } = useParams();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("course");
  const [description, setDescription] = useState("");
  const [asset, setAsset] = useState("");
  const [isSuccess,setIsSuccess]=useState(false)
  const navigate = useNavigate(null);
  useEffect(() => {
    fetchPublishData();
  }, []);
  const fetchPublishData = async () => {
    setIsSuccess(false)
    if (itemType == "classwork") {
      const classworkResponse = await assignmentApi.getAssignmentById(itemId);
      if (classworkResponse.isSuccess) {
        const { title, description, asset } = classworkResponse.data.attributes;
        setType(itemType);
        setTitle(title);
        setDescription(description);
        setAsset(asset);
        setIsSuccess(true)
      }
    }else if (itemType == "course") {
      const courseResponse = await topicApi.getTopicById(itemId);
      if (courseResponse.isSuccess) {
        const { title, description, asset } = courseResponse.data.attributes;
        setType(itemType);
        setTitle(title);
        setDescription(description);
        setAsset(asset);
        setIsSuccess(true)
      }
    }else if(itemType=="none"){
      setIsSuccess(true)
    }
  };
  const getFilesInfo = (files) => {
    console.log(files)
    setAsset(files);
  };
  const closePublishModal = () => {
    navigate(-1, { replace: true });
  };
  const publishSomething = () => {
    if (title === "") {
      console.log("Title cannot be empty!");
    }
    console.log(itemId)
    if (itemId != 0) {
      if (type == "course") {
        topicApi
          .updateTopic(
            {
              title,
              description,
              asset,
              courses: courseId,
            },
            itemId
          )
          .then((response) => {
            const {isSuccess } = response;
            if (isSuccess) {
              setAsset("");
              setTitle("");
              setDescription("");
              setType("Course");
              closePublishModal();
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else if (type == "classwork") {
        assignmentApi
          .updateAssignment(
            {
              title,
              description,
              asset,
              courses: courseId,
            },
            itemId
          )
          .then((response) => {
            const { isSuccess } = response;
            if (isSuccess) {
              setAsset("");
              setTitle("");
              setDescription("");
              setType("Classwork");
              closePublishModal();
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    } else {
      if (type == "course") {
        topicApi
          .addTopic({
            title,
            description,
            asset,
            courses: courseId,
          })
          .then((response) => {
            const { isSuccess } = response;
            if (isSuccess) {
              setAsset("");
              setTitle("");
              setDescription("");
              setType("Course");
              closePublishModal();
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else if (type == "classwork") {
        assignmentApi
          .addAssignment({
            title,
            description,
            asset,
            courses: courseId,
          })
          .then((response) => {
            const { isSuccess } = response;
            if (isSuccess) {
              setAsset("");
              setTitle("");
              setDescription("");
              setType("Classwork");
              closePublishModal();
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };
  return (
      <div className={classes.PubishContainer}>
      <FontAwesomeIcon icon={faXmark} className={classes.CloseBtn} onClick={closePublishModal}/>
      {itemId == 0 && (
      <div className={classes.SelectContainer}>
           <select
           name="type"
           onChange={(e) => {
             setType(e.target.value);
           }}
           value={type}
         >
           <option value="course">Course</option>
           <option value="classwork">Classwork</option>
         </select>
      </div>
        )}
        <div className={classes.FlexBox}>
          <div className={classes.ColumnBox}>
            <div className={classes.TitleContainer}>
              <label id="title">Title:</label>
              <input
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                value={title}
                type="text"
                id="title"
              />
            </div>
            <div className={classes.DescriptionContainer}>
              <label id="description">Description:</label>
              <textarea
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                value={description}
                type="text"
                id="description"
              />
            </div>
          </div>
          {isSuccess && (
            <div className={classes.FileUploaderContainer}>
              <FileUploader
                type="big"
                getFilesInfo={getFilesInfo}
                data={asset || ""}
              />
            </div>
          )}
        </div>
        <button className={classes.PublishBtn} onClick={publishSomething}>Publish</button>
      </div>
  );
};

export default PublishPage;
