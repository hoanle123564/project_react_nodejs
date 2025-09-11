import connection from '../config/data'
let getHomePage = async(req, res) => {
    try {
        //let data = await db.User.findAll();
        const [results, fields] = await connection.promise().query('select * from Users')
            //console.log(data);
        console.log(results);

        // return res.render('home.ejs', { users: data })
        return res.render('home.ejs', { users: results })

    } catch (err) {
        console.log("err", err);
    }

}
module.exports = { getHomePage }