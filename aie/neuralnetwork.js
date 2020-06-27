class NeuralNetwork {
  constructor(inputs, hiddens, outputs) {
    if (inputs) {
      this.w1 = new Matrix(inputs, hiddens, true);
      this.b1 = new Matrix(hiddens, 1);
      this.w2 = new Matrix(hiddens, hiddens, true);
      this.b2 = new Matrix(hiddens, 1);
      this.w3 = new Matrix(hiddens, outputs, true);
      this.b3 = new Matrix(outputs, 1);
    }
  }
  
  merge(nn) {
    const newNN = new NeuralNetwork();
    newNN.w1 = Matrix.add(this.w1, nn.w1).div(2);
    newNN.b1 = Matrix.add(this.b1, nn.b1).div(2);
    newNN.w2 = Matrix.add(this.w2, nn.w2).div(2);
    newNN.b2 = Matrix.add(this.b2, nn.b2).div(2);
    newNN.w3 = Matrix.add(this.w3, nn.w3).div(2);
    newNN.b3 = Matrix.add(this.b3, nn.b3).div(2);
    return newNN;
  }

  mutate(rate) {
    const mutate = e =>
      Math.random() < rate ? e + NeuralNetwork.randomGaussian(0, .1) : e;
    this.w1.map(mutate);
    this.b1.map(mutate);
    this.w2.map(mutate);
    this.b2.map(mutate);
    this.w3.map(mutate);
    this.b3.map(mutate);
  }

  copy() {
    const newNN = new NeuralNetwork();
    newNN.w1 = Matrix.map(this.w1, e => e);
    newNN.b1 = Matrix.map(this.b1, e => e);
    newNN.w2 = Matrix.map(this.w2, e => e);
    newNN.b2 = Matrix.map(this.b2, e => e);
    newNN.w3 = Matrix.map(this.w3, e => e);
    newNN.b3 = Matrix.map(this.b3, e => e);
    return newNN;
  }

  predict(inputs) {
    let inp = new Matrix(inputs.length, 1);
    for (let i = inputs.length - 1; i >= 0; i--) {
      inp.data[i][0] = inputs[i];
    }

    let z1 = Matrix.dot(Matrix.t(this.w1), inp).add(this.b1);
    let a1 = Matrix.map(z1, e => e / (1 + Math.exp(-e)));
    let z2 = Matrix.dot(Matrix.t(this.w2), a1).add(this.b2);
    let a2 = Matrix.map(z2, e => e / (1 + Math.exp(-e)));
    let z3 = Matrix.dot(Matrix.t(this.w3), a2).add(this.b3);
    let d = Matrix.max(z3, 'row');
    z3.sub(d);
    let a3 = Matrix.map(z3, e => Math.exp(e));
    d = Matrix.sum(a3, 'row');
    a3.div(d);

    let out = Array(a3.data.length);
    for (let i = a3.data.length - 1; i >= 0; i--) {
      out[i] = a3.data[i][0];
    }
    return out;
  }
  
  static randomGaussian(mean, stdev) {
    let u, v, num;
    do {
      do {u = Math.random(); } while (u === 0)
      do {v = Math.random(); } while (v === 0)
      num = Math.sqrt(-2 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      num = num / 10 + 0.5;
    } while (num > 1 || num < 0);
    num *= 2 * stdev;
    num += mean - stdev;
    return num;
  }
}