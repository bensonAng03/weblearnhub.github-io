import Backdrop from "../../UI/Backdrop/Backdrop";
import classes from "./RechargePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faXmark } from "@fortawesome/free-solid-svg-icons";
const RechargePage = ({ toggleFn, rechargedFn }) => {
  return (
    <Backdrop>
      <div className={classes.RechargePage}>
        <FontAwesomeIcon
          icon={faXmark}
          className={classes.DeleteBtn}
          onClick={toggleFn}
        />
        <div className={classes.TopBox}>
          <li
            onClick={() => {
              rechargedFn(10);
            }}
          >
            <p>RM10</p>
            <p className={classes.Point}>8000
            <FontAwesomeIcon icon={faCoins}/>
            </p>
          </li>
          <li
            onClick={() => {
              rechargedFn(20);
            }}
          >
            <p>RM20</p>
            <p className={classes.Point}>16800
            <FontAwesomeIcon icon={faCoins}/>
            </p>
          </li>
          <li
            onClick={() => {
              rechargedFn(50);
            }}
          >
            <p>RM50</p>
            <p className={classes.Point}>43200<FontAwesomeIcon icon={faCoins}/>
            </p>
          </li>
        </div>
        <div className={classes.BottomBox}>
          <li
            onClick={() => {
              rechargedFn(100);
            }}
          >
            <p>RM100</p>
            <p className={classes.Point}>88800<FontAwesomeIcon icon={faCoins}/></p>
          </li>
          <li
            onClick={() => {
              rechargedFn(200);
            }}
          >
            <p>RM200</p>
            <p className={classes.Point}>182400<FontAwesomeIcon icon={faCoins}/></p>

          </li>
        </div>
      </div>
    </Backdrop>
  );
};

export default RechargePage;
