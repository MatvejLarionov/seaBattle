const Point = require("./Point")
const Ship = require("./Ship")

// const cellState = [
//     "empty",
//     "ship",
//     "destroyedShip",
//     "destroyedEmpty"
// ]
class Field {
    constructor(n, m) {
        this.n = n
        this.m = m
        this.arr = Array(n * m)
        this.arrShips = []
        for (let i = 0; i < this.arr.length; i++) {
            this.arr[i] = "empty"
        }

    }
    get length() {
        return this.arr.length
    }
    get(point) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.n && point.y < this.m)
            return this.arr[point.getIndex(this.n)]
    }
    set(point, state) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.n && point.y < this.m) {
            this.arr[point.getIndex(this.n)] = state
            return true
        }
        return false
    }
    setField(field) {
        this.n = field.n
        this.m = field.m
        this.arr = Array(this.n * this.m)
        for (let i = 0; i < this.arr.length; i++) {
            this.arr[i] = "empty"
        }
        this.arrShips = field.arrShips.map(item => {
            const ship = new Ship()
            ship.setShip(item)
            return ship
        })
        field.arr.forEach((item, index) => {
            const point = new Point()
            point.setIndex(index, this.n)
            this.set(point, item)
        })
    }
    setShip(ship, point, shipCenter) {
        ship.movToPoint(point, shipCenter)
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
    canSetShip(ship1, point, shipCenter, ignorShip = ship1) {
        const ship = ship1.copy()
        ship.movToPoint(point, shipCenter)
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
        return this.canSetShip(ship, newPoint, oldPoint)
    }
    movShip(oldPoint, newPoint) {
        const ship = this.deleteShip(oldPoint)
        if (ship)
            this.setShip(ship, newPoint, oldPoint)
    }
    canTurn_clockwise(point) {
        const ship = this.getShip(point).copy()
        ship.turn_clockwise(point)
        return this.canSetShip(ship, point, point, this.getShip(point))
    }
    turn_clockwise(point) {
        const ship = this.deleteShip(point)
        ship.turn_clockwise(point)
        this.setShip(ship, point, point)
    }
    canShoot(point) {
        return this.get(point) !== "destroyedShip" && this.get(point) !== "destroyedEmpty"
    }
    shoot(point) {
        const changeField = {}
        let type = "toEmpty"
        if (this.get(point) === "ship") {
            type = "toShip"
            const arrPoint = [
                new Point(1, 1),
                new Point(-1, 1),
                new Point(-1, -1),
                new Point(1, -1)
            ]
            this.set(point, "destroyedShip")
            changeField[point.getIndex(this.n)] = "destroyedShip"

            arrPoint.forEach(item => {
                const point1 = new Point(point.x + item.x, point.y + item.y)
                if (this.set(point1, "destroyedEmpty"))
                    changeField[point1.getIndex(this.n)] = "destroyedEmpty"
            })

            const ship = this.getShip(point)
            if (!ship.pointArray.find(item => this.get(item) === "ship")) {
                const arrPoint1 = [
                    new Point(1, 0),
                    new Point(1, 1),
                    new Point(0, 1),
                    new Point(-1, 1),
                    new Point(-1, 0),
                    new Point(-1, -1),
                    new Point(0, -1),
                    new Point(1, -1)
                ]
                ship.pointArray.forEach(item => {
                    arrPoint1.forEach(i => {
                        const point1 = new Point(item.x + i.x, item.y + i.y)
                        if (this.get(point1) !== "destroyedShip") {
                            if (this.set(point1, "destroyedEmpty"))
                                changeField[point1.getIndex(this.n)] = "destroyedEmpty"
                        }
                    })
                })
            }
        }
        else if (this.get(point) === "empty") {
            this.set(point, "destroyedEmpty")
            changeField[point.getIndex(this.n)] = "destroyedEmpty"
        }
        return { type, changeField }
    }
}
// const field = new Field(10, 10)
// const ship = new Ship(3)
// field.setShip(ship, new Point(4, 5))
// console.log(field)
// field.deleteShip(new Point(3, 5))
// console.log(field)

module.exports = Field