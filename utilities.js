import accounts from './Models/accounts.js';
import dotenv from 'dotenv';
import emailer from 'nodemailer'
import moment from 'moment'
import orders from './Models/order.js'
import products from './Models/products.js';
dotenv.config();

export const removeUnverifiedAccounts = async ()=> {

    
    const deleted = await accounts.destroy({where: {isLocked: 1}});
    console.log(`Deleted ${deleted} unverified accounts.`);    
}

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


const generateEmailMsg = (account, isRegisteree, checksum) => {
    
    if(isRegisteree){
         var registereeMessage = {
                    from: process.env.EMAILSENDER,
                    to: account.email_addr,
                    subject: "Online market verification",
                    html: `
                    <h2 style="color:blue;"> Hello ${account.first_name} ${account.last_name} </h2>
                    <p>We thank you for giving our market a chance.</p><br> 
                    <p>However in order to fully browse our stock you will need to verify your account, the verification code is listed below:</p>
                    <p>Your verification code is ${checksum}${account.id}</p><br>
                    <p>NOTE: The verification code will expire in 10 minutes.</p><br>
                    <p>Warning: Unverified accounts are deleted everyday at midnight - 24:00</p>`
                    };
        return registereeMessage;
    }
    else{
        var loggedIn = {
                    from: process.env.EMAILSENDER,
                    to: account.email_addr,
                    subject: "Online market verification",
                    html: `
                    <h2 style="color:blue;"> Hello ${account.first_name} ${account.last_name}</h2>
                    <p>You are registered to our services but not yet verified </p><br> 
                    <p>Until you verify yourself you will not have access to the store, the verification code is listed below:</p>
                    <p>Your verification code is ${checksum}${account.id}</p><br>
                    <p>NOTE: The verification code will expire in 10 minutes.</p><br>
                    <p>Warning: Unverified accounts are deleted everyday on 00:00</p>`
                    };
        return loggedIn;
    }

}

export const emailVerification = async (account, isRegisteree) => {
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
        //const checksum = await bcrypt.hash(verNumber.toString(), 3);

        var message = generateEmailMsg(account, isRegisteree, verNumber);

         transport.sendMail(message)
         .then(response => {
            console.log(`Email: email sent:\n ${response.envelope}`);
         })
         .catch(err => {
            console.log(`Error: \n ${err}`);
         })

    return `${verNumber}${account.id}-${moment.now()}`

}

export const adjustChecksum = async (account, isRegisteree)=> {

    const check = await emailVerification(account, isRegisteree);
    const checksumArr = check.split('-');
    const checkSumTimestamp = parseInt(checksumArr[1]);
    
    const updatedRows = await accounts.update({lastChecksum: checksumArr[0], lastChecksumStamp: checkSumTimestamp}, {where: {id: account.id}});
    
    
    return updatedRows;
    
}

export const authenticate = (req,res, next) => {
    req.sessionStore.get(req.session.id, (err, session) => {
        if(session && session.userid.verified){
            next();
        }
        else{
            res.status(401).json({
                fault: "un-authenticated."
            })
        }
    })
}

export const adminAuthenticate = (req,res, next) => {
    req.sessionStore.get(req.session.id, async (err, session) => {
        if(session){
            const isAdmin = await accounts.findAll({where: {id: session.userid.id}});
            if(isAdmin[0].get('isPrivilieged')){
                next();
            }
            else{
                res.status(403).json({
                    fault: "un-privilieged"
                })
            }
        }
        else{
            res.status(401).json({
                fault: "un-authenticated"
            })
        }
    })
}

export const adminIdentityVerification = (req,res, next) => {
    if(!req.query){
        return res.status(403).json({
            fault: "access denied."
        })
    }
    const {admpass} = req.query;

    if(admpass == process.env.ADMIN_PASSWORD){
        next();
    }

    res.status(403).json({
        fault: "access denied"
    })

}

//2. add functionality in the main route to check if any products by their id are in stock ->
//   if they are not in stock, alert user
export const retrieveOutOfStock = async (userId) =>{

    const ordersById = await orders.findAll({where : {account_id: userId}});

    const outOfStock = [];
    for(let i = 0; i < ordersById.length; i++){
        var tmp = await products.findAll({where: {id: ordersById[i].get('product_id'), stock: 0}})
        if(tmp.length != 0){
            outOfStock.push(tmp[0]);
        }
    }
    
    return outOfStock;

}
export const retrieveTotalPrice = async (productList) => {

    var total = 0.0;
    if(productList.length == 0){
        return 0;
    }
    for(let i = 0; i < productList.length; i++){
        var tmp = await products.findByPk(productList[i].product_id);
        total += (tmp.get('price') * parseInt(productList[i].amount));
    }

    

    return total;

    
}
export const isNumeric = (numberString) =>{
    for(let i = 0; i < numberString.length; i++){
        if(numberString[i] < '0' || numberString[i] > '9'){
            return 0;
        }
    }
    return 1;
}
export const isAmountExceeds = async (amount, pid) =>{

    const productInQuestion = await products.findByPk(pid);
    return productInQuestion.get('stock') < amount
}