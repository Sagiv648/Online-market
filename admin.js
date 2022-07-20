import env from 'dotenv'
import express from 'express'
import productsModel from './Models/products.js';
import categoriesModel from './Models/category.js';
import sequelize from 'sequelize';

env.config();


const adminRouter = express.Router();

adminRouter.get('/', (req,res) => {
    return res.status(200).json({
        adm_message: "admin"
        
    })
    
})

adminRouter.get('/adminprods', async (req,res) => {

    const {lte} = sequelize.Op;
    const {cname} = req.query;
    if(cname){
        const categories= await categoriesModel.findAll({where: {category_name: cname}});
        if(categories.length == 0){
            return res.status(400).json({
                fault: "no category with such name"
            })
        }
        const prodsByCategoryName = await productsModel.findAll({where:{category_id: categories[0].get('id')}});
        const noStock = await productsModel.findAll({where:{category_id: categories[0].get('id'), stock: {[lte]:5}}});

        return res.status(200).json({
            category: cname,
            out_of_stock: noStock,
            products: prodsByCategoryName
        })
        
    }
    const allProds = await productsModel.findAll();
    const outOfStock = await productsModel.findAll({where:{stock: {[lte]: 5}}});
        return res.status(200).json({
            out_of_stock: outOfStock,
            products: allProds
            
            
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
    const newCategory = await categoriesModel.create({category_name: name})
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

    const category = await categoriesModel.findAll({where: {category_name: catname}});
    if(category.length == 0){
        return res.status(400).json({
            fault: "query fault"
        })
    }

    
    const prod = await productsModel.create({
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