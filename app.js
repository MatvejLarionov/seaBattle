const http = require("http")
const express = require('express')
const WebSocket = require("ws")
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const usersData = require("./data/usersData.js")
const Field = require("./game/Field.js")
const Ship = require("./game/Ship.js")
const Point = require("./game/Point.js")
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })

const users = []

wsServer.on("connection", ws => {
    let user = {
        login: null,
        id: null,
        status: "connect",
        field: undefined,
        partnerField: undefined,
        gameStage: "connecting",
        partner: undefined,
        ws,
        timeoutId: undefined
    }
    ws.on("message", message => {
        const ms = JSON.parse(message)
        switch (ms.type) {
            case "authorization":
                const userData = usersData.getUserById(ms.id)
                const tempUser = users.find(item => item.id === userData.id)
                if (tempUser) {
                    user = tempUser
                    clearTimeout(user.timeoutId)
                    user.status = "connect"
                    user.ws = ws
                } else {
                    user.login = userData.login
                    user.id = userData.id
                    users.push(user)
                }
                if (user.partner) {
                    ws.send(JSON.stringify({
                        type: "setPartner",
                        partner: { login: user.partner.login, status: user.partner.status }
                    }))
                    user.partner.ws.send(JSON.stringify({
                        type: "changeStatus",
                        status: "connect"
                    }))
                    ws.send(JSON.stringify({
                        type: "acceptJoin",
                    }))
                }
                break;
            case "requestToJoin":
                const partner = users.find(item => item.login === ms.login)
                if (partner && partner.id !== user.id) {
                    user.partner = partner
                    partner.partner = user
                    ws.send(JSON.stringify({
                        type: "setPartner",
                        partner: { login: user.partner.login, status: user.partner.status }
                    }))
                    partner.ws.send(JSON.stringify({
                        type: "setPartner",
                        partner: { login: user.login, status: user.status }
                    }))
                    partner.ws.send(JSON.stringify(
                        {
                            type: "requestToJoin"
                        }
                    ))
                }
                else
                    ws.send(JSON.stringify({ type: "partnerIsNotFound" }))
                break;
            case "acceptJoin":
                user.partner.ws.send(JSON.stringify({
                    type: "acceptJoin"
                }))
                ws.send(JSON.stringify({
                    type: "acceptJoin"
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
                break;
            case "ready to play":
                user.status = "readyPlay"
                if (user.partner.status === "readyPlay") {
                    user.gameStage = "fillingField"
                    user.partner.gameStage = "fillingField"
                    user.field = new Field(10, 10)
                    user.partner.field = new Field(10, 10)
                    const arrShipsLength = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
                    for (let i = 0; i < user.field.length && arrShipsLength.length > 0; i++) {
                        const ship = new Ship(arrShipsLength.at(-1))
                        const point = new Point()
                        point.setIndex(i, user.field.n)
                        if (user.field.canSetShip(ship, point)) {
                            user.field.setShip(ship, point)
                            user.partner.field.setShip(ship.copy(), point)
                            arrShipsLength.pop()
                        }
                    }
                    ws.send(JSON.stringify({
                        type: "setGameStage",
                        gameStage: "fillingField",
                        field: user.field
                    }))
                    user.partner.ws.send(JSON.stringify({
                        type: "setGameStage",
                        gameStage: "fillingField",
                        field: user.partner.field
                    }))
                }
                else
                    user.partner.ws.send(JSON.stringify({ type: "changeStatus", status: "readyPlay" }))
                break;
            case "not ready to play":
                user.status = "connect"
                user.partner.ws.send(JSON.stringify({ type: "changeStatus", status: "connect" }))
                break;
            default:
                break;
        }
    })
    ws.on("close", () => {
        if (user.partner) {
            user.status = "disconnect"
            user.partner.ws.send(JSON.stringify({ type: "changeStatus", status: "disconnect" }))
            user.timeoutId = setTimeout(() => {
                const index = users.findIndex(item => item.id === user.id)
                if (index !== -1) {
                    user.partner.ws.send(JSON.stringify({ type: "disconnect" }))
                    user.partner.partner = undefined
                    users.splice(index, 1)
                }
            }, 10000)
        } else {
            const index = users.findIndex(item => item.id === user.id)
            if (index !== -1)
                users.splice(index, 1)
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

// setInterval(() => {
//     users.forEach(item => {
//         console.log(`login : ${item.login} partnerLogin : ${item.partner ? item.partner.login : item.partner}`)
//     })
//     console.log("--------")
// }, 2000)