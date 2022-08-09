import {adjustChecksum} from './../utilities.js'
import dotnev from 'dotenv'
import moment from 'moment';
import accounts from './../Models/accounts.js'




dotnev.config();


export const emailVerGet = (req,res) => {

    
    //If the session exists, it means the user is logged in BUT has his account locked and unverified ->
    // therefore generate a checksum key to his email with the current checksum keys convention
    
    req.sessionStore.get(req.session.id, async (err, session) => {
        if(session){
            
            
            const logineeVerify = await accounts.findAll({where: {id: session.userid.id}});
            //console.log(logineeVerify[0]);
            if(logineeVerify.length == 0){
                res.status(500).json({
                    fault: "server fault"
                })
                
            }
            const {dataValues} = logineeVerify[0]; 
            const isUpdated = await adjustChecksum(dataValues, 0);
            if(isUpdated.length > 0){
                res.status(200).json({
                    Msg_email_user: "email sent loginee"
                })
            }
        }
        else{
            
            res.status(200).json({
            msg_email: "email sent registeree"
            })
        }
       
    })
    
    
    
    return res;
    
}

export const emailVerPost = async (req,res) => {

    const {verification_code } = req.body

    const id_check = verification_code.substr(7,verification_code.length)

    const accounts_list = await accounts.findAll({where: {id: id_check}});

    if(accounts_list.length == 0){
        return res.status(500).json({
            fault: "server fault"
        })
    }

    const lastChecksum = accounts_list[0].get('lastChecksum');
    const stamp = accounts_list[0].get('lastChecksumStamp');

    const now = moment.now();

    if(now - stamp >= 720000){
        return res.status(400).json({
            client_fault : `${(now-stamp) / 1000 / 60} minutes passed`
        })
    }
    else{
        
        if(lastChecksum == verification_code){

            const verified = await accounts_list[0].update({lastChecksum: "", lastChecksumStamp: 0, isLocked: false},
                                        {where: {id: id_check}})
            if(verified){
                req.sessionStore.get(req.session.id, (err, session) => {
                    if(session){
                        req.session.userid.verified = true;
                        req.session.save();
                    }
                })
            }
            return res.status(200).json({
                welcome: `You may now log in and access all features ${accounts_list[0].get('first_name')} ${accounts_list[0].get('last_name')}`
            })
        }
    }

    return res.status(400).json({
        user_fault: "incorrect code"
    })


 }





    /*
    console.log(`session id -> ${req.session.id}`);
    req.sessionStore.get(req.session.id, (err, session) => {
        if(session != null){

            //console.log(`session id -> ${session.id}`);
            console.log(`user name -> ${session.userid.username}`);
            const acc = accounts.findAll({where: {id: session.userid.id}})
            if(acc.length == 0){
                return res.status(400).json({
                    error: "need to register first"
                })
            }
            const stamp = acc[0].get('lastChecksumStamp');
            const checksum = acc[0].get('lastChecksum');

            const now = moment.now();
            if(now - stamp >= 720000){
                return res.status(400).json({
                    error: `time passed ${(now - stamp) / 1000 / 60}`
                })
            }
            else{
                if(checksum == req.verification_code){
                    const updated = acc[0].update({isLocked: false,
                                                        lastChecksum: "",
                                                         lastChecksumStamp: 0},
                                                        {where: {id: session.userid.id}})
                    if(updated == 0){
                        return res.status(500).json({
                            error: "server error with updated"
                        })
                    }
                    req.session.destroy(err => {
                        return res.status(200).json({
                            msg: "Successfully verified your account, may log in now"
                        })
                    })
                    
                }
                return res.status(400).json({
                    msg: "Incorrect code"
                })


            }
        }
        else{
            return res.status(400).json({
                errorAccess: "access denied with session",
                err
            })
        }
    })
    */
    

