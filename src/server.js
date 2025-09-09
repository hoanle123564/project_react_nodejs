import express from 'express'
import bodyParser from 'body-parser'
import ViewEngine from '../src/config/viewEngine'
import initWebRoute from '../src/route/web'
//import { connectDB } from './config/connectDB'
require('dotenv').config()
let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

ViewEngine(app)
app.use('/', initWebRoute);

//connectDB();

let port = process.env.PORT
app.listen(port, () => {
    console.log('Backend nodejs is running on port: ' + port);

})