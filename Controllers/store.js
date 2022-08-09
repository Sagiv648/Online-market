import express from 'express'
import dotenv from 'dotenv'
import productsModel from './../Models/products.js'
import categoryModel from './../Models/category.js'
import order from './../Models/order.js'

import sequelize from 'sequelize'


const storeRouter = express.Router();

dotenv.config();


//TODO: 
//1. Refactor the code, remove unneccsary authentication since the route already has a middleware to handle that. ^
//2. Have the store main route to display ONLY items which are in stock. (stock >= 5) ^
//3. Handle the category route to display items based on a category name ^
//4. Handle the product route to display item/items based on the name ^
// All done



storeRouter.get('/', async (req, res) => {

    const {gte} = sequelize.Op
    const allProducts = await productsModel.findAll({where: { stock: {[gte]: 5}}})
    if(allProducts.length == 0){
        return res.status(500).json({
            fault: "server fault"
        })
    }

    return res.status(200).json({
        products: allProducts
    })

})


storeRouter.get('/category', async (req,res) => {

    const {gte} = sequelize.Op;
    const {cname} = req.query;

    if(!cname){
        return res.status(400).json({
            fault: "no param"
        })
    }
    const category = await categoryModel.findAll({where: {category_name: cname}});
    if(category.length == 0){
        return res.status(400).json({
            fault: "no category with such name"
        })
    }
    const products = await productsModel.findAll({where:{category_id: category[0].get('id'), stock: {[gte]: 5}}});
    
    if(products.length == 0){
        return res.status(500).json({
            fault: "server fault"
        })
    }
    return res.status(200).json({
        category: cname,
        products: products
    })

})




storeRouter.get('/findproduct', async (req,res) => {

    const {name} = req.query;
    const {gte} = sequelize.Op;
    if(!name){
        return res.status(400).json({
            fault: "no param"
        })
    }

    const productsByName = await productsModel.findAll({where: {product_name: name, stock: {[gte]: 5}}});
    if(productsByName.length == 0){
        return res.status(400).json({
            fault: "no products with such name"
        })
    }
    const checkArr = [];
    const productsByCategory = [];
    let j = 0;
    for(let i = 0; i < productsByName.length; i++)
    {
        for( j = 0; j < checkArr.length; j++){
            if(checkArr[j] == productsByName[i].get('category_id')){
                break;
            }
        }
        if(j == checkArr.length){
            checkArr.push(productsByName[i].get('category_id'));
            var categoryName = await categoryModel.findByPk(productsByName[i].get('category_id'));
            var allFoundProdsByCategory = await productsModel.findAll({where: {product_name: name,
                                                                        stock: {[gte]: 5}, category_id: categoryName.get('id')}});
            if(allFoundProdsByCategory.length != 0){
                productsByCategory.push({category: categoryName.get('category_name'), products: allFoundProdsByCategory});
            }
        }
    }
    return res.status(200).json({
        products_found: productsByCategory
    })
    
    
})




export default storeRouter;