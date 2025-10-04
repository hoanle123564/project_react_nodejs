import express from 'express'
import { getHomePage, getCRUD, postCRUD, displayGetCRUD } from '../controller/homeController'
const {
    handleLogin,
    handleGetAllUser,
    handleCreateNewUserAPI,
    handleEditUserAPI,
    handleDeleteNewUserAPI
} = require('../controller/userController')
const router = express.Router()

router.get('/crud', getCRUD)
router.get('/display-crud', displayGetCRUD)
router.post('/post-crud', postCRUD)
router.get("/", getHomePage)
router.post('/api/login', handleLogin)
router.get('/api/get-all-user', handleGetAllUser)
router.post('/api/create-new-user', handleCreateNewUserAPI)
router.put('/api/edit-user', handleEditUserAPI)
router.delete('/api/delete-user', handleDeleteNewUserAPI)
module.exports = router