const express = require('express')
const bodyParser = require('body-parser')
const ViewEngine = require('../src/config/viewEngine')
const initWebRoute = require('../src/route/web')
const cors = require('cors')
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