const usersData = require("../data/usersData")
const encryptString = require("../utils/encryptString")

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
            resObj.id = encryptString(userNew.id)
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
            resObj.id = encryptString(user.id)
        }
        res.json(resObj)
    },
    getUser(req, res) {
        const id = req.params.id
        const user = usersData.getUserByEncryptString(id)
        delete user.password
        res.send(user)
    }
}
module.exports = usersController