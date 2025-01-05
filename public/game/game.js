import { Field } from "./Field.js"
import { panel } from "./panel.js"
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

        panel.fillIn([1, 1, 1, 1, 2, 2, 2, 3, 3, 4])
        gameContainer.append(panel.element)


        this.field.elements.forEach((item, index) => {
            item.addEventListener("click", () => {
                if (panel.selectedElement) {
                    const point = new Point()
                    point.setIndex(index, this.field.n)
                    const ship = new Ship(panel.lengthSelectedElement)
                    if (this.field.canSetShip(ship, point)) {
                        this.field.setShip(ship, point)
                        panel.removeSelectedElement()
                    }
                }
            })
            item.addEventListener("dblclick", () => {
                const point = new Point()
                point.setIndex(index, this.field.n)
                const ship = this.field.deleteShip(point)
                if (ship)
                    panel.addElement(ship.length)
            })
            item.addEventListener("contextmenu", () => {
                console.log('asdf')
            })
            gameField.append(item)
        })
    }
}