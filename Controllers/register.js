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
import smtpserver, { SMTPServer } from 'smtp-server' 
const registerGet = (req,res) => {
    console.log("good get")
    return res.status(200).json({
        msg: "works"
    })
}
const registerPost = async (req,res) => {
    //TODO: Integrate session functionality
    const registree = req.body;

    //console.log(`test: data from front-end\n:`);
    //console.log(registree);
    const acc_found = await acc.findAll({where: {email_addr: registree.email_addr}})
    



    if(acc_found.length > 0){
        
        return res.status(400).json({
            error: "account exists"
        })
    }
    else{
        const smtp = new SMTPServer()
        
        //Works now
        const transport = emailer.createTransport({
            service: 'gmail',
            port:465,
            secure: true,
            secureConnection: false,
            auth: {
                user: 'lsrpacc9@gmail.com',
                pass: 'qxsjzzgnwdrcxlgt', 
            },
            tls:{
                rejectUnAuthorized:true
            }
            
        })
            
        
        var message = {
                    from: "sender@gmail.com",
                    to: "sagivalia11@gmail.com",
                    subject: "Message title",
                    html: `<p>Your verification code is 12345</p>`
                    };

         transport.sendMail(message)
         .then(response => {
            console.log(`Email: email sent:\n ${response}`);
         })
         .catch(err => {
            console.log(`Error: \n ${err}`);
         })

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
            res.status(200).redirect('/')
            /*
            return res.status(200).json({
                status: "account successfully registered",
                result: result
            })
            */
        })
        .catch(err => {
            console.log(`Error:\n ${err}`);
            return res.status(500).json({
                error: err
            })
        })
    }

}


function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


export default {
    registerGet: registerGet,
    registerPost: registerPost
}



