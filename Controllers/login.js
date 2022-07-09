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



const loginGet = (req,res) => {

    res.status(200).render('login/login.ejs')

}
let session;
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
            session.userid = `${loginee.first_name} ${loginee.last_name}`
                        
            console.log(`from the loginPost: ${req.session}`);
            req.session.save(()=> {
                console.log("session saved")
                
            })
            res.body = {isUser : 1}
            //res.status(200).redirect('/')
            return res.status(200).redirect('/')
            //return res.status(200);
             
        }
        console.log("no");
        res.body = {isUser: 0}
        return res.status(400).redirect('/login')
    }
    console.log("no");
    res.body = {
        isUser: 0
    }
    return res.status(400).redirect('/login')
}

export default {
    loginGet: loginGet,
    loginPost: loginPost
}