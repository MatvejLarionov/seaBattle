import { Field } from "./Field.js"
import { Point } from "./Point.js"
import { Ship } from "./Ship.js"

export const game = {
    field: new Field(10, 10),
    start() {
        const container = document.getElementById("container")
        container.className = "container1"
        const gameContainer = document.createElement("div")
        gameContainer.id = "gameContainer"
        container.append(gameContainer)
        const gameField = document.createElement("div")
        gameField.id = "gameField"
        gameField.classList.add("gameField")
        gameContainer.append(gameField)


        const arrShipsLength = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
        for (let i = 0; i < this.field.elements.length && arrShipsLength.length > 0; i++) {
            const ship = new Ship(arrShipsLength.at(-1))
            const point = new Point()
            point.setIndex(i, this.field.n)
            if (this.field.canSetShip(ship, point)) {
                this.field.setShip(ship, point)
                arrShipsLength.pop()
            }
        }

        let oldIndex;

        const movShip = (event) => {
            const newIndex = event.target.dataset.index
            if (newIndex !== oldIndex) {
                const oldPoint = new Point()
                oldPoint.setIndex(oldIndex, this.field.n)

                const newPoint = new Point()
                newPoint.setIndex(newIndex, this.field.n)


                if (this.field.canMovShip(oldPoint, newPoint)) {
                    this.field.movShip(oldPoint, newPoint)
                    oldIndex = newIndex
                }

            }
        }
        gameField.addEventListener("mousedown", (event) => {
            oldIndex = event.target.dataset.index
            const point = new Point()
            point.setIndex(oldIndex, this.field.n)
            if (this.field.getShip(point))
                gameField.addEventListener("mousemove", movShip)
        })
        gameField.addEventListener("mouseup", (event) => {
            gameField.removeEventListener("mousemove", movShip)
        })

        this.field.elements.forEach((item, index) => {
            item.dataset.index = index
            gameField.append(item)
        })
    }
}