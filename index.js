import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import reg from './Controllers/register.js'
import login from './Controllers/login.js'
import Session from 'express-session';



const sessionLength = 86400000
const details = {
    port: process.env.PORT,
    host: process.env.HOST
}


env.config()
const app = express();



app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(expSession({
    secret: process.env.SECRET,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionLength
    },
    resave:false
}))
app.use(cookieParser())
app.set('views', 'ejs');
app.set('views', 'views');

app.use(express.static('views'))


let session;
app.get('/', (req,res) => {
    
    session = req.session;
    if(session.userid){
        //console.log(`IF GOOD session userid from index-> ${session.userid}`);
        res.status(200).render('./index/index.ejs', {user: session.userid, logged: 1})
    }
    else{
        //console.log(`IF NOT GOOD session userid from index-> ${session.userid}`);
        res.status(200).render('./index/index.ejs', {user: "", logged: 0})
    }
    
    
    
    /*
    if(req.session.userid == undefined){
        return res.status(400).json({
            res: "session is null"
        })
    }
    */
    
    //const username = req.session.userid
    
    //console.log(`name is ${req.session.userid.Name}\n`);
    //let name = req.session.userid;
    
    

    //res.status(200).render('index.ejs', {user: name})
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

