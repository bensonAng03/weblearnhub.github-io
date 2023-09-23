import React, { useState, useEffect } from "react";
import classes from "./RandomNamePicker.module.css";
import { faUsers, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
let publisherName = JSON.parse(localStorage.getItem("user"))?.username;
const RandomNamePicker = ({ users }) => {
  const [remainingUsernames, setRemainingUsernames] = useState([]);
  const [allUsernames, setAllUsernames] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [isShowUserList, setIsShowUserList] = useState(false);
  useEffect(() => {
    resetFn()
  }, []);

  const randomNameEffectFn = () => {
    let timerInterval;
    let timer;
    if (timerInterval) clearInterval(timerInterval);
    if (timer) clearTimeout(timer);
    let tempIndex;
    timerInterval = setInterval(() => {
      tempIndex = Math.floor(Math.random() * remainingUsernames.length);
      setSelectedUsername(remainingUsernames[tempIndex]);
    }, 200);
  
    timer = setTimeout(() => {
      clearInterval(timerInterval);
      const resultIndex = tempIndex;
      if (resultIndex !== undefined) {
        let newRemainingUsernames = [...remainingUsernames];
        newRemainingUsernames.splice(resultIndex, 1);
        setRemainingUsernames(newRemainingUsernames);
      }
    }, 3000);
  };
  

  const pickRandomUsername = () => {
    if (remainingUsernames.length === 0) {
      alert("All usernames have been selected!");
      return;
    }
    if (remainingUsernames.length === 1) {
      setSelectedUsername(remainingUsernames[0]);
      setRemainingUsernames([]);
    } else {
      randomNameEffectFn();
    }
  };
  const resetFn = () => {
    const usernames = users.map((user) => user.username);
    const filteredUsernames = usernames.filter(
      (username) => username !== publisherName
    );
    setAllUsernames(filteredUsernames);
    setRemainingUsernames(filteredUsernames);
    setSelectedUsername([]);
    setSelectedUsername(null)
  };

  return (
    <div className={classes.RandomNamePicker}>
      {isShowUserList && (
        <ul className={classes.UserList}>
          <FontAwesomeIcon
            icon={faTimes}
            className={classes.DeleteBtn}
            onClick={() => setIsShowUserList(false)}
          />
          {allUsernames.map((username, index) => (
            <li
              key={index}
              className={
                remainingUsernames.indexOf(username) > -1
                  ? classes.UserListItem
                  : classes.UserListItemSelected
              }
            >
              {username}
            </li>
          ))}
        </ul>
      )}
      <div className={classes.Header}>
        <h2>Random Username Picker</h2>
        <FontAwesomeIcon
          icon={faUsers}
          className={classes.ShowBtn}
          onClick={() => setIsShowUserList(true)}
        />
      </div>
      <div className={classes.CurrentUsername}>
        {selectedUsername || "No selection"}
      </div>
      <button className={classes.Button} onClick={pickRandomUsername}>
        Random Select
      </button>
      <button className={classes.Button} onClick={resetFn}>
        Reset
      </button>
    </div>
  );
};

export default React.memo(RandomNamePicker);
