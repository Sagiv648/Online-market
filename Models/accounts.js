import sequelize from 'sequelize'
import { INTEGER } from 'sequelize'
import dbConn from './dbConn.js'

export default dbConn.define('account', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true

    },
    first_name: sequelize.STRING,
    last_name: sequelize.STRING,
    phone_number: sequelize.STRING,
    email_addr: sequelize.STRING,
    password: sequelize.STRING,
    isLocked: sequelize.BOOLEAN
})