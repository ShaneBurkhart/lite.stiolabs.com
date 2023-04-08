import { distance2ToPolyline } from './measure'
import Point from './point'
import { simplify } from "../simplify-js/simplify"

class Polygon {
    constructor() { this.ptArray = new Array(0) }

    clear() { for (; this.ptArray.length > 0;) this.ptArray.pop() }

    removeLast() { if (this.ptArray.length) this.ptArray.pop() }

    addPoint(pt) { this.ptArray.push(pt) }
    
    addPointToStart(pt) { this.ptArray.unshift(pt) }

    createPoints(ptArray) {
        ptArray.forEach(pt => this.addPoint(new Point(pt.x, pt.y)))
    }

    first() { return this.ptArray[0]; }
    second() { return this.ptArray[1]; }
    third() { return this.ptArray[2]; }
    fourth() { return this.ptArray[3]; }

    last() { return this.ptArray[this.ptArray.length - 1]; }
    preLast() { return this.ptArray[this.ptArray.length - 2]; }

    distance2(pt) { return distance2ToPolyline(this.ptArray, pt); }

    getLength() {
        var dist = 0;
        if (this.ptArray.length > 1) {
            for (var i = 0; i < this.ptArray.length - 1; i++) {
                dist += Math.sqrt(this.ptArray[i].distance2(this.ptArray[i + 1]));
            }
        }
        return dist;
    }
    getArea() {
        if (this.ptArray.length <= 2)
            return 0;
        var area = 0;
        var count = this.ptArray.length;
        for (var i = 0; i < count; ++i) {
            var p0 = this.ptArray[i];
            var p1 = this.ptArray[i + 1 === count ? 0 : i + 1];
            area += (p1.x - p0.x) * (p0.y + p1.y);
        }
        return Math.abs(area) * 0.5;
    }
    getCenter() {
        var x = 0;
        var y = 0;
        var count = this.ptArray.length;
        for (var i = 0; i < count; ++i) {
            var p0 = this.ptArray[i];
            x += p0.x;
            y += p0.y;
        }
        return new Point(x / count, y / count);
    }
    GetCentroid() {
        var _ptCentroid = new Point(0, 0);
        const count = this.ptArray.length;
        if (count === 0)
            return null;
        else if (count === 1) {
            return this.ptArray[0];
        }
        else if (count === 2) {
            _ptCentroid.x = (this.ptArray[0].x + this.ptArray[1].x) / 2;
            _ptCentroid.y = (this.ptArray[0].y + this.ptArray[1].y) / 2;
            return _ptCentroid;
        }
        var xc = 0;
        var yc = 0;
        var fA = 0;
        for (var i = 0; i < count; ++i) {
            const p0 = this.ptArray[i];
            const p1 = this.ptArray[i + 1 === count ? 0 : i + 1];
            xc += (p0.x + p1.x) * (p0.x * p1.y - p1.x * p0.y);
            yc += (p0.y + p1.y) * (p0.x * p1.y - p1.x * p0.y);
            fA += (p1.x - p0.x) * (p0.y + p1.y);
        }
        fA *= 0.5;
        fA = -fA;
        if (Math.abs(fA) < 1e-11) {
            var rectBound = new Rect();
            rectBound.extendArray(this.ptArray);
            _ptCentroid.x = rectBound.getCenter().x;
            _ptCentroid.y = rectBound.getCenter().y;
            return _ptCentroid;
        }
        _ptCentroid.x = xc / (6 * fA);
        _ptCentroid.y = yc / (6 * fA);
        return _ptCentroid;
    }
    shiftBy(dx, dy) {
        var len = this.ptArray.length;
        for (var i = 0; i < len; i++) {
            this.ptArray[i].shiftBy(dx, dy);
        }
    }
    shiftPointAt(id, dx, dy) {
        this.ptArray[id].shiftBy(dx, dy);
    }
    smooth() {
        var ptArray = new Array(0);
        for (var i = 0; i < this.ptArray.length; i++) {
            ptArray.push({ x: this.ptArray[i].x, y: this.ptArray[i].y });
        }
        var ptArray1 = simplify(ptArray, 5);
        // console.log(ptArray1.length, ptArray.length);
        this.ptArray.splice(0, this.ptArray.length);
        for (i = 0; i < ptArray1.length; i++) {
            this.ptArray.push(new Point(ptArray1[i].x, ptArray1[i].y));
        }
    }
}

export default Polygon