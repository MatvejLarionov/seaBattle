const { Router } = require("express");
const fs = require('fs')
const path = require("path");
const usersData = require("../data/usersData");

const router = Router()

router.get("/", (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, '../views/mainPage.html'), 'utf8'))
})
router.get("/bodyHtml/:id", (req, res) => {
    const id = req.params.id
    const user = usersData.getUserByEncryptString(id)
    res.render('mainPageBody.hbs', {
        login: user.login
    })
})
module.exports = router