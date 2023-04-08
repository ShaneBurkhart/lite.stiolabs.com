class Point {
    constructor(x, y, scale=1) {
        if (x === null) x = 0;
        if (y === null) y = 0;
        this.x = x / scale;
        this.y = y / scale;
    }
    clone() { return new Point(this.x, this.y); }
    shiftBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    distance2(pt) {
        return (this.x - pt.x) * (this.x - pt.x) + (this.y - pt.y) * (this.y - pt.y);
    }
    angle(prevPt) {
        let dx = this.x - prevPt.x;
        let dy = this.y - prevPt.y;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    sub(pt) {
        var point = this.clone();
        point.x -= pt.x;
        point.y -= pt.y;
        return point;
    }
    add(pt) {
        var point = this.clone();
        point.x += pt.x;
        point.y += pt.y;
        return point;
    }
    assign(pt) {
        this.x = pt.x;
        this.y = pt.y;
        return this;
    }
    scale(s) {
        var point = this.clone();
        point.x *= s;
        point.y *= s;
        return point;
    }
}

export default Point