export class Point {
    constructor(public x: number, public y: number) {}
    add(point: Point): Point {
        return new Point(this.x + point.x, this.y + point.y);
    }

    toString(): string {
        return '' + this.x + ' ' + this.y;
    }
}
