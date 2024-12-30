const http = require("http")
const express = require('express')
const WebSocket = require("ws")
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const usersData = require("./data/usersData.js")
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })
wsServer.on("connection", ws => {
    const user = {
        login: null,
        id: null,
        partner: undefined
    }
    ws.on("message", message => {
        const ms = JSON.parse(message)
        switch (ms.type) {
            case "authorization":
                const clients1 = [...wsServer.clients]
                const userData = usersData.getUserById(ms.id)
                user.login = userData.login
                user.id = userData.id
                ws.user = user

                const partner1 = clients1.find(item => {
                    if (item.user.partner)
                        return item.user.partner.user.id == ws.user.id
                    return false
                })
                if (partner1) {
                    ws.user.partner = partner1
                    ws.send(JSON.stringify({
                        type: "acceptJoin",
                        partnerLogin: ws.user.partner.user.login
                    }))
                    ws.user.partner.send(JSON.stringify({
                        type: "acceptJoin",
                        partnerLogin: ws.user.login
                    }))
                }
                break;
            case "request to join":
                const clients = [...wsServer.clients]
                const partner = clients.find(item => item.user.login === ms.login)
                if (partner && partner !== ws) {
                    ws.user.partner = partner
                    partner.user.partner = ws
                    partner.send(JSON.stringify(
                        {
                            type: "request to join",
                            partnerLogin: ws.user.login
                        }
                    ))
                }
                else
                    ws.send(JSON.stringify({ type: "partnerIsNotFound" }))
                break;
            case "acceptJoin":
                ws.user.partner.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: ws.user.login
                }))
                ws.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: ws.user.partner.user.login
                }))
                break;
            case "rejectJoin":
                ws.user.partner.send(JSON.stringify({ type: "rejectJoin" }))
                ws.user.partner.user.partner = undefined
                ws.user.partner = undefined
                break;

            default:
                break;
        }
    })
    ws.on("close", () => {
        if (user.partner) {
            user.partner.send(JSON.stringify({ type: "partnerIsDisconnect" }))
        }
        delete user
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