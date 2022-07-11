import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import session from 'express-session';
import sequelizeStore from 'connect-session-sequelize'
import acc from './../Models/accounts.js'
import {  checkPassword } from './register.js';
import login from './login.js';



const settingsGetMethod = (req, res) => {
    
    req.sessionStore.get(req.session.id, async (err, session) => {
        
        if(session){

            //const email = parseFromSession(session.userid.email)
            const id = session.userid.id
            const account = await acc.findAll({where: {id : id}})
            if(account.length == 0){
                return res.status(400).json({
                    Message: "Access denied"
                })
            }
            
            const answer = {...JSON.parse(JSON.stringify(account[0])), id: '**', password: "***************"}
            return res.status(200).json({
                Message: answer
            })
        }
        else{
            return res.status(200).json({
                Message: "Needs to be logged in"
            })      
        }      
    })

}



//Settings:
/*
1. first_name:
2. last_name:
3. phone_number:
4. email_addr:
5. old_password:
6. new_password:
*/

const checkEmail = (email_addr) => {
    const testEmail = email_addr.split('@')
    
    if(testEmail.length != 2){
        return 0
    }
    const testEmailDomain = testEmail[1].split('.')
    //As for now, support only for .com will be supplied
    
    if(testEmailDomain.length != 2 || testEmailDomain[0] != 'gmail'){
        return 0
    }
    return 1
}

const settingsPatchMethod = (req, res) => {

    req.sessionStore.get(req.session.id, async (err, session) => {

        if(session != null){
            
            const id = req.session.userid.id;
            
            const account = await acc.findAll({where: {id: id}})

            if(account.length == 0){
                return res.status(400).json({
                    Error: "Error occured with session and id"
                })
            }

            //const newData = destructRequestBody(req.body)   //1.keys : Keys | 2. values : values to edit
            var newData = { first_name: account[0].get('first_name'),
                            last_name: account[0].get('last_name'),
                            phone_number: account[0].get('phone_number'),
                            email_addr: account[0].get('email_addr'),
                            password: account[0].get('password'),
                          }


            //Deconstructing the request's body
            const {first_name, last_name, phone_number, 
                   email_addr, old_password, new_password} = req.body
                   
                    
                   //Password validation section
                if((old_password.length == 0 && new_password.length != 0)
                    || new_password.length == 0 && old_password.length != 0){
                        return res.status(400).json({
                            Error: "Incorrect password"
                        })
                }
                else if(old_password.length > 0 && new_password.length > 0){
                    let test = await bcrypt.compare(old_password, account[0].get('password'))
                    if(!test){
                        return res.status(400).json({
                            Error: "Old password doesn't match"
                        })
                    }
                    if(!checkPassword(new_password)){
                        return res.status(400).json({
                            Error: "New password needs to be stronger"
                        })
                    }

                    newData.password = await bcrypt.hash(new_password, 10);
                }

                //Least important details in terms of server validation and security
                newData.first_name = first_name.length > 0 ? first_name : newData.first_name
                newData.last_name = last_name.length > 0 ? last_name : newData.last_name
                newData.phone_number = phone_number.length > 0 ? phone_number : newData.phone_number
                newData.email_addr = email_addr.length > 0 ? email_addr : newData.email_addr;

                if(!checkEmail(newData.email_addr)){
                    return res.status(400).json({
                        Error: "Incorrect email format"
                    })
                }
            
                account[0].update(newData, {where :{id: id }})
                .then( result => {
                    req.session.userid.username = `${newData.first_name} ${newData.last_name}`
                    req.session.save();
                    return res.status(200).json({
                        Successful_Edit: {...newData, password: '*****************'}
                        
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        Error: err
                    })
                })
        }

        else{
            return res.status(200).json({
                Error: err
            })
        }
            
        
    })
}

/*
req.sessionStore.get(req.session.id, async (err,session) => {
        if(err){
            return res.status(200).json({
                Message: "Access denied"
            })      
        }
        const email = parseFromSession(session.userid.email);
        const account = await acc.findAll({where: {email_addr: email}})

        const parameters = parseFromJson(req.body)
        let hasPasswordParams = 1
        parameters.forEach(x => hasPasswordParams *= x == 'old_password' || x == 'new_password' ? 1: 0)

        if(!hasPasswordParams){
           acc.update(req.body, {
            where: {email_addr: email}
           })
           .then(result => {
                return res.status(200).json({
                    Message: "Settings were successfully edited no password"
                })
           })
           .catch(err => {
                return res.status(500).json({
                    Message: "Error occured with server"
                })
           })
        }
        const oldHash = account[0].get('password')
        console.log(`Old has -> ${oldHash}`);
        const oldPassword = req.body.old_password
        const test = await bcrypt.compare(oldPassword, oldHash)
        if(!test){
            return res.status(400).json({
                Message: "Incorrect password"
            })
        }
        
        if(!checkPassword(req.body.new_password)){

            return res.status(400).json({
                Message: "Password needs to be stronger"
            })
        }
        const newPass = await bcrypt.hash(req.body.new_password, 10);
        //TODO: handle the separate parameters
        const newData = getResponseBody(req.body);
        newData['password'] = newPass;
       
        acc.update(newData,
            {
                where: {email_addr: email}
            })
            .then( result =>{
                return res.status(200).json({
                    Message: "Settings were successfully edited with password"
                })
            })
        .catch(err => {
            return res.status(500).json({
                Message: "Error occured with server"
            })
        })
            
            
            
        
        //console.log(req.body);
        
    })
*/



export const settingsGet = settingsGetMethod;
export const settingsPatch = settingsPatchMethod