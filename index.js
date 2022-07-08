import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import reg from './Controllers/register.js'
import login from './Controllers/login.js'



const sessionLength = 86400000
const details = {
    port: process.env.PORT,
    host: process.env.HOST
}


env.config()
const app = express();




app.set('views', 'ejs');
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('views'))
app.use(cookieParser())
app.use(expSession({
    secret: process.env.SECRET,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionLength
    },
    resave:false
}))


app.get('/', (req,res) => {
    console.log(req.session)
    return res.status(200).json({
        session: req.session
    })
})

app.get('/register', reg.registerGet);
app.post('/sendregister', reg.registerPost);

app.get('/login', login.loginGet);
app.post('/sendlogin', login.loginPost);


db.sync()
.then(result => {
    app.listen(details.port, details.host, ()=> {
        console.log(`Listening on ${details.host}:${details.port} with database`);
        
    })
})
.catch(err=> {
    console.log(`Error:\n ${err}`)
})
