import { useEffect, useState } from "react";
import { userApi } from "../../../store/api/userApi";
import { responseApi } from "../../../store/api/responseApi";
import { courseApi } from "../../../store/api/courseApi";
import { noteRankApi } from "../../../store/api/noteRankApi";
import { rankApi } from "../../../store/api/rankApi";
import { quizRankApi } from "../../../store/api/quizRankApi";
import Backdrop from "../../UI/Backdrop/Backdrop";
import classes from "./Payment.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
let discountPrice;
let calculatedPrice;
let usedPoint;
let result = {};
const Payment = ({
  fetchFn=null,
  courseName,
  username,
  userId,
  type,
  point = 0,
  courseId = 0,
  closeFn,
  price = 0,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [isShowInvoice, setIsShowInvoice] = useState(false);
  const formatPrice = (tempPrice, tempPoint = 0) => {
    const pointDiscountAmount = Math.min(tempPoint / 800, tempPrice * 0.15);
    const roundedPrice =
    Math.round((tempPrice - pointDiscountAmount) * 100) / 100;
    const formattedPrice = roundToNearest(roundedPrice, 0.05).toFixed(2);
    const usedPoints = Math.min(
      tempPoint,
      Math.floor(pointDiscountAmount * 800)
    );
    return { formattedPrice, usedPoints,pointDiscountAmount};
  };
  const roundToNearest = (value, nearest) => {
    return Math.round(value / nearest) * nearest;
  };
  const calculatedPoint = (price) => {
    switch (price) {
      case 10:
        return 8000;
      case 20:
        return 16800;
      case 50:
        return 43200;
      case 100:
        return 88800;
      case 200:
        return 182400;
      default:
        return 0;
    }
  };
  useEffect(() => {
    if (type == "recharge") {
      result = formatPrice(price);
      calculatedPrice = result.formattedPrice;
    } else {
      result = formatPrice(price, point);
      calculatedPrice = result.formattedPrice;
      usedPoint = result.usedPoints;
      discountPrice=result.pointDiscountAmount
    }
  }, []);

  const isValidExpiryDate=(date)=>{
    // MM should be a number from 01 to 12, and YY should be a number from 00 to 99.
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    
    if (!pattern.test(date)) {
      // The date format is not valid, so return false immediately.
      return false; 
    }
    // Split the input date into month and year parts
    const [month, year] = date.split('/');
    //Create a JavaScript Date object for the input date
    const inputDate = new Date(`20${year}`, month - 1); 
    const today = new Date();
    return inputDate >= today;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\D/g, "").length < 16) {
      alert("Card number must have at least 16 digits.");
      return;
    }
    if (expiryDate.length < 5 || !isValidExpiryDate(expiryDate)) {
      alert("Expiry Date is not valid. Please use the format MM/YY.");
      return;
    }
    if (securityCode.replace(/\D/g, "").length < 3) {
      alert("Security Code must have at least 3 digits.");
      return;
    }

    if (type == "recharge") {
      userApi
        .getUserById(userId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            const updatedPoint = +data.point + calculatedPoint(price);
            userApi
              .updateUser(
                {
                  point: updatedPoint,
                },
                userId
              )
              .then((response) => {
                const {isSuccess } = response;
                if (isSuccess) {
                  responseApi
                    .addResponse({
                      content: `You have successfully recharged with RM${price}, equivalent to ${calculatedPoint(
                        price
                      )} points.`,
                      authorId: userId,
                      type: "updateReceipt",
                    })
                    .then((response) => {
                      const {isSuccess } = response;
                      if (isSuccess) {
                        fetchFn && fetchFn()
                        setCardNumber("");
                        setNameOnCard("");
                        setExpiryDate("");
                        setSecurityCode("");
                        setIsShowInvoice(true);
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      courseApi
        .getCourseById(courseId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            let updatedStudents;
            if (data.attributes.students !== null) {
              updatedStudents = [...data.attributes.students, "" + userId];
            } else {
              updatedStudents = ["" + userId];
            }
            courseApi
              .updateCourse(
                {
                  students: updatedStudents,
                },
                courseId
              )
              .then((response) => {
                const {isSuccess } = response;
                if (isSuccess) {
                  responseApi
                    .addResponse({
                      content: `utilizing RM${calculatedPrice} and deducting ${usedPoint} points.`,
                      authorId: userId,
                      itemId: courseId,
                      type: "updateReceipt",
                    })
                    .then((response) => {
                      const { isSuccess } = response;
                      if (isSuccess) {
                        userApi.getUserById(userId).then((response) => {
                          if (response.isSuccess) {
                            const newPoint = +response.data.point - +usedPoint;
                            userApi
                              .updateUser(
                                {
                                  point: newPoint,
                                },
                                userId
                              )
                              .then((res) => {
                                const { isSuccess } = res;
                                if (isSuccess) {
                                  fetchFn && fetchFn()
                                  setCardNumber("");
                                  setNameOnCard("");
                                  setExpiryDate("");
                                  setSecurityCode("");
                                  setIsShowInvoice(true);
                                }
                              });
                          }
                        });
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    });

                  noteRankApi.getNoteRankById(userId,courseId).then((response) => {
                    const { isSuccess, data } = response;
                    if (isSuccess) {
                      if (data.length == 0) {
                          noteRankApi.addNoteRank({
                            username,
                            userId,
                            courseId,
                            score: 0,
                          });
                        
                      }
                    }
                  });
                  rankApi.getRankById(userId,courseId).then((response) => {
                    const { isSuccess, data } = response;
                    if (isSuccess) {
                      if (data.length == 0) {
                        rankApi.addRank({
                          username,
                          userId,
                          courseId,
                          score: 0,
                        });
                      }
                    }
                  });
                  quizRankApi.getQuizRankById(userId,courseId).then((response) => {
                    const { isSuccess, data } = response;
                    if (isSuccess) {
                      if (data.length == 0) {
                          quizRankApi.addQuizRank({
                            username,
                            userId,
                            courseId,
                            score: 0,
                          })
                      }
                    }
                  });
                }
              });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  const handleSecurityCode = (e) => {
    if (e.target.value > 3) {
      e.target.value = e.target.value.slice(0, 3);
    }
    setSecurityCode(e.target.value);
  };
  const handleCardNumber = (e) => {
    if (e.target.value > 16) {
      e.target.value = e.target.value.slice(0, 16);
    }
    setCardNumber(e.target.value);
  };
  const capitalizeFirstLetter=(string)=>{
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return (
    <Backdrop>
      {isShowInvoice ? (
        <div className={classes.Invoice}>
          <FontAwesomeIcon
            icon={faXmark}
            className={classes.CloseBtn}
            onClick={closeFn}
          />
          <h3>Invoice</h3>
          <p>Invoice Date: {new Date().toLocaleString()}</p>
          <p>Recipient: {username}</p>
          <hr />
          <h3>Items</h3>
          <ul>
            <li>
              {type == "recharge"
                ? `Point(${calculatedPoint(+price)})`
                : capitalizeFirstLetter(courseName)}
              : 1 * RM
              {calculatedPrice} = RM
              {calculatedPrice}
            </li>
            {type !== "recharge" && (
              <li>
                Discount: RM
                {discountPrice && parseFloat(discountPrice) - price}
              </li>
            )}
          </ul>
          <hr />
          <p>Total Amount: RM{type == "recharge" ? `${price}.00` : calculatedPrice}</p>
        </div>
      ) : (
        <div className={classes.PaymentForm}>
          <FontAwesomeIcon
            icon={faXmark}
            className={classes.CloseBtn}
            onClick={closeFn}
          />
          <h2>Payment Information</h2>
          <form onSubmit={handleSubmit}>
            <div className={classes.FormGroup}>
              <p>Card Number</p>
              <input
                type="number"
                value={cardNumber}
                onChange={handleCardNumber}
                required
              />
            </div>
            <div className={classes.FormGroup}>
              <p>Name on Card</p>
              <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                required
              />
            </div>
            <div className={classes.FlexLayout}>
              <div className={classes.FormGroup}>
                <p>Expiry Date(MM/YY)</p>
                <input
                  type="text"
                  maxLength="5"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
              <div className={classes.FormGroup}>
                <p>Security Code</p>
                <input
                  type="number"
                  value={securityCode}
                  onChange={handleSecurityCode}
                  required
                />
              </div>
            </div>
            <div className={classes.FormGroup}>
              <p>Price:RM {type == "recharge" ? price : calculatedPrice}</p>
              <p>
                Point: {type == "recharge"
                  ? calculatedPoint(+price)
                  : usedPoint && usedPoint}
              </p>
            </div>
            <button type="submit" className={classes.SubmitBtn}>
              Pay Now
            </button>
          </form>
        </div>
      )}
    </Backdrop>
  );
};

export default Payment;
