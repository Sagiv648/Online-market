import sequelize from 'sequelize'
import dbConn from './dbConn.js'
import category from './category.js'

const products = dbConn.define('product', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    product_name: sequelize.STRING,
    category_id: {
        type: sequelize.INTEGER,
        allowNull: false},
    stock: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    price: {
        type: sequelize.FLOAT,
        allowNull: false
    }
})


products.belongsTo(category, {
    foreignKey: 'category_id',
    targetKey: 'id',
    uniqueKey: 'category_product_fk',

})
export default products