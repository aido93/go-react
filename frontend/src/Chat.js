import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom';
import './Chat.css';

function Chat(props) {
  const { wsAddress } = props;
  const [ws, setWs] = useState(new WebSocket(wsAddress));
  const [wsClosed, setWsClosed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!ws) return;
    checkWSClosed();
    return () => {
      ws.close();
    };
  }, [ws]);

  function handleInputChange(event) {
    setText(event.target.value);
  }
  function checkWSClosed () {
    if (wsClosed) {
        setWs(new WebSocket(wsAddress));
        setWsClosed(false);
    }
    ws.onopen = () => {
        console.log('Connected to server');
        setWsClosed(false);
    };
    ws.onerror = (error) => {
        console.log('WebSocket error: ', error);
        setWsClosed(true);
    };
    ws.onclose = () => {
        console.log('Disconnected from server');
        setWsClosed(true);
    };
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
    };
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    if (text.trim() === '') return;
    const message = { text };
    checkWSClosed();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      setText('');
    } else {
      const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          ws.send(JSON.stringify(message));
          setText('');
        }
      }, 1000);
    }
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

