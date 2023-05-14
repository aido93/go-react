import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom';
import './Chat.css';

function Chat(props) {
  var { ws, wsAddress } = props;
  var wsClosed = false;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!ws) return;
    checkWSClosed(wsClosed);
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
  function checkWSClosed (wsClosed) {
    if (wsClosed) {
      ws = new WebSocket(wsAddress);
    }
    if (!ws.onopen) {
      ws.onopen = () => {
        console.log('Connected to server');
        wsClosed = false;
      };
    }
    if (!ws.onerror) {
      ws.onerror = (error) => {
        console.log('WebSocket error: ', error);
        wsClosed = true;
      };
    }
    if (!ws.onclose) {
      ws.onclose = () => {
        console.log('Disconnected from server');
        wsClosed = true;
      };
    }
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() === '') return;
    const message = { text };
    checkWSClosed(wsClosed);
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

