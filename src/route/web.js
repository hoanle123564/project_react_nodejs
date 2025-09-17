import express from 'express'
import { getHomePage, getCRUD, postCRUD, displayGetCRUD } from '../controller/homeController'
const { handleLogin, handleGetAllUser, handleCreateNewUserAPI } = require('../controller/userController')
const router = express.Router()

router.get('/crud', getCRUD)
router.get('/display-crud', displayGetCRUD)
router.post('/post-crud', postCRUD)
router.get("/", getHomePage)
router.post('/api/login', handleLogin)
router.get('/api/get-all-user', handleGetAllUser)
router.post('/api/create-new-user', handleCreateNewUserAPI)
module.exports = router