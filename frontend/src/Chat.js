import React, { useState, useEffect } from 'react';
import './Chat.css';

function Chat(props) {
  const { wsAddress } = props;
  const [ws, setWs] = useState(null);
  const [wsClosed, setWsClosed] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!ws) {
      connectToWebSocket();
    }
  }, [ws]);

  function handleInputChange(event) {
    setText(event.target.value);
  }

  async function connectToWebSocket() {
    const newWs = new WebSocket(wsAddress);
    newWs.onopen = () => {
          console.log('Connected to server');
          setWs(newWs);
          setWsClosed(false);
    };
    newWs.onerror = (error) => {
          console.log('WebSocket error: ', error);
          setWsClosed(true);
    };
    newWs.onclose = () => {
          console.log('Disconnected from server');
          setWsClosed(true);
    };
    newWs.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, message]);
    };
  }

  function sendWebSocketMessage() {
    if (text.trim() === '') return;
    const message = { text };
    ws.send(JSON.stringify(message));
    setText('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (wsClosed || ws.readyState !== WebSocket.OPEN) {
      await connectToWebSocket();
    }
    sendWebSocketMessage();
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

