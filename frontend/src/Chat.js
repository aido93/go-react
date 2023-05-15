import React, { useState, useEffect } from 'react';
import './Chat.css';

function Chat(props) {
  const { wsAddress } = props;
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!ws) {
      let newWs = connectToWebSocket();
      setWs(newWs);
    }
  }, [ws]);

  function handleInputChange(event) {
    setText(event.target.value);
  }

  async function connectToWebSocket() {
    const newWs = new WebSocket(wsAddress);
    newWs.onopen = () => {
          console.log('Connected to server');
    };
    newWs.onerror = (error) => {
          console.log('WebSocket error: ', error);
    };
    newWs.onclose = () => {
          console.log('Disconnected from server');
    };
    newWs.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, message]);
    };
    return newWs;
  }

  function sendWebSocketMessage() {
    if (text.trim() === '') return;
    const message = { text };
    ws.send(JSON.stringify(message));
    setText('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (ws.readyState != WebSocket.OPEN) {
      let newWs = await connectToWebSocket();
      setWs(newWs);
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

