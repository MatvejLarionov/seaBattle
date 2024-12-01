const express = require('express')
const signInRouter = require('./routes/signIn')
const mainPageRouter = require('./routes/mainPage.js')
const app = express()
const port = 3000

app.set("view engine", "hbs")

app.use('/signIn', signInRouter)
app.use("/main", mainPageRouter)
app.use(express.static('./public'))
app.use((req, res) => res.status(404).send("<h2>Not found</h2>"))
app.listen(port, () => console.log(`http://localhost:${port}`))