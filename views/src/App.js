import logo from './logo.svg';
import './App.css';

import axios from 'axios'
import {useEffect} from 'react'



function App() {

  
  useEffect(() => {

    const fetch = async () => {
      const d = await axios.get(`http://${process.env.REACT_APP_HOST_URL_ADDR}:${process.env.REACT_APP_HOST_URL_PORT}`)
      console.log(d.data);
    }

    fetch();
    
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
