import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import classes from "./TextCompiler.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Backdrop from '../../../../UI/Backdrop/Backdrop';

const TextCompiler = ({addNote, updateNote,closeNote, data, username, userId}) => {
  const params = useParams();
  console.log(params.id)
  let noteData = "";
  const editorRef = useRef(null);
  const addNoteFn = () => {
    if (data.length !== 0) {
      updateNote(noteData)
    } else {
      addNote(noteData)
    }
    noteData = "";
  }

  const handleEditorChange = (content, editor) => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    noteData = {
      author: data?.attributes?.author ?? username,
      authorId: data?.attributes?.authorId ?? userId,
      content: content ?? data?.attributes?.content,
      courseId: params.id && params.id ,
      numLikes: data?.attributes?.numLikes ?? 0,
      updatedDate: formattedDate,
    };
  };

  return (
    <Backdrop>
      <div className={classes.TextCompilerContainer}>
        <FontAwesomeIcon icon={faXmark} className={classes.DeleteBtn} onClick={closeNote}/>
        <Editor
          apiKey="ec1vsc6ilhyfk12syevxe8jqbkr6i1v879kw4qbdjmp6vu1a"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={data?.attributes?.content ?? "<p>This is the initial content of the editor.</p>"}
          init={{
            menubar: false,
            height: 500,
            plugins: 'link code',
            branding: false,
            resize: false,
            elementpath: false,
            toolbar:
              'undo redo | bold italic underline | alignleft aligncenter alignright',
          }}
          onEditorChange={handleEditorChange}
        />
        <button onClick={addNoteFn} className={classes.PublishBtn}>Publish</button>
      </div>
    </Backdrop>
  );
};
export default TextCompiler;