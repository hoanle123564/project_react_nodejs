import connection from '../config/data'
const { createNewUser, getAllUser } = require('../service/CRUDservice')
let getHomePage = async(req, res) => {
    try {
        const [results, fields] = await connection.promise().query('select * from Users')
        console.log(results);

        return res.render('home.ejs', { users: results })

    } catch (err) {
        console.log("err", err);
    }

}
let getCRUD = (req, res) => {
    return res.render('CRUD.ejs')
}
let postCRUD = async(req, res) => {
    await createNewUser(req.body);
    console.log(req.body);
    return res.send('post CRUD from Server')

}
let displayGetCRUD = async(req, res) => {
    const data = await getAllUser()
    return res.send('display get CRUD from server')
}
module.exports = { getHomePage, getCRUD, postCRUD, displayGetCRUD }