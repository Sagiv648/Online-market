import sequelize from "sequelize";
import dbConn from "./dbConn.js";


export default dbConn.define("session", {
    sid: {
        type: sequelize.STRING,
        primaryKey: true
    },
    userId: sequelize.STRING,
    expires: sequelize.DATE,
    data: sequelize.TEXT,
});