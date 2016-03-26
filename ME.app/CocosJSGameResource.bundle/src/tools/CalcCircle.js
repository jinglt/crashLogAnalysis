var CalcCircle = cc.Class.extend({

})
CalcCircle.double_equals = function(a,b)
{
    return Math.abs(a - b) < 0.00001;
}
CalcCircle.distance_sqr = function(a,b)
{
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}
CalcCircle.insect = function(circles)
{
    var points = [];
    points[0] = cc.p(0, 0);
    points[1] = cc.p(0, 0);
    var d, a, b, c, p, q, r, temp;
    var cos_value = [];
    var sin_value = [];
    //两圆重合
    if (CalcCircle.double_equals(circles[0].center.x, circles[1].center.x)
        && CalcCircle.double_equals(circles[0].center.y, circles[1].center.y)
        && CalcCircle.double_equals(circles[0].r, circles[1].r)) {
//        cc.log("两圆重合"+Date.now());
        return null;
    }
    //两圆包含关系 && 第1个半径大于第2个
    d = cc.pDistance(circles[0].center, circles[1].center);
    if( d < Math.abs(circles[0].r - circles[1].r) && circles[0].r>circles[1].r ) {
        return null;
    }
    //两圆包含关系 && 第1个半径小于第2个
    if( d < Math.abs(circles[0].r - circles[1].r) && circles[0].r<circles[1].r ){
        var intersec = new CircleIntersection();
        intersec.count = -1;
        return intersec;
    }
    //两圆无交点，也不包含
    d = cc.pDistance(circles[0].center, circles[1].center);
    if (d > circles[0].r + circles[1].r) {
        var intersec = new CircleIntersection();
        intersec.count = -2;
        return intersec;
    }
    a = 2.0 * circles[0].r * (circles[0].center.x - circles[1].center.x);
    b = 2.0 * circles[0].r * (circles[0].center.y - circles[1].center.y);
    c = circles[1].r * circles[1].r - circles[0].r * circles[0].r
    - CalcCircle.distance_sqr(circles[0].center, circles[1].center);
    p = a * a + b * b;
    q = -2.0 * a * c;
    if (CalcCircle.double_equals(d, circles[0].r + circles[1].r)
        || CalcCircle.double_equals(d, Math.abs(circles[0].r - circles[1].r))) {
        cos_value[0] = -q / p / 2.0;
        sin_value[0] = Math.sqrt(1 - cos_value[0] * cos_value[0]) || 0;
        
        points[0].x = circles[0].r * cos_value[0] + circles[0].center.x;
        points[0].y = circles[0].r * sin_value[0] + circles[0].center.y;
        
        if (!CalcCircle.double_equals(CalcCircle.distance_sqr(points[0], circles[1].center),
                                circles[1].r * circles[1].r)) {
            points[0].y = circles[0].center.y - circles[0].r * sin_value[0];
        }
        
        var intersec = new CircleIntersection();
        intersec.count = 1;
        intersec.p0 = points[0];
//        cc.log("正常交1点"+Date.now());
        return intersec;
    }
    
    r = c * c - b * b;
    temp = q * q - 4.0 * p * r;
    cos_value[0] = ((Math.sqrt(temp)||0) - q) / (p * 2.0);
    cos_value[1] = (-(Math.sqrt(temp)||0) - q) / (p * 2.0);
    sin_value[0] = Math.sqrt(1 - cos_value[0] * cos_value[0]) || 0;
    sin_value[1] = Math.sqrt(1 - cos_value[1] * cos_value[1]) || 0;
    
    points[0].x = circles[0].r * cos_value[0] + circles[0].center.x;
    points[1].x = circles[0].r * cos_value[1] + circles[0].center.x;
    points[0].y = circles[0].r * sin_value[0] + circles[0].center.y;
    points[1].y = circles[0].r * sin_value[1] + circles[0].center.y;
    
    if (!CalcCircle.double_equals(CalcCircle.distance_sqr(points[0], circles[1].center),
                            circles[1].r * circles[1].r)) {
        points[0].y = circles[0].center.y - circles[0].r * sin_value[0];
    }
    if (!CalcCircle.double_equals(CalcCircle.distance_sqr(points[1], circles[1].center),
                            circles[1].r * circles[1].r)) {
        points[1].y = circles[0].center.y - circles[0].r * sin_value[1];
    }
    if (CalcCircle.double_equals(points[0].y, points[1].y)
        && CalcCircle.double_equals(points[0].x, points[1].x)) {
        points[1].y = circles[0].center.y + circles[1].center.y - points[0].y;
    }
    var intersec = new CircleIntersection();
    intersec.count = 2;
    intersec.p0 = points[0];
    intersec.p1 = points[1];
//    cc.log("正常交2点"+Date.now());
    return intersec;
}
//函数入口
CalcCircle.calcCircleInsect = function(x0,y0,r0,x1,y1,r1) {
	var circles = [];
	var circles_0 = new MyCircle(cc.p(x0, y0), r0);
	var circles_1 = new MyCircle(cc.p(x1, y1), r1);
	circles.push(circles_0);
	circles.push(circles_1);
	return CalcCircle.insect(circles);
}
var MyCircle = cc.Class.extend({
    center:null,
    r:0,
    ctor:function(center,r){
      this.center = center;
      this.r = r;
    }

})

var CircleIntersection = cc.Class.extend({
	count:0,
	p0:null,
    p1:null,
})
