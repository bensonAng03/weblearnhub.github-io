import Backdrop from "../../../../UI/Backdrop/Backdrop";
import classes from "./ManagePoint.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
const ManagePoint = ({maxPoint,point,handlePointInput,rewardRanking,toggleManagePoint}) => {
  console.log(maxPoint)
  return (
    <Backdrop>
      <div className={classes.ManagePoint}>
        <FontAwesomeIcon icon={faXmark} className={classes.DeleteBtn} onClick={toggleManagePoint}/>
        <h3>Point Setting Form</h3>
        <div className={classes.ManagePointItem}>

          <p>{`Point:(min 500,max ${maxPoint})`}</p>
        <input
          type="text"
          value={point}
          onChange={handlePointInput}
          placeholder="Enter the point (min 500)"
        />
        </div>
        <button className={classes.PublishBtn} onClick={rewardRanking}>Publish</button>
      </div>
    </Backdrop>
  );
};

export default ManagePoint;
