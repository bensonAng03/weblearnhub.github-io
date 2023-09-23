import { useRef, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faFile,
  faFileImage,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileVideo,
  faFileAudio,
  faFileArchive,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./FileUploader.module.css";
import assetApi from "../../../store/api/assetApi";

const getIconByFileType = (fileType) => {
  switch (fileType) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/bmp":
    case "image/svg+xml":
      return faFileImage;
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

const FileUploader = ({
  type,
  getFilesInfo,
  data = null,
  assignmentId = 0,
  index = 0,
}) => {
  const [files, setFiles] = useState(data ? data : []);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (assignmentId == 0) {
      getFilesInfo(files);
    }
  }, []);
  const handleUpload = async (e) => {
    if (!isLoading) {
      setIsLoading(true);
      e.preventDefault();
      const file = fileInputRef.current.files[0];
      if (!file) {
        setIsLoading(false);
        return;
      }
      assetApi
        .addAsset(file)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            setIsLoading(false);
            const uploadedFile = {
              name: file.name,
              mime: data[0].mime,
              url: data[0].url,
              id: data[0].id,
            };
            const newFile = [...files, uploadedFile];
            setFiles(newFile);
            if (assignmentId !== 0) {
              getFilesInfo(newFile, assignmentId, index);
            } else {
              getFilesInfo(newFile);
            }
          }
        })
        .catch((error) => {
          // Logic for handling errors
          console.error(error);
          setIsLoading(false);
        });
    }
  };
  const handleRemoveFile = (id) => {
    // Delete files in Strapi media library
    assetApi.deleteAsset(id);
    //Remove files from files array
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    if (assignmentId !== 0) {
      getFilesInfo(updatedFiles, assignmentId, index);
    } else {
      getFilesInfo(updatedFiles);
    }
  };
  return (
    <div className={classes.FilesContainer}>
      <div className={classes.FilesList}>
        {files.length !== 0 &&
          files.map((file) => (
            <div
              className={
                files.length > 3
                  ? classes.File
                  : `${classes.File} ${classes.LessFile}`
              }
              key={file.name + nanoid()}
            >
              {type === "big" && (
                <FontAwesomeIcon
                  className={classes.FileIcon}
                  icon={getIconByFileType(file.mime)}
                />
              )}
              <div className={classes.BottomBox}>
                <span className={classes.FileName}>{file.name}</span>
                <FontAwesomeIcon
                  className={classes.DeleteIcon}
                  icon={faTimes}
                  onClick={() => handleRemoveFile(file.id)}
                />
              </div>
            </div>
          ))}
      </div>

      <div className={classes.UploadArea}>
        <label htmlFor="fileInput" className={classes.UploadButton}>
          {isLoading ? (
            "Loading"
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} />
              Upload
            </>
          )}
        </label>
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>
    </div>
  );
};

export default FileUploader;
