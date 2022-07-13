import express, { query } from 'express'
import dotenv from 'dotenv'
import products from './../Models/products.js'
import category from './../Models/category.js'
import order from './../Models/order.js'

const storeRouter = express.Router();

dotenv.config();

//TODO: nothing atm


storeRouter.get('/', (req, res) => {
    req.sessionStore.get(req.session.id, async (err, session) => {
        if(session){
            if(!session.userid.verified){
                return res.status(400).json({
                    fault: "Access denied until your verify your email"
                })
            }

            const allStoreProducts = await products.findAll();
            
            return res.status(200).json({
                username: session.userid.username,
                products: allStoreProducts
                
            })
        }
        else{
            return res.status(400).json({
                fault: "only logged in allowed"
            })
        }
    })
})


storeRouter.get('/category', async (req,res) => {

    const cid = req.query.cid;
    const allCategories = await category.findAll({where: {id: cid}});

    if(allCategories.length == 0) {
        return res.status(200).json({
            category: allCategories,
            products: "no products"
        })
    }
    const productsPerCategories = await products.findAll({where: {category_id : allCategories[0].get('id')}});

    return res.status(200).json({
        category: allCategories[0],
        products: productsPerCategories
    })
})

storeRouter.get('/product', async (req,res) => {

    const {id, name,stock} = req.query;
    const allProducts = await products.findAll({where: {id: id, product_name: name, stock: stock}});
    return res.status(200).json({
        products: allProducts
    })
    
})




export default storeRouter;