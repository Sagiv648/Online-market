import axios from './../../node_modules/axios/index.js'
import env from './../../node_modules/dotenv/lib/main.js'

//axios = require('axios')
//env = require('dotenv')

env.config();

const button = document.getElementById('submitBtn');

const data = {email_addr: document.getElementById('emailLogin').value, 
                password: document.getElementById('passwordLogin').value}



let isUser = 0
/*
const sub = () => {
    console.log(data);
    axios.post(`${process.env.DOMAIN}/sendlogin`,data)
    .then(result => {
        isUser = 1
        console.log(`result is ${result.data}`);
    })
    .catch(err => {
        console.log(`error at axios post: ${err}`);
        document.getElementById('emailLogin').value = null;
        document.getElementById('passwordLogin').value = null;
        document.getElementById('error').style.visiblility = "visible";
    })

}
*/


button.addEventListener('click', async ()=> {

    console.log(data);
    axios.post(`${process.env.DOMAIN}/sendlogin`,data)
    .then(result => {
        isUser = 1
        console.log(`result is ${result.data}`);
    })
    .catch(err => {
        console.log(`error at axios post: ${err}`);
        document.getElementById('emailLogin').value = null;
        document.getElementById('passwordLogin').value = null;
        document.getElementById('error').style.visiblility = "visible";
    })

})
console.log(`isUser = ${isUser}`);
