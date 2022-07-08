import axios from 'axios'
import env from 'dotenv'
env.config();
const button = document.getElementById('btn')
const toSend = {
    first_name: document.getElementById('fname').value,
    last_name: document.getElementById('lname').value,
    email_addr: document.getElementById('emailAdd').value,
    phone_number: document.getElementById('pNumber').value,
    password: document.getElementById('password').value
}
button.addEventListener('click', ()=> {
     axios.post(`${process.env.HOST}:${process.env.PORT}/sendregister`, toSend)
     .then(response => {
        document.getElementById('fname').value = null;
        document.getElementById('lname').value = null;
        document.getElementById('emailAdd').value = null;
        document.getElementById('pNumber').value = null;
        document.getElementById('password').value = null;
        console.log(`the response: \n${response}`);
     })
     .catch(err => {
        console.log(`the error: \n ${err}`);
     })
})
