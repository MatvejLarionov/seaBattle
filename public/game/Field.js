import { Point } from "./Point.js"
import { Ship } from "./Ship.js"


const cellColor = {
    empty: "white",
    ship: "green",
    destroyedShip: "red",
    destroyedEmpty: "#A0A0A0"
}
const colorCell = {}
Object.keys(cellColor).forEach(item => {
    colorCell[cellColor[item]] = item
})
export class Field {
    constructor(n, m) {
        this.n = n
        this.m = m
        this.arr = Array(n * m)
        this.arrShips = []
        for (let i = 0; i < this.arr.length; i++) {
            const div = document.createElement("div")
            div.style.backgroundColor = cellColor.empty
            this.arr[i] = div

        }

    }
    get elements() {
        return this.arr
    }
    get(point) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.n && point.y < this.m)
            return colorCell[this.arr[point.getIndex(this.n)].style.backgroundColor]
    }
    set(point, state) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.n && point.y < this.m) {
            this.arr[point.getIndex(this.n)].style.backgroundColor = cellColor[state]
            return true
        }
        return false
    }
    setShip(ship, centerPoint) {
        ship.movToPoint(centerPoint)
        this.arrShips.push(ship)
        ship.pointArray.forEach(item => {
            this.set(item, "ship")
        })
    }
    getIndexShip(point) {
        for (let i = 0; i < this.arrShips.length; i++) {
            const pointArray = this.arrShips[i].pointArray
            for (let j = 0; j < pointArray.length; j++) {
                if (pointArray[j].x === point.x && pointArray[j].y === point.y)
                    return i
            }
        }
    }
    getShip(point) {
        const index = this.getIndexShip(point)
        if (index !== undefined)
            return this.arrShips[index]
    }
    canSetShip(ship1, centerPoint, ignorShip = ship1) {
        const ship = ship1.copy()
        ship.movToPoint(centerPoint)
        const pointArr = ship.pointArray
        const tempArr = [new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(-1, 1),
        new Point(-1, 0), new Point(-1, -1), new Point(0, -1), new Point(1, -1),]
        for (let i = 0; i < pointArr.length; i++) {
            const point1 = pointArr[i]
            if (point1.x < 0 || point1.y < 0 || point1.x >= this.n || point1.y >= this.m) {
                return false
            }
            for (let j = 0; j < tempArr.length; j++) {
                const point2 = new Point(point1.x + tempArr[j].x, point1.y + tempArr[j].y)
                if (this.getShip(point2) !== ignorShip &&
                    (this.get(point2) === "ship" || this.get(point2) === "destroyedShip"))
                    return false
            }
        }
        return true
    }
    deleteShip(point) {
        const index = this.getIndexShip(point)
        if (index === undefined)
            return
        const ship = this.arrShips[index]
        ship.pointArray.forEach(item => {
            this.set(item, "empty")
        })
        return this.arrShips.splice(index, 1).at(0)
    }
    canMovShip(oldPoint, newPoint) {
        const ship = this.getShip(oldPoint)
        return this.canSetShip(ship, newPoint)
    }
    movShip(oldPoint, newPoint) {
        const ship = this.deleteShip(oldPoint)
        if (ship)
            this.setShip(ship, newPoint)
    }
    canTurn_clockwise(point) {
        const ship = this.getShip(point).copy()
        ship.turn_clockwise()
        return this.canSetShip(ship, point, this.getShip(point))
    }
    turn_clockwise(point) {
        const ship = this.deleteShip(point)
        ship.turn_clockwise()
        this.setShip(ship, point)
    }
}
// const field = new Field(10, 10)
// const ship = new Ship(3)
// field.setShip(ship, new Point(4, 5))
// console.log(field)
// field.deleteShip(new Point(3, 5))
// console.log(field)