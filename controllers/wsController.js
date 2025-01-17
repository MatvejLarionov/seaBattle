const usersData = require("../data/usersData")
const Field = require("../game/Field.js")
const Ship = require("../game/Ship.js")
const Point = require("../game/Point.js")

const users = []

const wsController = {
    authorization(user, ms) {
        const userData = usersData.getUserById(ms.id)
        const tempUser = users.find(item => item.id === userData.id)
        if (tempUser) {
            user = user.setUser(tempUser)
            clearTimeout(user.timeoutId)
            user.setStatus("connect")
        } else {
            user.login = userData.login
            user.id = userData.id
            users.push(user)
        }
        if (user.partner) {
            user.sendPartner()
            user.partner.sendPartnerStatus()
            user.sendDataByGameStage()
        }
    },
    requestToJoin(user, ms) {
        const partner = users.find(item => item.login === ms.login)
        if (partner && partner.id !== user.id && !partner.partner) {
            user.setPartner(partner)
            user.sendPartner()
            partner.sendPartner()
            partner.send({ type: "requestToJoin" })
        }
        else
            user.send({ type: "partnerIsNotFound" })
    },
    acceptJoin(user, ms) {
        user.partner.send({ type: "acceptJoin" })
        user.send({ type: "acceptJoin" })
    },
    rejectJoin(user, ms) {
        user.partner.send({ type: "rejectJoin" })
        user.removePartner()
    },
    disconnect(user, ms) {
        user.partner.send({ type: "disconnect" })
        user.removePartner()
    },
    readyToPlay(user, ms) {
        user.setStatus("readyPlay")
        if (user.partner.status === "readyPlay") {
            user.setStatus("connect")
            user.partner.setStatus("connect")
            user.sendPartnerStatus()
            user.partner.sendPartnerStatus()
            if (user.gameStage === "fillingField") {
                user.setGameStage("battle")
                user.partner.setGameStage("battle")
                if (Math.floor(Math.random() * 100) % 2 === 0)
                    user.isStep = true
                else
                    user.partner.isStep = true
                user.sendDataByGameStage(true)
                return;
            }

            user.resetGame()
            user.partner.resetGame()
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
            user.setGameStage("fillingField")
            user.partner.setGameStage("fillingField")
            user.sendDataByGameStage(true)
        }
        else
            user.partner.sendPartnerStatus()
    },
    notReadyToPlay(user, ms) {
        user.setStatus("connect")
        user.partner.sendPartnerStatus()
    },
    movShip(user, ms) {
        if (user.gameStage !== "fillingField")
            return
        const oldPoint = new Point()
        oldPoint.setIndex(ms.oldIndex, user.field.n)
        const newPoint = new Point()
        newPoint.setIndex(ms.newIndex, user.field.n)
        if (user.field.canMovShip(oldPoint, newPoint)) {
            user.field.movShip(oldPoint, newPoint)
        }
    },
    turn_clockwise(user, ms) {
        if (user.gameStage !== "fillingField")
            return
        const point = new Point()
        point.setIndex(ms.index, user.field.n)
        if (user.field.canTurn_clockwise(point)) {
            user.field.turn_clockwise(point)
        }
    },
    shootPartner(user, ms) {
        if (user.gameStage !== "battle" || ms.index===undefined)
            return
        const countOfShips = user.field.arrShips.length
        const point = new Point()
        point.setIndex(ms.index, user.partner.field.n)
        if (user.isStep && user.partner.field.canShoot(point)) {
            const shootResult = user.partner.field.shoot(point)
            for (const key in shootResult.changeField) {
                point.setIndex(key, user.partnerField.n)
                user.partnerField.set(point, shootResult.changeField[key])
            }
            if (shootResult.type === "toEmpty") {
                user.switchStep()
                user.sendStep(true)
            }
            else if (shootResult.type === "shipIsDead")
                user.partner.countOfDestShip++
            user.send({ type: "setOnPartnerField", data: shootResult.changeField })
            user.partner.send({ type: "setOnField", data: shootResult.changeField })

            if (user.partner.countOfDestShip >= countOfShips) {
                user.send({ type: "endGame", isWin: true })
                user.partner.send({ type: "endGame", isWin: false })
                user.setGameStage("connecting")
                user.partner.setGameStage("connecting")
            }
        }
    },
    close(user) {
        if (user.partner) {
            user.setStatus("disconnect")
            user.partner.sendPartnerStatus()
            user.timeoutId = setTimeout(() => {
                const index = users.findIndex(item => item.id === user.id)
                if (index !== -1) {
                    if (user.partner) {
                        user.partner.send({ type: "disconnect" })
                        user.removePartner()
                    }
                    users.splice(index, 1)
                }
            }, 10000)
        } else {
            const index = users.findIndex(item => item.id === user.id)
            if (index !== -1)
                users.splice(index, 1)
        }
    }
}

// setInterval(() => {
//     users.forEach(item => {
//         console.log(`login : ${item.login} partnerLogin : ${item.partner ? item.partner.login : item.partner}`)
//     })
//     console.log("--------")
// }, 2000)

module.exports = wsController