import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import reg from './Controllers/register.js'
import login from './Controllers/login.js'
import session from 'express-session';
import sequelizeStore from 'connect-session-sequelize'

env.config();

//TODO:
/*
1. add a post request to add categories to the store (category table)
2. add a post request to add products to the store (products table)
3. add a delete request to delete categories from the store (category table)
4. add a delete request to delete products from the store (products table)
*/



const adminRouter = express.Router();


const adminIdentityVerification = (req,res, next) => {
    if(!req.query){
        return res.status(403).json({
            fault: "access denied."
        })
    }
    const {admname, admpassword, admemail} = req.query;
    
    if(!admname || !admpassword || !admemail){
        return res.status(403).json({
            fault: "access denied."
        })
    }
    else if(admname == process.env.ADMIN_USERNAME && 
            admpassword == process.env.ADMIN_PASSWORD && 
            admemail == process.env.ADMIN_EMAIL){
                next();
    }
    else{
        return res.status(403).json({
            fault: "access denied."
        })
    }
    return res.status(200).json({
        msg: "leaving admin status"
    })

}

adminRouter.get('/', adminIdentityVerification, (req,res) => {
    return res.status(200).json({
        adm_message: "admin msg"
    })
})








export default adminRouter;