import express, { query } from 'express'
import dotenv from 'dotenv'
import products from './../Models/products.js'
import category from './../Models/category.js'
import order from './../Models/order.js'


dotenv.config();
//TODO:
/*
*/
const cartRouter = express.Router();

//2. add functionality in the main route to check if any products by their id are in stock ->
//   if they are not in stock, alert user
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



//1. add a post request to add to the cart(orders table)
cartRouter.post('/append', async (req,res) => {

    req.sessionStore.get(req.session.id, async (err, session) => {
        if(!session){
            return res.status(400).json({
                fault: "access denied"
            })
        }
        const {pid, pname, price, amount} = req.body;

        if(!amount){
            return res.status(400).json({
                fault : "no amount specified"
            })
        }
        order.create({
            account_id: session.userid.id,
            product_id: pid,
            amount: amount
        })
        .then(result => {
            return res.status(200).json({
                msg: "item added to cart",
                result
            })
        })
        .catch(err => {
            return res.status(400).json({
                fault: "could be an invalid id"
            })
        })
        

    })
    
})


cartRouter.delete('/delete', (req,res) => {

    req.sessionStore.get(req.session.id, async (err, session) => {
        if(!session){
            return res.status(400).json({
                fault: "access denied"
            });
        }

        const {pid, amount} = req.body;
        const currentRow = await order.findAll({where: {account_id: session.userid.id, product_id: pid}});
        if(currentRow.length == 0){
            return res.status(400).json({
                fault: "product not in the cart"
            })
        }
        const details = currentRow[0];
        if(amount >= currentRow[0].get('amount')){
            
            const destryoed = await order.destroy({where: {account_id: session.userid.id, product_id: pid}})
            return res.status(200).json({
                msg: `removed all of the amount of the product with id ${details.product_id}`
            })
        }
        else{
            const amountToUpdate = details.amount - amount;
            order.update({amount: amountToUpdate}, {where: {account_id: session.userid, product_id: pid}})
            .then(result => {
                return res.status(200).json({
                    msg: `removed ${details.amount} from product with id ${details.product_id}`
                })
            })
            .catch(err => {
                return res.status(500).json({
                    fault: "server fault"
                })
            })
            
        }

    })

    


})


export default cartRouter;