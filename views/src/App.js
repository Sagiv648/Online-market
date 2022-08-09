import logo from './logo.svg';
import './App.css';
//import dotenv from 'dotenv'
import axios from 'axios'
import {useEffect} from 'react'

//dotenv.config();

function App() {

  useEffect(()=> {
    const fetch = async ()=> {
      const out = await axios.get(`http://127.0.0.1:2000/`);
      console.log(out.data);
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
