
import bcrypt from 'bcryptjs'
import acc from './../Models/accounts.js'
import sessionTable from './../Models/session.js'

//TODO: Integrate json-web-token




export const loginGet = (req,res) => {
    //Check if the session is valid
    return res.status(200).json({
        Message: "Login"
    })
    

}

export const loginPost = async (req,res) => {
   
    
    const loginee = req.body
    const accounts = await acc.findAll({where: {email_addr: loginee.email_addr}});
    if(accounts.length > 0){
        const hashed_password = accounts[0].get('password')
        const isCorrectPassowrd = await bcrypt.compare(loginee.password, hashed_password)

        if(isCorrectPassowrd){

            //creating the session for the user
            const sessionId = req.session.id
            req.session.userid = {username: `${accounts[0].get('first_name')} ${accounts[0].get('last_name')}`,
                              id: accounts[0].get('id'),
                              verified: !(accounts[0].get('isLocked'))}
                             
                        
            //console.log(`from the loginPost: ${req.session.userid}`);
            req.session.save(()=> {

                
                sessionTable.update({userId: accounts[0].get('id')}, {where: {sid: sessionId}})
                .then(result => {
                    console.log(`Update successful ${result}`);
                })
                .catch(err => {
                    console.log(`Error at update! ${err}`);
                })
            })

             return res.status(200).json({
                Message: `User named ${accounts[0].get('first_name')} ${accounts[0].get('last_name')} sucessfully logged in`
             })
           
             
        }
        
        return res.status(400).json({
            Error: 'Incorrect password'
        })
    }
   
     return res.status(400).json({
        Error: "Account doesn't exit"
     })
}

