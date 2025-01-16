import { Field } from "./Field.js"
import { Point } from "./Point.js"

let isMoving = false, isMoveHappen = false, oldIndex = -1

export const game = {
    field: new Field(10, 10),
    partnerField: new Field(10, 10),
    webSocket: null,
    setWebSocket(webSocket) {
        this.webSocket = webSocket
    },
    movShip(newIndex) {
        const oldPoint = new Point(), newPoint = new Point()
        oldPoint.setIndex(oldIndex, this.field.n)
        newPoint.setIndex(newIndex, this.field.n)

        if (this.field.canMovShip(oldPoint, newPoint)) {
            this.webSocket.send(JSON.stringify({
                type: "movShip",
                oldIndex,
                newIndex
            }))
            this.field.movShip(oldPoint, newPoint)
            oldIndex = newIndex
        }
    },
    turnShip(index) {
        const point = new Point()
        point.setIndex(index, this.field.n)
        if (this.field.canTurn_clockwise(point)) {
            this.webSocket.send(JSON.stringify({
                type: "turn_clockwise",
                index: index
            }))
            this.field.turn_clockwise(point)
        }
    },
    movigShip(event) {
        const newIndex = event.target.dataset.index
        if (newIndex !== oldIndex) {
            isMoveHappen = true
            this.movShip(newIndex)
        }
    },
    translateShip(event) {
        const index = event.target.dataset.index
        const point = new Point()
        point.setIndex(index, this.field.n)
        if (isMoving) {
            gameField.removeEventListener("mousemove", this.movigShip)
            isMoving = false
            if (!isMoveHappen) {
                if (index === oldIndex)
                    this.turnShip(index)
                else
                    this.movShip(index)
            }
        } else {
            if (this.field.getShip(point)) {
                oldIndex = index
                isMoving = true
                isMoveHappen = false
                gameField.addEventListener("mousemove", this.movigShip)
            }
        }
    },
    setOnField(data) {
        const point = new Point()
        for (const key in data) {
            point.setIndex(key, this.field.n)
            this.field.set(point, data[key])
        }
    },
    setOnPartnerField(data) {
        const point = new Point()
        for (const key in data) {
            point.setIndex(key, this.partnerField.n)
            this.partnerField.set(point, data[key])
        }
    },
    fillingField(field) {
        const container = document.getElementById("container")
        container.className = "container1"
        const gameField = document.getElementById("gameField")

        this.field.setField(field)

        gameField.addEventListener("click", this.translateShip)

        this.field.elements.forEach((item, index) => {
            item.dataset.index = index
            gameField.append(item)
        })
    },
    battle(field, partnerField) {
        const container = document.getElementById("container")
        container.className = "container1"
        const gameField = document.getElementById("gameField")
        const partnerGameField = document.getElementById("partnerGameField")
        this.field.setField(field)
        this.partnerField.setField(partnerField)
        gameField.removeEventListener("click", this.translateShip)

        partnerGameField.addEventListener("click", (event) => {
            const index = event.target.dataset.index
            const point = new Point()
            point.setIndex(index, this.partnerField.n)

            if (this.partnerField.canShoot(point)) {
                this.webSocket.send(JSON.stringify({
                    type: "shootPartner",
                    index: index
                }))
            }
        })
        
        gameField.innerHTML = ""
        this.field.elements.forEach((item, index) => {
            item.dataset.index = index
            gameField.append(item)
        })
        this.partnerField.elements.forEach((item, index) => {
            item.dataset.index = index
            partnerGameField.append(item)
        })
    }
}
game.movigShip = game.movigShip.bind(game)
game.translateShip = game.translateShip.bind(game)