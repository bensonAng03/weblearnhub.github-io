import Backdrop from "../../UI/Backdrop/Backdrop";
import classes from "./ConfirmModal.module.css"

const ConfirmModal=({info,confirmFn,cancelFn})=>{
  return (
    <Backdrop>
      <div className={classes.ConfirmModal}>
        <h2>Confirm Action</h2>
        <p>{info.message}</p>
        <div>
          <button onClick={()=>confirmFn(info.screenPublisherId,info.publisherId,info.userId)}>Confirm</button>
          <button onClick={()=>cancelFn(info.userId)}>Cancel</button>
        </div>
      </div>
    </Backdrop>
  );
}

export default ConfirmModal;
