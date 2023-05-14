import logo from './logo.svg';
import './App.css';
import Chat from './Chat';
import { useState, useEffect } from 'react';

function App() {
  // send a GET request to the server when the page loads
  const [wsAddress, setWSAddress] = useState("");
  useEffect(() => {
    fetch(window.location.origin + "/params")
      .then(response => response.json())
      .then(data => {
        const wsProtocol = data['wsProtocol'];
        const wsHost = data['wsHost'];
        const wsPort = data['wsPort'];
        const wsPath = data['wsPath'];
        const wsAddress = `${wsProtocol}://${wsHost}:${wsPort}${wsPath}`;
        setWSAddress(wsAddress);
        // render the Chat component with the ws prop
      })
      .catch(error => {
        // handle any errors that occur
        console.error(error);
      })
    }, []);
    return (
          <div className="App">
              <Chat wsAddress={wsAddress} />
          </div>
        );
}

export default App;
