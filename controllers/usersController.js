const usersData = require("../data/usersData")

const usersController = {
    registration(req, res) {
        const user = req.body
        if (JSON.stringify(usersData.read({ login: user.login })) !== '[]') {
            res.json(false)
            return
        }
        usersData.create(user)
        res.json(true)
    }
}
module.exports = usersController