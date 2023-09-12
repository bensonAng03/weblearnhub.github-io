import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import classes from "./AuthForm.module.css";
import { login } from "../../store/reducer/authSlice";
import { authApi } from "../../store/api/authApi";
import { userApi } from "../../store/api/userApi";
const AuthForm = () => {
  const formRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const {type}=useParams()
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [showError, setShowError] = useState(true);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSame, setIsSame] = useState(true);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const usernameChangeHandler = (e) => {
    setRegisterData({ ...registerData, username: e.target.value });
  };
  const emailChangeHandler = (e) => {
    setRegisterData({ ...registerData, email: e.target.value });
  };
  const passwordChangeHandler = (e) => {
    setRegisterData({ ...registerData, password: e.target.value });
  };
  const confirmPasswordChangeHandler = (e) => {
    setConfirmPassword(e.target.value);
  };
  const toggleFormHandler = (e) => {
    e.preventDefault();
    const labels = Array.from(formRef.current.querySelectorAll("label"));
    labels.forEach((label) => {
      label.style.color = "";
    });
    setIsLoginForm((prevState) => !prevState);
    setRegisterData({
      username: "",
      email: "",
      password: "",
    });
    setError("");
    setConfirmPassword("");
    setShowError(false);
    setIsSame(true);
  };
  const submitHandler = (e) => {
    e.preventDefault();
    setShowError(true);
    if (isLoginForm) {
            authApi
        .login({
          identifier: registerData.username,
          password: registerData.password,
        })
        .then((res) => {
          if (res && res.jwt) {
            dispatch(
              login({
                token: res.jwt,
                user: res.user
              })
            );
            const from = location.state?.preLocation?.pathname || "/";
            // navigate("/welfare/library",{replace:true})
            navigate(from, { replace: true });
          }
          if(localStorage.getItem("user")!==undefined){
            userApi
          .getUserById(JSON.parse(localStorage.getItem("user"))?.id)
          .then((response) => {
            const { data, isSuccess } = response;
            if (isSuccess) {
              console.log(data)
              const userData=JSON.parse(localStorage.getItem("user"))
              userData.role=data.role.type
              localStorage.setItem("user",JSON.stringify(userData))
              console.log(userData.role)  
              window.location.reload()
            } else {
              console.error("Error:", response.error);
              window.location.reload()
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
          }
        })
        .catch((error) => {
          setError(error.message);
          console.log(error.message);
        });
    } else {
      let isFormValid = true;
      const labels = Array.from(formRef.current.querySelectorAll("label"));
      labels.forEach((label) => {
        const input = label.nextSibling;
        if (input.value.trim() === "") {
          isFormValid = false;
          label.style.color = "red";
        } else {
          label.style.color = "";
        }
      });
      if (
        confirmPassword.trim() !== "" &&
        registerData.password === confirmPassword
      ) {
        passwordRef.current.style.color = "";
        confirmPasswordRef.current.style.color = "";
        setIsSame(true);
        authApi
          .register(registerData)
          .then((res) => {
            if (!res.error) {
              setIsLoginForm(true);
              setRegisterData({
                username: "",
                email: "",
                password: "",
              });
              setError("");
            }
          })
          .catch((error) => {
            setError(error.message);
          });
      } else {
        passwordRef.current.style.color = "red";
        confirmPasswordRef.current.style.color = "red";
        if (confirmPassword.trim() !== "") {
          setIsSame(false);
        }
      }
    }
  };
  return (
    <div className={classes.FormModel}>
      <form onSubmit={submitHandler} ref={formRef}>
        <h3>{isLoginForm ? "Login" : "Register"}</h3>
        <p>
          {showError && error && error}
          {/* {error && error} */}
        </p>
        <label id={classes.NameLabel}>Name:</label>
        <input
          onChange={usernameChangeHandler}
          value={registerData.username}
          type="text"
        />
        {!isLoginForm && (
          <>
            <label>Email:</label>
            <input
              onChange={emailChangeHandler}
              value={registerData.email}
              type="email"
            />
          </>
        )}
        <label ref={passwordRef}>Password:</label>
        <input
          onChange={passwordChangeHandler}
          value={registerData.password}
          type="password"
        />
        {!isLoginForm && (
          <>
            <p>{!isSame && "Password and confirm password are different!"}</p>
            <label ref={confirmPasswordRef} id={classes.ConfirmPasswordLabel}>
              Confirm Password:
            </label>
            <input
              onChange={confirmPasswordChangeHandler}
              value={confirmPassword}
              type="password"
            />
          </>
        )}
        <div className={classes.Buttons}>
          <button>{isLoginForm ? "Login" : "Register"}</button>
          <button onClick={toggleFormHandler}>
            Change to {isLoginForm ? "Register" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
