import env from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser';

env.config()
const app = express();

app.set('views', 'ejs');
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('views'))


app.get('/', (req,res) => {
    res.status(200).send("working")
})

app.listen(process.env.PORT, process.env.HOST, ()=>{
    console.log(`Listening on ${process.env.HOST}:${process.env.PORT}`);
})
