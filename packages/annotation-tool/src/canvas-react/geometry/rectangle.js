import Point from "./point"

class Rectangle {
    constructor() {
			this.leftTop = new Point(100000, 100000);
			this.rightBottom = new Point(-100000, -100000);
		}

    clone() {
        var rect = new Rect();
        rect.leftTop = this.leftTop;
        rect.rightBottom = this.rightBottom;
        return rect;
		}

    isValid() {
        if (this.rightBottom.x < this.leftTop.x)
            return false;
        if (this.rightBottom.y < this.leftTop.y)
            return false;
        return true;
		}

    getCenter() {
        return new Point((this.leftTop.x + this.rightBottom.x) / 2, (this.leftTop.y + this.rightBottom.y) / 2);
		}

    invalidate() {
        this.leftTop.x = 100000;
        this.leftTop.y = 100000;
        this.rightBottom.x = -100000;
        this.rightBottom.y = -100000;
		}

    getWidth() {
        if (this.isValid()) {
            return this.rightBottom.x - this.leftTop.x;
        }
        return 0;
		}

    getHeight() {
        if (this.isValid()) {
            return this.rightBottom.y - this.leftTop.y;
        }
        return 0;
		}

    contains(pt, tolerance) {
        if (pt.x < this.leftTop.x - tolerance)
            return false;
        if (pt.x > this.rightBottom.x + tolerance)
            return false;
        if (pt.y < this.leftTop.y - tolerance)
            return false;
        if (pt.y > this.rightBottom.y + tolerance)
            return false;
        return true;
		}

    extendPt(pt) {
        if (!this.isValid()) {
            this.leftTop.x = pt.x;
            this.leftTop.y = pt.y;
            this.rightBottom.x = pt.x;
            this.rightBottom.y = pt.y;
        }
        else if (this.contains(pt, 0)) {
            return;
        }
        else {
            if (pt.x < this.leftTop.x)
                this.leftTop.x = pt.x;
            else if (pt.x > this.rightBottom.x)
                this.rightBottom.x = pt.x;
            if (pt.y < this.leftTop.y)
                this.leftTop.y = pt.y;
            else if (pt.y > this.rightBottom.y)
                this.rightBottom.y = pt.y;
        }
		}

    extendArray(ptArray) {
        var len = ptArray.length;
        for (var i = 0; i < len; i++) {
            this.extendPt(ptArray[i]);
        }
		}

    extendRect(rect) {
        this.extendPt(rect.leftTop);
        this.extendPt(rect.rightBottom);
		}

    shiftBy(dx, dy) {
        this.leftTop.shiftBy(dx, dy);
        this.rightBottom.shiftBy(dx, dy);
		}

    intersects(rect) {
        if (this.rightBottom.x < rect.leftTop.x || this.leftTop.x > rect.rightBottom.x)
            return false;
        if (this.rightBottom.y < rect.leftTop.y || this.leftTop.y > rect.rightBottom.y)
            return false;
        return true;
    }
}

export default Rectangle