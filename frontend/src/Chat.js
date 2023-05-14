import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom';
import './Chat.css';

function Chat(props) {
  const { ws } = props;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.close();
    };
  }, [ws]);

  function handleInputChange(event) {
    setText(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() === '') return;
    const message = { text };
    ws.send(JSON.stringify(message));
    setText('');
  };

  return (
    <div className="chat-container">
    <h1>Chat</h1>
    <div className="chat-messages">
      {messages.map((message, index) => (
        <div key={index} className="chat-message">
          <p>{message.text}</p>
        </div>
      ))}
    </div>
    <form onSubmit={handleSubmit} className="chat-form">
      <input type="text" value={text} onChange={handleInputChange} />
      <button type="submit">Send</button>
    </form>
  </div>
  );
}

export default Chat;

