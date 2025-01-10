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
        field: new Field(10, 10),
        partnerField: new Field(10, 10),
        gameStage: "connecting",
        isStep: false,
        partner: undefined,
        ws,
        timeoutId: undefined,
        setUser(userData) {
            user = userData
            user.ws = ws
        },
        send(data) {
            this.ws.send(JSON.stringify(data))
        },
        setPartner(partner) {
            this.partner = partner
            this.partner.partner = this
        },
        removePartner() {
            this.partner.partner = undefined
            this.partner = undefined
        },
        switchStep() {
            const temp = this.isStep
            this.isStep = this.partner.isStep
            this.partner.isStep = temp
        },
        sendPartner() {
            this.send({
                type: "setPartner",
                partner: { login: this.partner.login, status: this.partner.status }
            })
        },
        sendPartnerStatus() {
            this.send({
                type: "changeStatus",
                status: this.partner.status
            })
        }
    }
    ws.on("message", message => {
        const ms = JSON.parse(message)
        switch (ms.type) {
            case "authorization":
                const userData = usersData.getUserById(ms.id)
                const tempUser = users.find(item => item.id === userData.id)
                if (tempUser) {
                    user.setUser(tempUser)
                    clearTimeout(user.timeoutId)
                    user.status = "connect"
                } else {
                    user.login = userData.login
                    user.id = userData.id
                    users.push(user)
                }
                if (user.partner) {
                    user.sendPartner()
                    user.partner.sendPartnerStatus()
                    const gameStageToType = {
                        connecting: { type: "acceptJoin" },
                        fillingField: { type: "setGameStage", gameStage: user.gameStage, field: user.field },
                        battle: {
                            type: "setGameStage",
                            gameStage: user.gameStage,
                            field: user.field,
                            partnerField: user.partnerField
                        }
                    }
                    user.send(gameStageToType[user.gameStage])
                }
                break;
            case "requestToJoin":
                const partner = users.find(item => item.login === ms.login)
                if (partner && partner.id !== user.id) {
                    user.setPartner(partner)
                    user.sendPartner()
                    partner.sendPartner()
                    partner.send({ type: "requestToJoin" })
                }
                else
                    user.send({ type: "partnerIsNotFound" })
                break;
            case "acceptJoin":
                user.partner.send({ type: "acceptJoin" })
                user.send({ type: "acceptJoin" })
                break;
            case "rejectJoin":
                user.partner.send({ type: "rejectJoin" })
                user.removePartner()
                break;
            case "disconnect":
                user.partner.send({ type: "disconnect" })
                user.removePartner()
                break;
            case "ready to play":
                user.status = "readyPlay"
                if (user.partner.status === "readyPlay") {
                    user.status = "connect"
                    user.partner.status = "connect"
                    user.sendPartnerStatus()
                    user.partner.sendPartnerStatus()
                    if (user.gameStage === "fillingField") {
                        user.gameStage = "battle"
                        user.partner.gameStage = "battle"
                        user.isStep = true
                        user.send({
                            type: "setGameStage",
                            gameStage: "battle",
                            field: user.field,
                            partnerField: user.partnerField
                        })
                        user.partner.send({
                            type: "setGameStage",
                            gameStage: "battle",
                            field: user.partner.field,
                            partnerField: user.partner.partnerField
                        })
                        break;
                    }

                    user.gameStage = "fillingField"
                    user.partner.gameStage = "fillingField"
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
                    user.send({
                        type: "setGameStage",
                        gameStage: "fillingField",
                        field: user.field
                    })
                    user.partner.send({
                        type: "setGameStage",
                        gameStage: "fillingField",
                        field: user.partner.field
                    })
                }
                else
                    user.partner.sendPartnerStatus()
                break;
            case "not ready to play":
                user.status = "connect"
                user.partner.sendPartnerStatus()
                break;
            case "movShip":
                const oldPoint = new Point()
                oldPoint.setIndex(ms.oldIndex, user.field.n)
                const newPoint = new Point()
                newPoint.setIndex(ms.newIndex, user.field.n)
                if (user.field.canMovShip(oldPoint, newPoint)) {
                    user.field.movShip(oldPoint, newPoint)
                }
                break;
            case "turn_clockwise":
                const point = new Point()
                point.setIndex(ms.index, user.field.n)
                if (user.field.canTurn_clockwise(point)) {
                    user.field.turn_clockwise(point)
                }
                break;
            case "shootPartner":
                const point1 = new Point()
                point1.setIndex(ms.index, user.partner.field.n)
                if (user.isStep && user.partner.field.canShoot(point1)) {
                    const shootType = user.partner.field.shoot(point1)
                    user.partnerField.shoot(point1, shootType)
                    if (shootType !== "toShip") {
                        user.switchStep()
                    }
                    user.send({ type: "shootPartner", index: ms.index, shootType })
                    user.partner.send({ type: "shootUser", index: ms.index })
                }
                break;
            default:
                break;
        }
    })
    ws.on("close", () => {
        if (user.partner) {
            user.status = "disconnect"
            user.partner.sendPartnerStatus()
            user.timeoutId = setTimeout(() => {
                const index = users.findIndex(item => item.id === user.id)
                if (index !== -1) {
                    user.partner.send({ type: "disconnect" })
                    user.removePartner()
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