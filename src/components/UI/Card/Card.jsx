import classes from "./Card.module.css"
const Card = (props) => {
    const classNames = `${classes.Card} ${props.className || ''} ${props.shadow=="true" ? classes.Shadow : ''}`;
    return (
        <div {...props} className={classNames}>
            {props.children}
        </div>
    );
};

export default Card;