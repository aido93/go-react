import React, { useState, useEffect } from 'react';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const ws = new WebSocket('ws://localhost:3000/socket.io');

  useEffect(() => {
    ws.onopen = () => {
      console.log('Connected to server');
    };
    ws.onerror = (error) => {
      console.log('WebSocket error: ', error);
    };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log(messages)
      } catch (e) {
        console.log(e)
      }
    };
    ws.onclose = () => {
      console.log('Disconnected from server');
    };

    return () => {
      ws.close();
    };
  }, []);

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

