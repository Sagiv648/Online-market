import env from 'dotenv'
import express from 'express'
import products from './Models/products.js';
import categories from './Models/category.js';

env.config();

//TODO:
/*
3. add a delete request to delete categories from the store (category table)
4. add a delete request to delete products from the store (products table)
*/



const adminRouter = express.Router();


adminRouter.get('/', (req,res) => {
    return res.status(200).json({
        adm_message: "admin"
        
    })
    
})

adminRouter.get('/adminprods', async (req,res) => {
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
adminRouter.post('/adminaddcat', async (req,res) => {
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
adminRouter.post('/adminaddprod', async (req,res) => {
    const {name, catname, stock, price} = req.query;
    const test = name.length * catname.length * stock.length * price.length;
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