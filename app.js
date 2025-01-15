const http = require("http")
const WebSocket = require("ws")
const express = require('express')
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const wsRouter = require("./routes/wsRouter.js")
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })

app.use('/users', usersRouter)
app.use(express.static('./public'))
app.use((req, res) => res.status(404).send("<h2>Not found</h2>"))
server.listen(port, () => {
    console.log(`http://localhost:${port}`)
    if (process.argv.includes("localhost")) {
        const localIp = Object.values(require("os").networkInterfaces())[0]
            .find(item => item.family === "IPv4").address
        console.log(`http://${localIp}:${port}`)
    }
    if (process.argv.includes("externalhost")) {
        fetch('https://ipapi.co/json')
            .then(res => res.json())
            .then(res => {
                console.log(`http://${res.ip}:${port + 1}`)
            })
    }
})

wsServer.on("connection", wsRouter)