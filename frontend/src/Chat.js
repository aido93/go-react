import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom';
import './Chat.css';

// send a GET request to the server when the page loads
window.addEventListener("load", () => {
  fetch(window.location.origin + "/params")
    .then(response => response.json())
    .then(data => {
      const wsProtocol = data['wsProtocol'];
      const wsHost = data['wsHost'];
      const wsPort = data['wsPort'];
      const wsPath = data['wsPath'];
      const wsAddress = `${wsProtocol}://${wsHost}:${wsPort}${wsPath}`;
      const ws = new WebSocket(wsAddress);
      ws.onopen = () => {
        console.log('Connected to server');
      };
      ws.onerror = (error) => {
        console.log('WebSocket error: ', error);
      };
      ws.onclose = () => {
        console.log('Disconnected from server');
      };
      // render the Chat component with the ws prop
      createRoot(document.getElementById('root')).render(<Chat ws={ws} />);
    })
    .catch(error => {
      // handle any errors that occur
      console.error(error);
    });
});

function Chat(props) {
  const { ws } = props;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
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

