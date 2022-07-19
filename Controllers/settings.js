
import bcrypt from 'bcryptjs'

import acc from './../Models/accounts.js'
import { checkPassword } from './register.js';






export const settingsGet = (req, res) => {
    
    req.sessionStore.get(req.session.id, async (err, session) => {
        
        if(session){

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

export const settingsPatch = (req, res, next) => {


    req.sessionStore.get(req.session.id, async (err, session) => {

        if(session != null){
            
            const id = req.session.userid.id;

            const account = await acc.findAll({where: {id: id}})

            if(account.length == 0){
                return res.status(400).json({
                    Error: "Error occured with session and id"
                })
            }

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
            return res.status(400).json({
                Error: err
            })
        }
            
        
    })
}


