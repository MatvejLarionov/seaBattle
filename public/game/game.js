import { Field } from "./Field.js"
import { Point } from "./Point.js"

export const game = {
    field: new Field(10, 10),
    webSocket: null,
    setWebSocket(webSocket) {
        this.webSocket = webSocket
    },
    fillingField(field) {
        const container = document.getElementById("container")
        container.className = "container1"
        const gameContainer = document.createElement("div")
        gameContainer.id = "gameContainer"
        container.append(gameContainer)
        const gameField = document.createElement("div")
        gameField.id = "gameField"
        gameField.classList.add("gameField")
        gameContainer.append(gameField)

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
    }
}