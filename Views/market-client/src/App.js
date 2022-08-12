
import './App.css';
import axios from 'axios';
import {useEffect} from 'react'
import {useState} from 'react'
import 'react-router-dom'
import { BrowserRouter, Route, Router } from 'react-router-dom';


const useFetch = (url) => {

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const fetched = await axios.get(url);
      setData(fetched.data);
    }
    fetch();
  },[url])

  return [data];
}




function App() {

  const [data] = useFetch(`${process.env.REACT_APP_BASE_URL}/login`);
  // const [obj, setObj] = useState({one: "", two: ""});

  // useEffect(()=> {

  //   const fetch = async () => {
  //     const d = await axios.get(`${process.env.REACT_APP_BASE_URL}/`);
  //     //console.log(d.data);
  //     setObj({one: d.data.welcome, two: d.data.msg});
  //     //console.log(obj.msg);
  //   }
  //   fetch();
  // },[])

  const test = ()=> {
    console.log(data);
  }
  test();
  return (
    <div>
      <h1>{data}</h1>
      hello
    </div>
    
  );
}

export default App;
