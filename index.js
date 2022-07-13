import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import reg from './Controllers/register.js'
import login from './Controllers/login.js'
import session from 'express-session';
import sequelizeStore from 'connect-session-sequelize'
import { logoutGet, logoutDelete } from './Controllers/logout.js';
import { settingsGet, settingsPatch } from './Controllers/settings.js';
import accounts from './Models/accounts.js'
import { emailVerGet, emailVerPost } from './Controllers/emailVerification.js';
//import category from './Models/category.js'
//import order from './Models/order.js'
//import product from './Models/products.js'
const seqStore = sequelizeStore(session.Store);




const sessionLength = 86400000
const details = {
    port: process.env.PORT,
    host: process.env.HOST
}


env.config()
const app = express();



app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const extendDefaultFields = (defaults, session) => {
  return {
    data: defaults.data,
    expires: defaults.expires,
    userId: session.userId,
  };
}


app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    store: new seqStore({
        db: db,
        table: "session",
        extendDefaultFields: extendDefaultFields
    }),
    cookie: {
        maxAge: sessionLength
    },
    resave:false
}))

app.use(cookieParser())
app.set('views', 'ejs');
app.set('views', 'views');

app.use(express.static('views'))





app.get('/', async (req,res) => {
    
    
    req.sessionStore.get(req.session.id, (err, session) => {
        if(!err){
            return res.status(200).json({
                Message: `Welcome ${session.userid.username}`
            })
        }
        else{
            return res.status(200).json({
                Message: "This is online market API"
            })      
        }      
    })
})

app.get('/register', reg.registerGet);
app.post('/register', reg.registerPost, emailVerGet);
app.get('/verification', emailVerGet);

app.post('/verify', emailVerPost);

app.get('/login', login.loginGet);
app.post('/login', login.loginPost);

app.get('/logout', logoutGet);
app.delete('/logout', logoutDelete)

app.get('/settings', settingsGet);
app.patch('/settings', settingsPatch)

db.sync()
.then(result => {
    app.listen(details.port, details.host, ()=> {
        console.log(`Listening on ${details.host}:${details.port} with database`);
        
    })
})
.catch(err=> {
    console.log(`Error:\n ${err}`)
})

