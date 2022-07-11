import {emailVerification} from './register.js'


const validateChecksum = (checksum) =>{

}

export const emailVerGet = (req,res) => {

    const checkSum = decodeURIComponent (req.body)
    //When the email was sent
    return res.status(200).json({
        checkSum
    })
}

export const emailVerPost = (req,res) => {

    return res.status(200).json({
        msg: "req.query.ver"
    })
}
