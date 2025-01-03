const http = require("http")
const express = require('express')
const WebSocket = require("ws")
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const usersData = require("./data/usersData.js")
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })

const users = []

wsServer.on("connection", ws => {
    const user = {
        login: null,
        id: null,
        ws,
        partner: undefined
    }
    ws.on("message", message => {
        const ms = JSON.parse(message)
        switch (ms.type) {
            case "authorization":
                const userData = usersData.getUserById(ms.id)
                user.login = userData.login
                user.id = userData.id
                users.push(user)

                const partner1 = users.find(item => {
                    if (item.partner)
                        return item.partner.id === user.id
                    return false
                })
                if (partner1) {
                    user.partner = partner1
                    user.partner.partner = user
                    ws.send(JSON.stringify({
                        type: "acceptJoin",
                        partnerLogin: user.partner.login
                    }))
                    user.partner.ws.send(JSON.stringify({
                        type: "acceptJoin",
                        partnerLogin: user.login
                    }))
                }
                break;
            case "request to join":
                const partner = users.find(item => item.login === ms.login)
                if (partner && partner.id !== user.id) {
                    user.partner = partner
                    partner.partner = user
                    partner.ws.send(JSON.stringify(
                        {
                            type: "request to join",
                            partnerLogin: user.login
                        }
                    ))
                }
                else
                    ws.send(JSON.stringify({ type: "partnerIsNotFound" }))
                break;
            case "acceptJoin":
                user.partner.ws.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: user.login
                }))
                ws.send(JSON.stringify({
                    type: "acceptJoin",
                    partnerLogin: user.partner.login
                }))
                break;
            case "rejectJoin":
                user.partner.ws.send(JSON.stringify({ type: "rejectJoin" }))
                user.partner.partner = undefined
                user.partner = undefined
                break;
            case "disconnect":
                user.partner.ws.send(JSON.stringify({ type: "disconnect" }))
                user.partner.partner = undefined
                user.partner = undefined
            default:
                break;
        }
    })
    ws.on("close", () => {
        if (user.partner) {
            user.partner.ws.send(JSON.stringify({ type: "partnerIsDisconnect" }))
        }
        const index = users.findIndex(item => item.id === user.id)
        if (index !== -1)
            users.splice(index, 1)
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

// setInterval(() => {
//     users.forEach(item => {
//         console.log(`login : ${item.login} partnerLogin : ${item.partner ? item.partner.login : item.partner}`)
//     })
//     console.log("--------")
// }, 2000)