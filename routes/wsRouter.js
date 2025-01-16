const usersData = require("../data/usersData.js")
const Field = require("../game/Field.js")
const wsController = require("../controllers/wsController.js")

const wsRouter = ws => {
    let user = {
        login: null,
        id: null,
        status: "connect",
        field: new Field(10, 10),
        partnerField: new Field(10, 10),
        countOfDestShip: 0,
        gameStage: "connecting",
        isStep: false,
        partner: undefined,
        ws,
        timeoutId: undefined,
        setUser(userData) {
            user = userData
            user.ws = ws
            return user
        },
        setStatus(status) {
            this.status = status
        },
        setGameStage(gameStage) {
            this.gameStage = gameStage
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
        resetGame() {
            this.field = new Field(10, 10)
            this.partnerField = new Field(10, 10)
            this.countOfDestShip = 0
            this.isStep = false
        },
        send(data) {
            this.ws.send(JSON.stringify(data))
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
        },
        sendDataByGameStage(isSendToPartner = false) {
            const gameStageToType = {
                connecting: { type: "acceptJoin" },
                fillingField: { type: "setGameStage", gameStage: this.gameStage, field: this.field },
                battle: {
                    type: "setGameStage",
                    gameStage: this.gameStage,
                    field: this.field,
                    partnerField: this.partnerField
                }
            }
            this.send(gameStageToType[this.gameStage])
            if (isSendToPartner)
                this.partner.sendDataByGameStage()
        }
    }
    ws.on("message", message => {
        const ms = JSON.parse(message)
        wsController[ms.type](user, ms)
    })
    ws.on("close", () => {
        wsController.close(user)
    })
}

module.exports = wsRouter