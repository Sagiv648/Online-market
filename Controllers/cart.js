import express from 'express'
import dotenv from 'dotenv'
import productModel from './../Models/products.js'
import category from './../Models/category.js'
import order from './../Models/order.js'
import {retrieveOutOfStock, retrieveTotalPrice, isNumeric, isAmountExceeds} from './../utilities.js'
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




cartRouter.post('/append', async (req,res) => {

        const {pid, amount} = req.body;
        if(!amount){
            return res.status(400).json({
                fault : "no amount specified"
            })
        }
        else if(!isNumeric(amount)){
            return res.status(400).json({
                fault: "amount needs to have only numeric values"
            })
        }
        else if( (await isAmountExceeds(amount, pid)) ){
            return res.status(400).json({
                fault: `${amount} exceeds the stock`
            })
        }

        const isOrderExists = await order.findAll({where: {account_id: req.session.userid.id, product_id: pid}});

        if(isOrderExists.length == 0){

            const userOrder = await order.create({
                account_id: req.session.userid.id,
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

        }
        else{
            const updated = await isOrderExists[0].update({amount: isOrderExists[0].get('amount') + parseInt(amount)}, 
                                                    {where:{account_id: req.session.userid.id, product_id: pid}});
            if(updated){
                return res.status(200).json({
                    added: updated
                })
            }
            else{
                return res.status(500).json({
                    fault: "server fault"
                })
            }
        }

        
        

})



cartRouter.delete('/delete', async (req,res) => {

        const {pid, amount} = req.body;

        if(!amount){
            return res.status(400).json({
                fault : "no amount specified"
            })
        }
        else if(!isNumeric(amount)){
            return res.status(400).json({
                fault: "amount needs to have only numeric values"
            })
        }

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
                    removed: `removed ${amount} of the product with id ${pid}`
                })
            }

        }

})

cartRouter.get('/payment', async (req,res) => {

    const cart = await order.findAll({where: {account_id: req.session.userid.id}});
    const total = await retrieveTotalPrice(cart);
    return res.status(200).json({
        msg: "Payment",
        price: total,
        cart
        
    })

})



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
    const dateResolver = moment([`20${expDate[1]}`, expDate[0]]).fromNow();
    if(dateResolver.search('in') != -1){
        //calculate total price for the items
        if(products.length == 0){
            return res.status(400).json({
                msg: "details valid but no items picked",
                products
                
            })
        }
        const total = await retrieveTotalPrice(products)

        // Handle payment
        // Payment handled here
        //

        //After payment is handled, correct the database records according the purchase's amount
        for(let i = 0; i < products.length; i++){

            var orderTmp = await order.findOne({where: {account_id: req.session.userid.id, product_id: products[i].product_id}})
            var stockTmp = await productModel.findByPk(products[i].product_id);

            if(stockTmp.get('stock') > 0 && stockTmp.get('stock') - parseInt(products[i].amount) >= 0){
                const updated = stockTmp.update({stock: stockTmp.get('stock') - parseInt(products[i].amount) },
                                                {where: {id: products[i].product_id}});
            }

            if(parseInt(products[i].amount) >= orderTmp.get('amount')){
                
                const destryoed = await order.destroy({where: {account_id: req.session.userid.id, product_id: products[i].product_id}})
            }
            else{
                const amountToUpdate = orderTmp.get('amount') - parseInt(products[i].amount);

                const removedOrder = await order.update({amount: amountToUpdate}, {where:{account_id: req.session.userid.id, product_id: products[i].product_id}})

            }
        }
        
        return res.status(200).json({
            total_price: total,
            items_bought: products
            
        })
    }
    else{
        
        return res.status(400).json({
            fault: "card expired"
        })
    }
    
    
})

export default cartRouter;