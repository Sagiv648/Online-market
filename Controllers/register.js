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


const registerGet = (req,res) => {
    console.log("(render register page)")
}


const registerPost = async (req,res) => {
    //TODO: Integrate session functionality
    const registree = req.body;

    //console.log(`test: data from front-end\n:`);
    //console.log(registree);
    const acc_found = await acc.findAll({where: {email_addr: registree.email_addr}})
    
    if(acc_found.length > 0){
        const exists = 1
        return res.status(400).json({
            error: "account exists"
        })
    }
    else{
        //----------- emailing sector -----------
        
        //Works now
        const transport = emailer.createTransport({
            service: 'gmail',
            port:465,
            secure: true,
            secureConnection: false,
            auth: {
                user: process.env.EMAILSENDER,
                pass: process.env.APPPASSWORD, 
            },
            tls:{
                rejectUnAuthorized:true
            }
            
        })
        var message = {
                    from: process.env.EMAILSENDER,
                    to: registree.email_addr,
                    subject: "Online market verification",
                    html: `
                    <h2 style="color:blue;"> Hello ${registree.first_name} ${registree.last_name} </h2>
                    <p>We thank you for giving our market a chance.</P><br> 
                    <p>However in order to fully browse our stock you will need to verify your account, the verification code is listed below:</p>
                    <p>Your verification code is ${between(1000,1000000)}</p><br>
                    <p>NOTE: The verification code will expire in 10 minutes.</p>`
                    };

         transport.sendMail(message)
         .then(response => {
            console.log(`Email: email sent:\n ${response.envelope}`);
         })
         .catch(err => {
            console.log(`Error: \n ${err}`);
         })

         //---- end of emailing sector ---

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



