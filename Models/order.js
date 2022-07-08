import sequelize from "sequelize";
import dbConn from "./dbConn.js";
import products from "./products.js";
import accounts from "./accounts.js";

const order = dbConn.define('orders', {
    account_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },  //Foreign-key to the acc id whom this cart is his

    product_id: {
        type:sequelize.INTEGER,
        allowNull: false
    },  //Foreign-key to the product id of the product which the account id placed

    amount:{
        type: sequelize.INTEGER,
        allowNull: false}   //Order amount of the product

})

order.belongsTo(accounts, {
    foreignKey: 'account_id',
    targetKey: 'id',
    uniqueKey: 'order_accId_fk'
})
order.belongsTo(products, {
    foreignKey: 'product_id',
    targetKey: 'id',
    uniqueKey: 'order_productId_fk'
})
export default order;