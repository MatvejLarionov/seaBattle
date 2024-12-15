const http = require("http")
const express = require('express')
const WebSocket = require("ws")
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })
wsServer.on("connection", ws => {
    ws.on("message", message => {
        const ms = JSON.parse(message)
        switch (ms.type) {
            case "setLogin":
                ws.clientData = { login: ms.login }
                break;
            case "request to join":
                const clients = [...wsServer.clients]
                const partner = clients.find(item => item.clientData.login === ms.login)
                if (partner && partner !== ws) {
                    ws.clientData.partner = partner
                    partner.clientData.partner = ws
                    partner.send(JSON.stringify(
                        {
                            type: "request to join",
                            partnerLogin: ws.clientData.login
                        }
                    ))
                }
                else
                    ws.send(JSON.stringify({ type: "notFound" }))
                break;
            case "acceptJoin":
                ws.clientData.partner.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: ws.clientData.login
                }))
                ws.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: ws.clientData.partner.clientData.login
                }))
                break;
            case "rejectJoin":
                ws.clientData.partner.send(JSON.stringify({ type: "rejectJoin" }))
                ws.clientData.partner.clientData.partner = undefined
                ws.clientData.partner = undefined
                break;

            default:
                break;
        }
    })
})

app.set("view engine", "hbs")


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