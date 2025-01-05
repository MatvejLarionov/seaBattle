import { Point } from "./Point.js"



export class Ship {
    constructor(size) {
        this.arr = Array(size)
        
        this.arr[0] = new Point()
        let j = 1
        for (let i = 1; i < this.arr.length - 1; i += 2, j++) {
            this.arr[i] = new Point(j, 0)
            this.arr[i + 1] = new Point(-j, 0)
        }
        if (size % 2 === 0)
            this.arr[size - 1] = new Point(j, 0)
    }
    turn_clockwise(listPoint) {
        const center = listPoint[0];

        let difference_x = 0;
        let difference_y = 0;

        for (let i = 1; i < listPoint.length; i++) {
            difference_x = center.x - listPoint[i].x;//0
            difference_y = center.y - listPoint[i].y;//1
            listPoint[i].x = center.x + difference_y;//2
            listPoint[i].y = center.y - difference_x;//1

        }
        return listPoint;
    }
    turn_counterclockwise(listPoint) {
        const center = listPoint[0];

        let difference_x = 0;
        let difference_y = 0;

        for (let i = 1; i < listPoint.length; i++) {
            difference_x = center.x - listPoint[i].x;//0
            difference_y = center.y - listPoint[i].y;//1
            listPoint[i].x = center.x - difference_y;//2
            listPoint[i].y = center.y + difference_x;//1

        }
        return listPoint;
    }
    movToPoint(point) {
        const shipCenter = this.arr[0]
        const difference = new Point(point.x - shipCenter.x, point.y - shipCenter.y)
        for (let i = 0; i < this.arr.length; i++) {
            this.arr[i].x += difference.x
            this.arr[i].y += difference.y
        }
    }
    get pointArray() {
        return this.arr
    }
    get length() {
        return this.arr.length
    }
}