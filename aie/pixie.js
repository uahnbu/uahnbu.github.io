class Pixie {
  constructor(configs) {
    return planck.World(configs)
  }
  static toMeter(pixels) {
    return isNaN(pixels) ? [pixels.x / 100, pixels.y / 100] : pixels / 100
  }
  static toPixel(pixels) {
    return isNaN(pixels) ? [pixels.x * 100, pixels.y * 100] : pixels * 100
  }
  static vec(x, y) {
    return planck.Vec2(Pixie.toMeter(x), Pixie.toMeter(y))
  }
  static directionalVec(angle, length) {
    return Pixie.vec(length * Math.cos(angle), length * Math.sin(angle))
  }
  static addEdge(object, x1, y1, x2, y2, options) {
    let edge = planck.Edge(Pixie.vec(x1, y1), Pixie.vec(x2, y2));
    object.createFixture(edge, options)
  }
  static addCircle(object, radius, options) {
    let circle = planck.Circle(Pixie.toMeter(radius));
    object.createFixture(circle, options)
  }
  static addPolygon(object, points, ratio, options) {
    decomp.makeCCW(points);
    decomp.quickDecomp(points).forEach(polygon => {
      let pointsMap = polygon.map(point => planck.Vec2(point[0] * ratio, point[1] * ratio))
      object.createFixture(planck.Polygon(pointsMap), options);
    })
  }
  static add(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) arr1[i] += arr2[i];
    return arr1
  }
  static cos(angle) { return Math.cos(angle * Math.PI / 180) }
  static sin(angle) { return Math.sin(angle * Math.PI / 180) }
  static rand(min, max) { return min + Math.random() * (max - min + 1) }
}