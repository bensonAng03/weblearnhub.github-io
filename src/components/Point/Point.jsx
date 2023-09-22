import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faPlus } from "@fortawesome/free-solid-svg-icons";
import classes from "./Point.module.css";
import { useSelector } from "react-redux";
const Point = ({toggleFn}) => {
  const curentPoint=useSelector(state=>state.point);
  return (
    <div className={classes.PointContainer}>
      <span>
        {curentPoint.point}
        <FontAwesomeIcon icon={faCoins} />
      </span>
      <button className={classes.AddPointBtn} onClick={toggleFn}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default Point;
