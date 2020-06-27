class Population {
  constructor(size) {
    this.zoos = Array(size).fill().map(() => new Zoo());
    this.historyBrains = [];
    this.historyFitnesses = [];
    this.gen = 0;
    this.test = 0;
    this.maxIteration = 100;
    this.iteration = 0;
    this.restart();
  }
  
  step() {
    for (const zoo of this.zoos) zoo.halted || zoo.step();
    if (++this.iteration === this.maxIteration) this.restart();
  }
  
  draw() {
    this.drawTable();
    for (const zoo of this.zoos) zoo.halted || zoo.draw();
    this.zoos[0].wolf.draw(1);
  }
  
  restart(newgen) {
    const paddleR = this.zoos[0].hare.radius;
    const puckR = this.zoos[0].carrot.radius;
    const hareX = Pixie.rand(m + paddleR, w - m - paddleR);
    const hareY = Pixie.rand(h / 4, h / 2 - paddleR);
    const wolfX = Pixie.rand(m + paddleR, w - m - paddleR);
    const wolfY = Pixie.rand(h / 2 + paddleR, h - m - paddleR);
    const carrotX = Pixie.rand(m + puckR, w - m - puckR);
    const carrotY = Pixie.rand(m + puckR, h / 2 - puckR);
    let halted = 0;
    for (let i = 0; i < this.zoos.length; i++) {
      const zoo = this.zoos[i];
      if (zoo.halted) halted++; else {
        zoo.score += zoo.carrot.body.getPosition().y * 2 + zoo.record;
        if (zoo.halted = zoo.record <= zoo.initialY) halted++;
        zoo.record = 0;
      }
      zoo.initialY = Pixie.toMeter(carrotY);
      zoo.hare.body.setPosition(Pixie.vec(hareX, hareY));
      zoo.hare.body.setLinearVelocity(planck.Vec2(0, 0));
      zoo.wolf.body.setPosition(Pixie.vec(wolfX, wolfY));
      zoo.wolf.body.setLinearVelocity(planck.Vec2(0, 0));
      zoo.carrot.body.setPosition(Pixie.vec(carrotX, carrotY));
      zoo.carrot.body.setLinearVelocity(planck.Vec2(0, 0));
    }
    if (halted === this.zoos.length) this.repopulate();
    chart.options.title.text = `Gen ${this.gen} Test ${++this.test}`;
    chart.update();
    this.iteration = 0;
  }
  
  repopulate() {    
    const brains = this.zoos.map(zoo => zoo.hare.brain.copy());
    
    const fitnesses = this.zoos.map(zoo => zoo.score);
    this.quickDescending(fitnesses, brains);
    fitnesses.length >>= 5;
    brains.length >>= 5;
    if (this.historyBrains.length === this.zoos.length) {
      this.historyBrains.length -= brains.length;
      this.historyFitnesses.length -= brains.length;
    }
    this.historyBrains.unshift(...brains);
    this.historyFitnesses.unshift(...fitnesses);
    
    const counter = Array(this.zoos.length).fill(0);
    
    const pool = this.historyFitnesses.reduce((sum, fitness) => sum + fitness);
    for (const zoo of this.zoos) {
      const ma = this.grab(pool, this.historyFitnesses);
      const pa = this.grab(pool, this.historyFitnesses);
      counter[ma]++; counter[pa]++;
      const brainMa = this.historyBrains[ma];
      const brainPa = this.historyBrains[pa];
      zoo.hare.brain = brainMa.merge(brainPa);
      zoo.score = 0;
      zoo.halted = false;
    }
    chart.data.datasets[0].data = this.historyFitnesses;
    chart.data.datasets[1].data = counter;
    chart.update();
    this.gen++;
    this.test = 0;
  }
  
  grab(pool, fitnesses) {
    let net = Math.random() * pool | 0;
    let i = 0; do {} while (i < fitnesses.length && (net -= fitnesses[i++]) >= 0);
    return i - 1;
  }
  
  drawTable() {
    room.beginPath();
    room.moveTo(m, h / 2);
    room.lineTo(w - m, h / 2);
    room.stroke();
    room.beginPath();
    room.arc(w / 2, h / 2, g / 2, 0, Math.PI * 2);
    room.stroke();
    room.beginPath();
    room.arc(w / 2, m, g / 1.5, 0, Math.PI);
    room.stroke();
    room.beginPath();
    room.arc(w / 2, h - m, g / 1.5, Math.PI, Math.PI * 2);
    room.beginPath();
    room.arc(w / 2, h - m, g / 1.5, Math.PI, Math.PI * 2);
    room.stroke();
    room.beginPath();
    room.moveTo(w - m - r, m);
    room.lineTo(m + r, m);
    room.arcTo(m, m, m, m + r, r);
    room.lineTo(m, h - m - r);
    room.arcTo(m, h - m, m + r, h - m, r);
    room.lineTo(w - m - r, h - m);
    room.arcTo(w - m, h - m, w - m, h - m - r, r);
    room.lineTo(w - m, m + r);
    room.arcTo(w - m, m, w - m - r, m, r);
    room.stroke();
  }
  
  quickDescending(arr, arr2, left = 0, right = arr.length - 1) {
    if (arr.length <= 1) { return arr }
    let pivot = arr[right + left >> 1];
    let i = left, j = right, temp;
    while (i <= j) {
        while (arr[i] > pivot) i++;
        while (arr[j] < pivot) j--;
        if (i <= j) {
          temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
          arr2 && (temp = arr2[i], arr2[i] = arr2[j], arr2[j] = temp);
          i++; j--;
        }
    }
    if (left < i - 1) this.quickDescending(arr, arr2, left, i - 1);
    if (i < right) this.quickDescending(arr, arr2, i, right);
    return arr;
  }
}