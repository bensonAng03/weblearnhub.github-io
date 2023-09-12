import { useEffect, useState, forwardRef, useRef } from "react";
import classes from "./Chatroom.module.css";
const Chatroom = forwardRef(function Chatroom(
  { messages, handleSendMessage, name },
  ref
) {
  const [isMouseEnter,setIsMouseEnter]=useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [sendMessage,setSendMessage]=useState(false)
  const inputRef = useRef(null);
  let timer = null;
  useEffect(() => {
    if (isMouseEnter && sendMessage) {
      scrollToBottom()
      setSendMessage(false)
    }else if(!isMouseEnter){
      scrollToBottom()
    }
  }, [messages, isMouseEnter,sendMessage]);
  const scrollToBottom=()=>{
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }
  const handleSendMessageFn = () => {
    if (canSendMessage) {
      handleSendMessage(inputRef.current.value);
      inputRef.current.value = "";
      setCanSendMessage(false);
      setSendMessage(true)
      clearTimeout(timer);
      timer = setTimeout(() => {
        setCanSendMessage(true);
      }, 1000);
    }
  };
  return (
    <div
    id="chatroom"
      className={classes.Chatroom}
      onMouseEnter={() => setIsMouseEnter(true)}
    
      onMouseLeave={() => setIsMouseEnter(false)}
    >
      <h3>聊天室</h3>
      <div className={classes.Messages} ref={ref}>
        {messages.map((message, index) => (
          <div key={index}>
            {message.sender === name ? (
              <div className={classes.OwnMessage}>
                <div className={classes.Avatar}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={classes.Sender}>{message.sender}</div>
                  <div className={classes.Content}>{message.content}</div>
                </div>
                <div className={classes.WhiteSpace}></div>
              </div>
            ) : (
              <div className={classes.Message}>
                <div className={classes.WhiteSpace}></div>
                <div>
                  <div className={classes.Sender}>{message.sender}</div>
                  <div className={classes.Content}>{message.content}</div>
                </div>
                <div className={classes.Avatar}>
                  {message.sender.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={classes.InputContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="输入"
        />
        <button
          className={
            canSendMessage
              ? classes.SendMessageBtn
              : `${classes.SendMessageBtn} ${classes.Disabled}`
          }
          onClick={handleSendMessageFn}
        >
          发送消息
        </button>
      </div>
      {isMouseEnter && ref.current.scrollHeight>260 && (
        <button className={classes.ScrollButton} onClick={scrollToBottom}>
          滚动到底部
        </button>
      )}
    </div>
  );
});

export default Chatroom;
