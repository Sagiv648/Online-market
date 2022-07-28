
import './App.css';
import axios from 'axios';
import {useEffect} from 'react'



function App() {

  useEffect(()=> {

    const fetch = async () => {
      const d = await axios.get("http://localhost:2000/register");
      console.log(d);
    }
    fetch();
  })


  return (
    <div className="App">
      hello
    </div>
  );
}

export default App;
