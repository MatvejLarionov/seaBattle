const { Router } = require("express");
const fs = require('fs')
const path = require("path");
const usersData = require("../data/usersData");
const encryptString = require("../utils/encryptString");

const router = Router()

router.get("/", (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, '../views/mainPage.html'), 'utf8'))
})
router.get("/bodyHtml/:id", (req, res) => {
    const id = req.params.id
    const users = usersData.read()
    const user = users.find(item => encryptString(item.id) === id)
    res.render('mainPageBody.hbs', {
        login: user.login
    })
})
module.exports = router