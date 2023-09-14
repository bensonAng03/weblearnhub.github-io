import React, { useEffect, useState } from "react";
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
    console.log("pointDiscountAmount" + pointDiscountAmount);
    const roundedPrice =
      Math.round((tempPrice - pointDiscountAmount) * 100) / 100;
    console.log("roundedPrice", roundedPrice);
    const formattedPrice = roundToNearest(roundedPrice, 0.05).toFixed(2);
    console.log("formattedPrice", formattedPrice);
    const usedPoints = Math.min(
      tempPoint,
      Math.floor(pointDiscountAmount * 800)
    );
    console.log("usedpoint", usedPoints);
    return { formattedPrice, usedPoints };
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
      console.log(price);
      console.log(point);
      result = formatPrice(price, point);
      console.log("point", point);
      calculatedPrice = result.formattedPrice;
      usedPoint = result.usedPoints;
      console.log(usedPoint);
    }
  }, []);

  function isValidExpiryDate(date) {
    // 验证日期格式 "MM/YY"，其中 MM 是 01 到 12 的数字，YY 是 00 到 99 的数字
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return pattern.test(date);
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
                const { data, isSuccess } = response;
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
                      const { data, isSuccess } = response;
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
                      console.log(error);
                    });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("purchase");
      courseApi
        .getCourseById(courseId)
        .then((response) => {
          const { data, isSuccess } = response;
          if (isSuccess) {
            console.log(data);
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
                const { data, isSuccess } = response;
                if (isSuccess) {
                  console.log(data);
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
                        console.log(data);
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
                      console.log(error);
                    });

                  noteRankApi.getNoteRankById(userId).then((response) => {
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
                  quizRankApi.getQuizRankById(userId).then((response) => {
                    const { isSuccess, data } = response;
                    if (isSuccess) {
                      console.log(data)
                      if (data.length == 0) {
                          quizRankApi.addQuizRank({
                            username,
                            userId,
                            courseId,
                            score: 0,
                          }).then(res=>{
                            console.log(res.data)
                          }).catch(error=>{
                            console.log(error)
                          })
                        
                      }
                    }
                  });
                }
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  useEffect(() => {
    userApi
      .getUserById(userId)
      .then((response) => {
        const { data, isSuccess } = response;
        if (isSuccess) {
          // setTempPoint(data.point == null ? 0 : data.point);
          console.log("point:" + data.point);
        } else {
          console.error("Error:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
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
  function capitalizeFirstLetter(string) {
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
              {price} = RM
              {price}
            </li>
            {type !== "recharge" && (
              <li>
                Discount: RM
                {calculatedPrice && price - parseFloat(calculatedPrice)}
              </li>
            )}
          </ul>
          <hr />
          <p>Total Amount: RM{type == "recharge" ? price : calculatedPrice}</p>
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
                onChange={(e) => {
                  handleCardNumber(e);
                }}
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
                  onChange={(e) => handleSecurityCode(e)}
                  required
                />
              </div>
            </div>
            <div className={classes.FormGroup}>
              <p>Price:{type == "recharge" ? price : calculatedPrice}</p>
              <p>
                Point:
                {type == "recharge"
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
