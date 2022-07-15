
import bcrypt from 'bcryptjs'
import acc from './../Models/accounts.js'
import emailer from 'nodemailer'
import moment from 'moment'
import session from 'express-session'
import axios from 'axios'

import {emailVerification, adjustChecksum} from './../utilities.js'
//NOTE: forum account will be locked until verified through email
// A locked forum account means that the account will NOT have access to the following:
// 1. Store route
// 2. Cart

//Check password's strength
export const checkPassword = (body) => {
    if(body.length < 8){
        return 0
    }
    let i;
    const validationArr = [0, 0, 0]
    for(i = 0; i < body.length; i++){
        if(validationArr[0] == 0 && body[i] >= 'A' && body[i] <= 'Z'){
            validationArr[0] = 1;
        }
        if(validationArr[1] == 0 && body[i] >= '0' && body[i] <= '9'){
            validationArr[1] = 1;
        }
        if(validationArr[2] == 0 && (body[i] < 'A' || body[i] > 'Z') && (body[i] < '0' || body[i] > '9')){
            validationArr[2] = 1;
        }
        
    }
    
    return (validationArr[0] * validationArr[1] * validationArr[2])
}

//Check email's validation in terms of characters and whether it exists
//Needs to check the database
export const checkEmail = async (body) => {

    const testEmail = body.email_addr.split('@')
    
    if(testEmail.length != 2){
        return 0
    }
    const testEmailDomain = testEmail[1].split('.')
    //As for now, support only for .com will be supplied
    
    if(testEmailDomain.length != 2 || testEmailDomain[0] != 'gmail'){
        return 0
    }

    const acc_found = await acc.findAll({where: {email_addr: body.email_addr}})
    return !(acc_found.length * 1);
}

//Check phone number's validation in terms of prefix and length (will only apply to Israel)
export const checkPhoneNumber = (body) => {
    if(body.phone_number.length != 10 || body.phone_number[0] != 0) {
        return 0
    }
    return 1;
}

const registerGet = (req,res) => {
    
    return res.status(200).json({
        Message: "Register"
    })
}
/*
export const emailVerification = async (user, id) => {
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

        const verNumber = between(1000000,9999999);
        const checksum = await bcrypt.hash(verNumber, 5);

        var message = {
                    from: process.env.EMAILSENDER,
                    to: user.email_addr,
                    subject: "Online market verification",
                    html: `
                    <h2 style="color:blue;"> Hello ${user.first_name} ${user.last_name} </h2>
                    <p>We thank you for giving our market a chance.</P><br> 
                    <p>However in order to fully browse our stock you will need to verify your account, the verification code is listed below:</p>
                    <p>Your verification code is ${verNumber}${id}</p><br>
                    <p>NOTE: The verification code will expire in 10 minutes.</p><br>
                    <p>Unverified accounts are deleted everyday on 00:00</p>`
                    };

         transport.sendMail(message)
         .then(response => {
            console.log(`Email: email sent:\n ${response.envelope}`);
         })
         .catch(err => {
            console.log(`Error: \n ${err}`);
         })

    return `${checksum}${id}-${moment.now()}`

}
*/

const registerPost = async (req,res,next) => {
    
    const registree = req.body;

    //---- details validation ----
    let test = await checkEmail(registree)
    test *= checkPassword(registree.password) * checkPhoneNumber(registree)
    if(test == 0){
        return res.status(400).json({
            error: "error occured with user"
        })
    }
    //--- end of details validation ----

    //--- password encryption ----
    const encrypedPass = await bcrypt.hash(registree.password, 10);
    
    const account = await acc.create({
        first_name: registree.first_name,
        last_name: registree.last_name,
        phone_number: registree.phone_number,
        email_addr: registree.email_addr,
        password: encrypedPass,
        isLocked: true,
        lastChecksum: "",
        lastChecksumStamp: 0

    })
    // const adjustChecksum = async (user, account, isRegisteree)
    const {dataValues} = account;
    const registred = await adjustChecksum(dataValues, 1);
    if(registred > 0){
        return next();
    }
    
    return res.status(500).json({
        fault: "server fault"
    })

    /*
    const check = await emailVerification(registree, account.get('id'))
    const checksumArr = check.split('-');
    const checkSumTimestamp = parseInt(checksumArr[1])
    account.update({lastChecksum: checksumArr[0], lastChecksumStamp: checkSumTimestamp}, {where: {id: account.get('id')}})
    .then( result => {
        //return next();
    })
    .catch(err => {
        return res.status(500).json(err)
    })
    
    return next();
    */
}



export default {
    registerGet: registerGet,
    registerPost: registerPost
}



