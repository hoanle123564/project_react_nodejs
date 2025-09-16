import express from 'express'
import { getHomePage, getCRUD, postCRUD, displayGetCRUD } from '../controller/homeController'
const handleLogin = require('../controller/userController')
const router = express.Router()

router.get('/crud', getCRUD)
router.get('/display-crud', displayGetCRUD)
router.post('/post-crud', postCRUD)
router.get("/", getHomePage)
router.post('/api/login', handleLogin)
module.exports = router