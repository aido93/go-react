import logo from './logo.svg';
import './App.css';
import Chat from './Chat';
import { useState, useEffect } from 'react';

function App() {
  // send a GET request to the server when the page loads
  const [ws, setWS] = useState(null);
  useEffect(() => {
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
        setWS(ws);
        // render the Chat component with the ws prop
      })
      .catch(error => {
        // handle any errors that occur
        console.error(error);
      })
    }, []);
    return (
          <div className="App">
              <Chat ws={ws} />
          </div>
        );
}

export default App;
