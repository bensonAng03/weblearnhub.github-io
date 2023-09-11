import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPaper, faUsers } from '@fortawesome/free-solid-svg-icons';
import classes from "./RaiseHand.module.css";

const RaiseHand = ({ raiseHandList}) => {
  return (
    <div className={classes.RaiseHand}>
      <ul className={classes.RaiseHandList}>
        <li className={classes.RaiseHandTitle}>
          <FontAwesomeIcon icon={faUsers} className={classes.Icon} />
          Raise Hand Persons
        </li>
        {raiseHandList.length>0 ?
        raiseHandList?.map((item, index) => (
          <li key={index} id={item.userId} className={classes.RaiseHandPerson}>
            <FontAwesomeIcon icon={faHandPaper} className={classes.Icon} />
            {item.name}
          </li>
        ))
      :<li>Not Found</li>}
      </ul>
    </div>
  );
};

export default RaiseHand;
