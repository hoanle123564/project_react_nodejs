import express from 'express'
import bodyParser from 'body-parser'
import ViewEngine from '../src/config/viewEngine'
import initWebRoute from '../src/route/web'
import cors from 'cors'
require('dotenv').config()

let app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

ViewEngine(app)
app.use('/', initWebRoute);

//connectDB();

let port = process.env.PORT
app.listen(port, () => {
    console.log('Backend nodejs is running on port: ' + port);

})