const { Router } = require("express");
const usersController = require("../controllers/usersController");

const router = Router()

router.get("/", (req, res) => {
    res.render("main.hbs", {
        text: "hello world"
    })
})
module.exports = router