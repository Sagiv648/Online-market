import express, { query } from 'express'
import dotenv from 'dotenv'
import products from './../Models/products.js'
import category from './../Models/category.js'
import order from './../Models/order.js'
import {retrieveOutOfStock, retrieveTotalPrice} from './../utilities.js'
import moment from 'moment'
dotenv.config();

const cartRouter = express.Router();


cartRouter.get('/', async (req,res) => {

            const ordersById = await order.findAll({where: {account_id: req.session.userid.id}})
            
            const outOfStock = await retrieveOutOfStock(req.session.userid.id);

            return res.status(200).json({
                userid: req.session.userid.id,
                username: req.session.userid.username,
                cart: ordersById,
                out_of_stock: outOfStock
            })

})



//1. add a post request to add to the cart(orders table)
cartRouter.post('/append', async (req,res) => {

        const {pid, pname, price, amount} = req.body;
        if(!amount){
            return res.status(400).json({
                fault : "no amount specified"
            })
        }

        const userOrder = await order.create({
            account_id: session.userid.id,
            product_id: pid,
            amount: amount
        })
        if(userOrder){
            return res.status(201).json({
                added: userOrder
            })
        }
        else{
            return res.status(500).json({
                fault: "server fault"
            })
        }

})



cartRouter.delete('/delete', async (req,res) => {

        const {pid, amount} = req.body;
        const currentRow = await order.findAll({where: {account_id: req.session.userid.id, product_id: pid}});
        if(currentRow.length == 0){
            return res.status(400).json({
                fault: "product not in the cart"
            })
        }
        const details = currentRow[0];
        if(amount >= currentRow[0].get('amount')){
            
            const destryoed = await order.destroy({where: {account_id: req.session.userid.id, product_id: pid}})
            return res.status(200).json({
                msg: `removed all of the amount of the product with id ${details.product_id}`
            })
        }
        else{
            const amountToUpdate = details.amount - amount;

            const removedOrder = await order.update({amount: amountToUpdate}, {where:{account_id: req.session.userid.id, product_id: pid}})

            if(removedOrder.length > 0){
                return res.status(200).json({
                    removed: removedOrder
                })
            }

        }

})

cartRouter.get('/payment', async (req,res) => {

    return res.status(200).json({
        msg: "Payment"
    })

})



/* Payment
{
    "products": [
        {
            "product_id": "",
            "amount" : ""
        }
    ],
    "payment_details" : {
        "card_number": "",
        "card_code" : "",
        "expiration_date" : ""
    }
}
*/

//The client will tick the items in his cart and the amount as a state ->
//  every item ticked in the cart will be added to the products buffer ->
//  the client will fill out his details and those details will be sent to the backend along with the products buffer.
// * Note: The products buffer should be less prone to errors since it is handled by the code and the events ->
//  in contrast to the payment details filled by the client and therefore can be prone to errors
cartRouter.post('/payment', async (req,res) => {
    const {products, payment_details} = req.body;
    const {card_number, card_code, expiration_date} = payment_details;
    if(card_number.length != 16 || card_code.length != 3){

        return res.status(400).json({
            fault: "invalid details"
        })
    }
    const expDate = expiration_date.split('/');
    if(expDate.length != 2){
        return res.status(400).json({
            fault: "invalid expDate"
        })
    }
    const dateResolver = moment([expDate[1], expDate[0]]).fromNow();
    if(dateResolver.search('in') != -1){
        //calculate total price for the items
        const total = await retrieveTotalPrice(products)

        // Handle payment

        return res.status(200).json({
            total_price: total,
            items_bought: products
            
        })
    }
    else{
        //throw error because it will contain either in or ago, ago means the card expired
        return res.status(400).json({
            fault: "card expired"
        })
    }
    
    //4550 4393 2738 9769
    //4511 7353 2614 6342
    //4069 7377 4874 6580

    
})

export default cartRouter;