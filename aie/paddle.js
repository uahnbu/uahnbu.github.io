class Paddle {
  constructor(engine, x, y) {
    this.body = engine.createDynamicBody({
      position: Pixie.vec(x, y),
      linearDamping: 5
    });
    this.body.setMassData({
      mass: 50,
      center: planck.Vec2(0, 0),
      I: 0
    });
    this.radius = room.width * 0.1;
    Pixie.addCircle(this.body, this.radius);
    this.brain = new NeuralNetwork(12, 20, 4);
  }
  
  step(wolf, carrot) {
    let prediction = this.brain.predict([
      this.body.getPosition().x, this.body.getPosition().y,
      this.body.getLinearVelocity().x, this.body.getLinearVelocity().y,
      wolf.body.getPosition().x, wolf.body.getPosition().y,
      wolf.body.getLinearVelocity().x, wolf.body.getLinearVelocity().y,
      carrot.body.getPosition().x, carrot.body.getPosition().y,
      carrot.body.getLinearVelocity().x, carrot.body.getLinearVelocity().y,
    ]);
    // this.body.applyForceToCenter(Pixie.vec(2e5 * Math.cos(prediction), 2e5 * Math.sin(prediction)));
    switch (prediction.indexOf(Math.max(...prediction))) {
      case 0: this.body.applyForceToCenter(Pixie.vec(-2 * 10e4, 0), true); break;
      case 1: this.body.applyForceToCenter(Pixie.vec(0, -2 * 10e4), true); break;
      case 2: this.body.applyForceToCenter(Pixie.vec(2 * 10e4, 0), true); break;
      case 3: this.body.applyForceToCenter(Pixie.vec(0, 2 * 10e4), true);
    }
  }
  
  draw(opacity) {
    room.fillStyle = '#ee5253' + (opacity === 1 ? '' : '33');
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.fill();
  }
}

class Puck {
  constructor(engine, x, y) {
    this.body = engine.createDynamicBody(Pixie.vec(x, y));
    this.body.setBullet(true);
    this.radius = room.width * 0.05;
    Pixie.addCircle(this.body, this.radius, { filterCategoryBits: 0x0002, restitution: 0.5 });
  }
  
  draw() {
    room.fillStyle = '#f6e58d33';
    room.beginPath();
    room.arc(...Pixie.toPixel(this.body.getPosition()), this.radius, 0, Math.PI * 2);
    room.fill();
  }
}