import Point from './point'
import Rectangle from './rectangle'

export function distance2(p0, p1) {
    return (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
}

export function distance2ToSegment(_ptA, _ptB, _pt, _ptNearest) {
    const dx = (_ptB.x - _ptA.x);
    const dy = _ptB.y - _ptA.y;
    const D2 = dx * dx + dy * dy;
    if (D2 < 1e-12) {
        _ptNearest = _ptA;
        return distance2(_pt, _ptA);
    }
    const dxa = (_pt.x - _ptA.x);
    const dya = _pt.y - _ptA.y;
    var t = (dxa * dx + dya * dy) / D2;
    if (t < 0)
        t = 0;
    else if (t > 1)
        t = 1;
    _ptNearest.x = _ptA.x + dx * t;
    _ptNearest.y = _ptA.y + dy * t;
    return distance2(_pt, _ptNearest);
}

export function findNearestPointOfPolyline(points, cBegin, cEnd, pt, ptNearest, cNearestSegment) {
    if (points.length === 0)
        return -1;
    if (cEnd >= points.length)
        cEnd = points.length;
    if (cBegin >= cEnd)
        return -1;
    var fMinD2 = -1;
    for (var c = cBegin; c + 1 < cEnd; ++c) {
        const ptA = points[c];
        const ptB = points[c + 1];
        ptNearest = new Point(0, 0);
        const fD2 = distance2ToSegment(ptA, ptB, pt, ptNearest);
        if (fMinD2 > fD2 || fMinD2 < 0) {
            fMinD2 = fD2;
            cNearestSegment = c;
        }
    }
    return fMinD2;
}
export function distance2ToPolyline(points, pt) {
    var ptNearest = new Point(0, 0);
    var cNearestSegment = 0;
    return findNearestPointOfPolyline(points, 0, points.length, pt, ptNearest, cNearestSegment);
}

export function doesSegmentIntersectSegment(a, b, c, d, pIntersection) {
    const tolerance = 1e-10;
    const t = (d.x - c.x) * (b.y - a.y) - (d.y - c.y) * (b.x - a.x);
    if (Math.abs(t) < tolerance)
        return false;
    const p = ((c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y));
    if (p / t <= tolerance || p / t >= 1 - tolerance)
        return false;
    const q = ((c.y - a.y) * (d.x - c.x) - (c.x - a.x) * (d.y - c.y));
    if (q / t <= tolerance || q / t >= 1 - tolerance)
        return false;
    pIntersection.x = a.x + (b.x - a.x) * (q / t);
    pIntersection.y = a.y + (b.y - a.y) * (q / t);
    return true;
}

export function doesSegmentIntersectPolyline(a, b, points, bClosed) {
    const cPoints = points.length;
    const cPoints_e = bClosed ? cPoints : cPoints - 1;
    for (var n = 0; n < cPoints_e; ++n) {
        const c = points[n];
        const d = points[n + 1 < cPoints ? n + 1 : 0];
        var pIntersection = new Point(0, 0);
        if (doesSegmentIntersectSegment(a, b, c, d, pIntersection))
            return true;
    }
    return false;
}

export function calculateBoundaryForPoints(ptArray) {
    const bounds = new Rectangle()

    bounds.extendArray(ptArray)

    return {
        x: bounds.leftTop.x,
        y: bounds.leftTop.y,
        width: bounds.getWidth(),
        height: bounds.getHeight(),
    }
}