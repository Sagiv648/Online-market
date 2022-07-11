
const logoutMethodGet = (req, res) => {
    return res.status(200).json({
        Message: "Logout"
    })
}

const logoutMethodDelete = (req, res) => {
    //Delete the row with the request's sid
    req.session.destroy( (err) => {

        return res.status(200).json({
            Message: "Logged out"
        })   
    })
}

export const logoutGet = logoutMethodGet
export const logoutDelete = logoutMethodDelete