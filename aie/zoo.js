class Zoo {
  constructor() {
    this.engine = new Pixie(planck.Vec2(0, 0));
    this.createTable();
    this.hare = new Paddle(this.engine, 0, 0);
    this.wolf = new Paddle(this.engine, 0, 0);
    this.carrot = new Puck(this.engine, 0, 0);
    this.score = 0;
    this.record = 0;
    this.initialY = -1;
    this.halted = false;
  }
  
  step() {
    this.hare.step(this.wolf, this.carrot);
    this.engine.step(1 / 60);
    this.carrot.body.getPosition().y > this.record && (this.record = this.carrot.body.getPosition().y);
  }
  draw() { this.hare.draw(); this.carrot.draw() }
  
  createTable() {
    const t = this.tableWall = this.engine.createBody();
    Pixie.addEdge(t, m, h / 2, m, h - m - r);
    Pixie.addEdge(t, m + r, h - m, w / 2 - g / 2, h - m);
    Pixie.addEdge(t, w / 2 + g / 2, h - m, w - m - r, h - m);
    Pixie.addEdge(t, w - m, h - m - r, w - m, h / 2);
    Pixie.addEdge(t, w - m, h / 2, w - m, m + r);
    Pixie.addEdge(t, w - m - r, m, w / 2 + g / 2, m);
    Pixie.addEdge(t, w / 2 - g / 2, m, m + r, m);
    Pixie.addEdge(t, m, m + r, m, h / 2);
    this.addArc(t, m + r, h - m - r, r, 180, 90, s);
    this.addArc(t, w - m - r, h - m - r, r, 90, 0, s);
    this.addArc(t, w - m - r, m + r, r, 360, 270, s);
    this.addArc(t, m + r, m + r, r, 270, 180, s);
    Pixie.addEdge(t, m, h / 2, w - m, h / 2, { filterMaskBits: 0x0001 });
    Pixie.addEdge(t, w / 2 - g / 2, m, w / 2 + g / 2, m, { filterMaskBits: 0x0001 });
    Pixie.addEdge(t, w / 2 - g / 2, h - m, w / 2 + g / 2, h - m, { filterMaskBits: 0x0001 });
  }
  
  addArc(body, x, y, r, startAngle, endAngle, segments) {
    let segAngle = Math.floor((endAngle - startAngle) / segments);
    let curAngle = startAngle;
    for (let i = 0; i < segments; i++) {
      Pixie.addEdge(
        body,
        x + r * Pixie.cos(curAngle),
        y + r * Pixie.sin(curAngle),
        x + r * Pixie.cos(curAngle + segAngle),
        y + r * Pixie.sin(curAngle + segAngle)
      );
      curAngle += segAngle;
    }
  }
}