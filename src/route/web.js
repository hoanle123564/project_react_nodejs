import express from 'express'
import { getHomePage } from '../controller/homeController'
const router = express.Router()

const initWebRoute = (app) => {
    router.get("/", getHomePage)
    return app.use("/", router)
}
module.exports = initWebRoute