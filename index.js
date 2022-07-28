import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import { registerGet, registerPost} from './Controllers/register.js'
import {loginGet, loginPost} from './Controllers/login.js'
import session from 'express-session';
import sequelizeStore from 'connect-session-sequelize'
import { logoutGet, logoutDelete } from './Controllers/logout.js';
import { settingsGet, settingsPatch } from './Controllers/settings.js';
import { emailVerGet, emailVerPost } from './Controllers/emailVerification.js';
import adminRouter from './admin.js'
import storeRouter from './Controllers/store.js'
import cartRouter from './Controllers/cart.js'
import scheduler from 'node-schedule'
import {removeUnverifiedAccounts, authenticate, adminAuthenticate, adminIdentityVerification} from './utilities.js'
import moment from 'moment';
const seqStore = sequelizeStore(session.Store);



const job = scheduler.scheduleJob('0 0 0 * * ?', async () => await removeUnverifiedAccounts());

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
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})
// app.set('views', 'ejs');
// app.set('views', 'views');

// app.use(express.static('views'))


app.get('/' ,async (req,res) => {
    
    req.sessionStore.get(req.session.id, (err, session) => {
        if(session){
            res.status(200).json({
                welcome: `hello ${req.session.userid.username}`,
                msg: "api"
            })
        }
        else{
            res.status(200).json({
                welcome: `hello guest`,
                msg: "api"
            })
        }
    })   
})

app.get('/register', registerGet);
app.post('/register', registerPost);
app.get('/verification', emailVerGet);

app.post('/verify', emailVerPost);

app.get('/login', loginGet);
app.post('/login', loginPost);

app.get('/logout', authenticate ,logoutGet);
app.delete('/logout', authenticate ,logoutDelete)

app.get('/settings', authenticate ,settingsGet);
app.patch('/settings', authenticate ,settingsPatch, emailVerGet)

app.use('/store', authenticate ,storeRouter)
app.use('/cart', authenticate ,cartRouter)
app.use('/admin', adminAuthenticate,adminRouter);

db.sync()
.then(result => {
    app.listen(details.port, details.host, ()=> {
        console.log(`Listening on ${details.host}:${details.port} with database`);
        
    })
})
.catch(err=> {
    console.log(`Error:\n ${err}`)
})

