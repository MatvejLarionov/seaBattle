const usersData = require("../data/usersData")

const usersController = {
    registration(req, res) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password.trim()
        const resObj = {
        }
        const user = req.body
        if (usersData.isLoginRepeat(user.login)) {
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
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password.trim()
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
    },
    getUser(req, res) {
        const id = req.params.id
        const user = usersData.getUserById(id)
        delete user.password
        res.json(user)
    },
    patchUser(req, res) {
        req.body.login = req.body.login.trim()
        req.body.password = req.body.password.trim()

        const id = req.params.id
        const error = usersData.update(id, req.body)
        res.json({ error: error })
    }
}
module.exports = usersController