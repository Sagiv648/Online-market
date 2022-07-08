import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';
import expSession from 'express-session'
import bcrypt from 'bcryptjs'
import cookie from 'cookie-parser'
import db from './../Models/dbConn.js'

const loginGet = (req,res) => {
    console.log(req.body)
}
const loginPost = (req,res) => {
    console.log("registerPost");
}

export default {
    loginGet: loginGet,
    loginPost: loginPost
}