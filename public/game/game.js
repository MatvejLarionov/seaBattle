import { Field } from "./Field.js"
import { Point } from "./Point.js"

export const game = {
    field: new Field(10, 10),
    partnerField: new Field(10, 10),
    webSocket: null,
    setWebSocket(webSocket) {
        this.webSocket = webSocket
    },
    fillingField(field) {
        const container = document.getElementById("container")
        container.className = "container1"
        const gameField = document.getElementById("gameField")

        this.field.setField(field)

        let oldIndex;

        const movShip = (event) => {
            const newIndex = event.target.dataset.index
            if (newIndex !== oldIndex) {
                const oldPoint = new Point()
                oldPoint.setIndex(oldIndex, this.field.n)

                const newPoint = new Point()
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

            }
        }
        let isMove = false
        gameField.addEventListener("click", (event) => {
            if (isMove) {
                gameField.removeEventListener("mousemove", movShip)
                isMove = false
                const newIndex = event.target.dataset.index
                if (newIndex !== oldIndex) {
                    if (this.field.canMovShip(oldPoint, newPoint)) {
                        this.webSocket.send(JSON.stringify({
                            type: "movShip",
                            oldIndex,
                            newIndex
                        }))
                        this.field.movShip(oldPoint, newPoint)
                        oldIndex = newIndex
                    }
                }
            } else {
                oldIndex = event.target.dataset.index
                const point = new Point()
                point.setIndex(oldIndex, this.field.n)
                if (this.field.getShip(point)) {
                    gameField.addEventListener("mousemove", movShip)
                    isMove = true
                }
            }
        })
        gameField.addEventListener("dblclick", (event) => {
            const point = new Point()
            point.setIndex(event.target.dataset.index, this.field.n)

            if (this.field.canTurn_clockwise(point)) {
                this.webSocket.send(JSON.stringify({
                    type: "turn_clockwise",
                    index: event.target.dataset.index
                }))
                this.field.turn_clockwise(point)
            }
        })

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
        this.webSocket.onmessage = (e) => {
            const body = JSON.parse(e.data)
            switch (body.type) {
                case "shootPartner":
                    const point = new Point()
                    point.setIndex(body.index, this.partnerField.n)
                    if (this.partnerField.canShoot(point)) {
                        this.partnerField.shoot(point, body.shootType)
                    }
                    break;
                case "shootUser":
                    const point1 = new Point()
                    point1.setIndex(body.index, this.field.n)
                    if (this.field.canShoot(point1)) {
                        this.field.shoot(point1)
                    }
                    break;
                default:
                    break;
            }

        }
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