const usersData = require("../data/usersData")

const usersController = {
    registration(req, res) {
        const resObj = {
            error: null
        }
        const user = req.body
        if (JSON.stringify(usersData.read({ login: user.login })) !== '[]') {
            resObj.error = 'loginRepeat'
            res.json(resObj)
            return
        }
        usersData.create(user)
        res.json(resObj)
    }
}
module.exports = usersController