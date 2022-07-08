import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookie from 'cookie-parser'
import db from './../Models/dbConn.js'

const registerGet = (req,res) => {
    console.log("good get")
    return res.status(200).json({
        msg: "works"
    })
}
const registerPost = (req,res) => {
    console.log(req.body)
    return res.status(200).json({
        msg: req.body
    })
}

export default {
    registerGet: registerGet,
    registerPost: registerPost
}



