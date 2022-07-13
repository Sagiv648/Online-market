import {emailVerification} from './register.js'
import axios from 'axios'
import dotnev from 'dotenv'
import moment from 'moment';
import accounts from './../Models/accounts.js'
import session from 'express-session'



dotnev.config();


export const emailVerGet = (req,res) => {


    
    return res.status(200).json({
        Msg: "Email sent."
    })
    
}

export const emailVerPost = async (req,res) => {

req.sessionStore.get(req.session.id, (err, session) => {
    if(session){
        return res.status(200).json({
            session
        })
    }
    else{
        return res.status(400).json({
            err
        })
    }
})











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
    
}
