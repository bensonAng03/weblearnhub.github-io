import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faPlus } from "@fortawesome/free-solid-svg-icons";
import classes from "./Point.module.css";
const Point = ({toggleFn,point}) => {
  return (
    <div className={classes.PointContainer}>
      <span>
        {point ? point :0}
        <FontAwesomeIcon icon={faCoins} />
      </span>
      <button className={classes.AddPointBtn} onClick={toggleFn}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default Point;
