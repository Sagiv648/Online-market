import sequelize, { Sequelize } from 'sequelize'
import env from 'dotenv'

env.config()

export default new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "mysql",
        host: process.env.HOST
    }
)