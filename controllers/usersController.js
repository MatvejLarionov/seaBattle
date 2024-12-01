const usersData = require("../data/usersData")

const usersController = {
    registration(req, res) {
        const resObj = {
        }
        const user = req.body
        if (JSON.stringify(usersData.read({ login: user.login })) !== '[]') {
            resObj.error = 'loginRepeat'
        }
        else {
            usersData.create(user)
            const userNew = usersData.read({ login: user.login, password: user.password })[0]
            resObj.id = userNew.id
        }
        res.json(resObj)
    },
    authorization(req, res) {
        const resObj = {
        }
        const user = usersData.read({ login: req.body.login, password: req.body.password })[0]
        if (!user) {
            resObj.error = 'invalidData'
        }
        else {
            resObj.id = user.id
        }
        res.json(resObj)
    }
}
module.exports = usersController