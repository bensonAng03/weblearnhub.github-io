import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faThumbsUp,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import TextCompiler from "./TextCompiler/TextCompiler";
import { noteApi } from "../../../../store/api/noteApi";
import { likeApi } from "../../../../store/api/likeApi";
import classes from "./NoteCategory.module.css";
import { noteRankApi } from "../../../../store/api/noteRankApi";
import IssuanceApplicationForm from "../../../UI/IssuanceApplicationForm/IssuanceApplicationForm";
let username = JSON.parse(localStorage.getItem("user"))?.username;
let userId = JSON.parse(localStorage.getItem("user"))?.id;
const NoteCategory = ({ scope }) => {
  const { id } = useParams();
  const [isEditNote, setIsEditNote] = useState(false);
  const [notesData, setNotesData] = useState([]);
  const [noteData, setNoteData] = useState("");
  const [noteId, setNoteId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [barContainers, setBarContainers] = useState({});
  const [isReportNote, setIsReportNote] = useState(false);
  const [isLikesList, setIsLikesList] = useState(
    new Array(notesData?.length).fill(false)
  );
  useEffect(() => {
    fetchNotes();
  }, []);
  useEffect(() => {
    fetchNotes();
  }, [id]);

  const fetchNotes = async() => {
    setIsLikesList([])
      noteApi
        .getNotes(scope==0? "" :id)
        .then((response) => {
          const { data:noteData, isSuccess } = response;
          if (isSuccess) {
            console.log(noteData)
            setNotesData(noteData);
            likeApi.getLikes()
            .then((response) => {
              const { data: likeData, isSuccess: isLikeSuccess } = response;
              if (isLikeSuccess) {
                let newLikesList = [];
                for (let note of noteData) {
                  const matchingLike = likeData.some(
                    (like) => like.attributes.noteId == note.id
                  );
                  newLikesList.push({
                    id: note.id,
                    status: matchingLike ? true : false,
                  });
                }
                setIsLikesList(newLikesList);
              }
            })
            .catch((error) => {
              console.log(error);
            });
            setIsSuccess(true);
          } else {
            console.error("Error:", response.error);
            setNotesData([]);
            setIsSuccess(false);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    
  };

  const addNote = (noteDataTemp) => {
    noteApi
      .addNote(noteDataTemp)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setIsEditNote(false);
          fetchNotes();
          // updateNoteRank();
        } else {
          console.error("Failed to add note:", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const updateNoteFn = (noteDataTemp, noteIdParam = noteId) => {
    noteApi
      .updateNote(noteDataTemp, noteIdParam)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          setIsEditNote(false);
          setNoteData("");
          fetchNotes();
          console.log("Note updated successfully:", data);
        } else {
          console.error("Failed to update note:", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteNoteFn = (noteIdParam) => {
    noteApi
      .delNote(noteIdParam)
      .then((response) => {
        const { isSuccess } = response;
        if (isSuccess) {
          fetchNotes();
          console.log("Note deleted successfully");
        } else {
          console.error("Failed to delete note");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const updateNote = (noteIdParam) => {
    setIsEditNote(true);
    noteApi
      .getNoteById(noteIdParam)
      .then((response) => {
        const { isSuccess, data } = response;
        if (isSuccess) {
          setNoteData(data);
          setNoteId(noteIdParam);
        } else {
          console.error("Failed to edit note");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const toggleLike = async (id, authorId,courseId) => {
    if (!isLoading) {
      if (authorId == userId) return;
      let status=false;
      for(let item of isLikesList){
        if(item.id==id){
          console.log(item)
          status=item.status
        }
      }
        if (!status) {
          await likeApi.addLike({
            noteId: id,
            userId,
          });
          const prevNote = await noteApi.getNoteById(id);
          await noteApi.updateNote(
            {
              numLikes: +prevNote.data.attributes.numLikes + 1,
            },
            id
          );
          await noteRankApi
            .getNoteRankById(authorId,courseId)
            .then((response) => {
              const { data, isSuccess } = response;
              if (isSuccess) {
                console.log(data)
                noteRankApi
                  .updateNoteRank(
                    {
                      ...data[0].attributes,
                      score: +data[0].attributes.score + 150,
                    },
                    data[0].id
                  )
                  .then((response) => {
                    const { data, isSuccess } = response;
                    if (isSuccess) {
                      fetchNotes();
                      console.log(data);
                    }
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        } else {
          console.log("123")
          const likeData = await likeApi.getLikes(id);
          if (
            likeData.isSuccess &&
            likeData.data[0]?.attributes !== undefined
          ) {
            await likeApi.delNote(likeData.data[0].id);
            const prevNote = await noteApi.getNoteById(id);
            await noteApi.updateNote(
              {
                numLikes: +prevNote.data.attributes.numLikes - 1,
              },
              id
            );
            await noteRankApi
              .getNoteRankById(authorId,courseId)
              .then((response) => {
                const { data, isSuccess } = response;
                console.log(data);
                if (isSuccess && data[0]?.attributes !== undefined) {
                  const newScore = +data[0].attributes.score - 150; // 取消点赞减 150 分
                  noteRankApi
                    .updateNoteRank(
                      {
                        ...data[0].attributes,
                        score: newScore,
                      },
                      data[0].id
                    )
                    .then((response) => {
                      const { data, isSuccess } = response;
                      if (isSuccess) {
                        console.log(data);
                        fetchNotes();
                      } else {
                        console.error("Failed to update note rank");
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                      setIsLoading(false);
                    });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                setIsLoading(false);
              });
          }
        }
    }
  };
  const closeNoteFn = () => {
    setIsEditNote(false);
  };

  const publishNote = () => {
    setIsEditNote(true);
  };
  const reportNoteFn = () => {
    setIsReportNote(!isReportNote);
  };
  const handleMouseLeave = (noteId) => {
    setBarContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [noteId]: false,
    }));
  };
  const toggleBarContainer = (noteId) => {
    console.log(noteId);
    setBarContainers((prevEditContainers) => ({
      ...prevEditContainers,
      [noteId]: !prevEditContainers[noteId],
    }));
  };
  return (
    <>
      {isSuccess ? (
        <>
          {notesData && notesData?.length == 0 ? (
            <div className={classes.NotResourse}>
              You can create your note by using the publish note button.
            </div>
          ) : (
            <div className={classes.NoteList}>
              {notesData && notesData.map((note) => (
                <div key={note.id} className={classes.NoteItem}>
                  {isReportNote && (
                    <IssuanceApplicationForm
                      itemId={note.id}
                      type={"reportNote"}
                      closeFn={reportNoteFn}
                    />
                  )}
                  {note.attributes.authorId == userId ? (
                    <>
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className={classes.BarBtn}
                        onClick={() => toggleBarContainer(note.id)}
                      />
                      <ul
                        className={` ${classes.NoteBarList} ${
                          barContainers[note.id] ? classes.ShowClass : ""
                        }`}
                        onMouseLeave={() => handleMouseLeave(note.id)}
                      >
                        <li
                          onClick={() => {
                            toggleBarContainer(note.id);
                            updateNote(note.id);
                          }}
                        >
                          Edit
                        </li>
                        <li
                          onClick={() => {
                            toggleBarContainer(note.id);
                            deleteNoteFn(note.id);
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    </>
                  ) : (
                    <FontAwesomeIcon
                      icon={faWarning}
                      className={classes.ReportBtn}
                      onClick={() => {
                        toggleBarContainer(note.id);
                        reportNoteFn();
                      }}
                    />
                  )}
                  <h3>{note.attributes.author}</h3>
                  <div>
                    <div
                      className={classes.Content}
                      dangerouslySetInnerHTML={{
                        __html: note.attributes.content,
                      }}
                    />
                  </div>
                  <p className={classes.Timestamp}>
                    {note.attributes.updatedDate}
                  </p>
                  <div className={classes.LikesContainer}>
                    <FontAwesomeIcon
                      onClick={() =>
                        toggleLike(note.id, note.attributes.authorId,note.attributes.courseId)
                      }
                      icon={faThumbsUp}
                      className={`${isLikesList.some(item => item.id === note.id && item.status) ? classes.ColorRed : ""}`}
                      style={{
                        color: note.attributes.authorId == userId ? "gray" : "",
                      }}
                    />

                    <p>
                      {note.attributes.numLikes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isEditNote && (
            <TextCompiler
              addNote={addNote}
              updateNote={updateNoteFn}
              closeNote={closeNoteFn}
              data={noteData}
              username={username}
              userId={userId}
            />
          )}
          <div className={classes.PublishBox}>
            <button onClick={publishNote}>Publish Note</button>
          </div>
        </>
      ) : (
        <>Loading...</>
      )}
    </>
  );
};

export default NoteCategory;
