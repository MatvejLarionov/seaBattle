const express = require('express')
const router = require('./routes/signIn')
const app = express()
const port = 3000

app.use('/signIn', router)
app.use(express.static('./public'))
app.use((req, res) => res.status(404).send("<h2>Not found</h2>"))
app.listen(port, () => console.log(`http://localhost:${port}`))