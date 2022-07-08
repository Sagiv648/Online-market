import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookie from 'cookie-parser'
import db from './../Models/dbConn.js'
import acc from './../Models/accounts.js'

const registerGet = (req,res) => {
    console.log("good get")
    return res.status(200).json({
        msg: "works"
    })
}
const registerPost = async (req,res) => {
    //TODO: Integrate session functionality



    const registree = req.body;
    
    const acc_found = await acc.findAll({where: {email_addr: registree.email_addr}})
    
    if(acc_found.length > 0){
        
        return res.status(400).json({
            error: "account exists"
        })
    }
    else{
        const encrypedPass = await bcrypt.hash(registree.password, 10);
        acc.create({
            first_name: registree.first_name,
            last_name: registree.last_name,
            phone_number: registree.phone_number,
            email_addr: registree.email_addr,
            password: encrypedPass,
            isLocked: false

        })
        .then(result => {
            return res.status(200).json({
                status: "account successfully registered",
                result: result
            })
        })
        .catch(err => {
            console.log(`Error:\n ${err}`);
            return res.status(500).json({
                error: err
            })
        })
    }

}


export default {
    registerGet: registerGet,
    registerPost: registerPost
}



