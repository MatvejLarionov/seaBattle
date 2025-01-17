export class Point {
    constructor(x, y) {
        this.x = x || 0
        this.y = y || 0
    }
    getIndex(n) {
        return n * this.y + this.x
    }
    setIndex(index, n) {
        this.x = index % n
        this.y = Math.floor(index / n)

    }
    ConvertToNewPoint(arr, point) {
        const differenceX = point.x - arr[0].x
        const differenceY = point.y - arr[0].y

        return arr.map(item => {
            return new Point(item.x + differenceX, item.y + differenceY)
        })
    }
}