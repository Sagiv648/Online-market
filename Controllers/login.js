import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookie from 'cookie-parser'
import db from './../Models/dbConn.js'
import acc from './../Models/accounts.js'
import jwt from 'jsonwebtoken'
import emailer from 'nodemailer'

//TODO: Integrate json-web-token

let session;

const loginGet = (req,res) => {
    console.log(req.body)
}
const loginPost = async (req,res) => {
    //TODO: Integrate session functionality

    const loginee = req.body
    const accounts = await acc.findAll({where: {email_addr: loginee.email_addr}});
    if(accounts.length > 0){
        const hashed_password = accounts[0].get('password')
        const isCorrectPassowrd = await bcrypt.compare(loginee.password, hashed_password)

        if(isCorrectPassowrd){
            //creating the session for the user
            session = req.session
            session.userid = {email: loginee.email_addr,
                                Name: `${loginee.first_name} ${loginee.last_name}`
                                }
            console.log(`from the loginPost: ${req.session.userid}`);
            return res.status(200).json({
                msg: `welcome ${loginee.first_name} ${loginee.last_name}`,
                session: req.session
            })
        }
        return res.status(400).json({
            error: "incorrect details"
        })
    }


    return res.status(400).json({
        error: "user not registered"
    })
}

export default {
    loginGet: loginGet,
    loginPost: loginPost
}