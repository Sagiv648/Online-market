import sequelize from "sequelize";
import dbConn from "./dbConn.js";


const category = dbConn.define('category', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    category_name: sequelize.STRING
})
export default category