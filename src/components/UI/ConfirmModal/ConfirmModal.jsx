import Backdrop from "../Backdrop/Backdrop";
import classes from "./ConfirmModal.module.css";
const ConfirmModal = ({ deleteFn, toggleFn, message, courseId = 0 }) => {
  const deleteItemFn = () => {
    if (courseId == 0) {
      deleteFn();
    } else {
      deleteFn(courseId);
    }
  };
  return (
    <Backdrop>
      <div className={classes.ConfirmModal}>
        <p>{message}</p>
        <div>
          <button onClick={deleteItemFn}>Delete</button>
          <button onClick={toggleFn}>cancel</button>
        </div>
      </div>
    </Backdrop>
  );
};

export default ConfirmModal;
