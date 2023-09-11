import classes from "./CoursePrice.module.css";

const formatPrice = (price) => {
  const formattedPrice = roundToNearest(price, 0.05).toFixed(2);
  return formattedPrice;
};

const roundToNearest = (value, nearest) => {
  return Math.round(value / nearest) * nearest;
};

const CoursePrice = ({ price, status }) => {
  const isCourseFree = status=="approved" && +price === 0;
  const formattedPrice = formatPrice(price);
  
  return (
    <div className={classes.BottomContainer}>
      {isCourseFree ? (
        <div>Free</div>
      ) : (
        <div className={classes.Price}>RM{formattedPrice}</div>
      )}
    </div>
  );
};

export default CoursePrice;