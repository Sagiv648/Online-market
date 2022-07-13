import express, { query } from 'express'
import dotenv from 'dotenv'
import products from './../Models/products.js'
import category from './../Models/category.js'
import order from './../Models/order.js'


dotenv.config();
//TODO:
/*
1. add a post request to add to the cart(orders table)
2. add functionality in the main route to check if any products by their id are in stock ->
    if they are not in stock, alert user
3. add a delete request to delete from the cart (orders table)
*/

const cartRouter = express.Router();

cartRouter.get('/', (req,res) => {

    req.sessionStore.get(req.session.id, async (err, session) => {
        if(session){
            if(!session.userid.verified){
                return res.status(400).json({
                    fault: "only verified users allowed"
                })
            }

            const ordersById = await order.findAll({where: {account_id: session.userid.id}})
            return res.status(200).json({
                username: session.userid.username,
                cart: ordersById
            })

        }
        else{
            return res.status(400).json({
                fault: "needs to be logged in"
            })
        }
    })
})




export default cartRouter;