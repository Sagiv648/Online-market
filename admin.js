import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import db from './Models/dbConn.js'
import reg from './Controllers/register.js'
import login from './Controllers/login.js'
import session from 'express-session';
import sequelizeStore from 'connect-session-sequelize'

import products from './Models/products.js';
import categories from './Models/category.js';

env.config();

//TODO:
/*
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
         res.status(403).json({
            fault: "access denied."
        })
    }
    else if(admname == process.env.ADMIN_USERNAME && 
            admpassword == process.env.ADMIN_PASSWORD && 
            admemail == process.env.ADMIN_EMAIL){
            next();
    }
    else{
         res.status(403).json({
            fault: "access denied."
        })
    }
    return res;

}

adminRouter.get('/', adminIdentityVerification, (req,res) => {
    return res.status(200).json({
        adm_message: "logged in as an admin"
        
    })
    
})

adminRouter.get('/adminprods', adminIdentityVerification, async (req,res) => {
    const {catid} = req.query;
    if(catid){
        const prodsByCategory = await products.findAll({where: {category_id: catid}});
        return res.status(200).json({
            prodsByCategory
        })
    }
    const allProds = await products.findAll();
        return res.status(200).json({
            allProds
        })


})

//1. add a post request to add categories to the store (category table)
adminRouter.post('/adminaddcat', adminIdentityVerification, async (req,res) => {
    const {name} = req.query;
    if(!name.length){
        return res.status(400).json({
            fault: "query fault"
        })
    }
    const newCategory = await categories.create({category_name: name})
    return res.status(200).json({
            added: newCategory
        })
})


//2. add a post request to add products to the store (products table)
adminRouter.post('/adminaddprod', adminIdentityVerification, async (req,res) => {
    const {name, catname, stock, price} = req.query;
    const test = name.length * catid.length * stock.length * price.length;
    if(!test){
        return res.status(400).json({
            fault: "query fault"
        })
    }

    const category = await categories.findAll({where: {category_name: catname}});
    if(category.length == 0){
        return res.status(400).json({
            fault: "query fault"
        })
    }

    
    const prod = await products.create({
                                        product_name: name,
                                        category_id: category[0].get('id'),
                                        stock: stock,
                                        price: parseFloat(price)
                                       });
    
        if(!prod){
            return res.status(400).json({
                fault: "query fault"
            })
        }
        return res.status(200).json({
            added: prod
        })
})






export default adminRouter;