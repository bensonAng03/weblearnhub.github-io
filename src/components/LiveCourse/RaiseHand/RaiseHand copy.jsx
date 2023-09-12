import { useEffect, useState } from 'react';
import classes from "./RaiseHand.module.css"
const RaiseHand = ({raiseHandList,sendRaiseHandFn,getRaiseHandStatus}) =>{
    const [isShowRaiseHandList,setIsShowRaiseHandList]=useState(false);
    const [isRaiseHand,setIsRaiseHand]=useState(false);
    const showRaiseHandList=()=>{
        setIsShowRaiseHandList(!isShowRaiseHandList)   
    }
    const raiseHandFn=()=>{
        setIsRaiseHand(!isRaiseHand)
        getRaiseHandStatus(!isRaiseHand)
        sendRaiseHandFn()
    }
    useEffect(()=>{
        console.log(raiseHandList)
    },[raiseHandList])
    return (
        <div className={classes.RaiseHand}>
            <ul className={isShowRaiseHandList ? classes.RaiseHandList : `${classes.RaiseHandList} ${classes.DisplayNone}`}>
                <li>Raise Hand Person</li>
                {raiseHandList?.map((item,index)=>{
                    return <li key={index} id={item.userId}>{item.name}</li>
                })}
            </ul>
            <button onClick={showRaiseHandList}>show raise hand</button>
            <button onClick={raiseHandFn}>raise hand</button>
        </div>
    );
};

export default RaiseHand;