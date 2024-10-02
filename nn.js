class Neuron {
  constructor(bias = Math.random()) {
    this.bias = bias;
    this.value = 0;
    this.inputSum = 0;
    this.outputConnections = [];
    this.delta = 0;
  }

  activate() {
    this.value = 1 / (1 + Math.exp(-this.inputSum - this.bias));
  }

  derivative() {
    return this.value * (1 - this.value);
  }

  addInput(value) {
    this.inputSum += value;
  }

  addConnection(connection) {
    this.outputConnections.push(connection);
  }

  resetInput() {
    this.inputSum = 0;
  }

  setRenderParameters(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  render(simulation) {
    push();

    fill(255);
    stroke(0);
    strokeWeight(1);
    ellipse(this.x, this.y, this.r, this.r);

    simulation.flipY();
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("A: " + this.value.toFixed(2), this.x, height - this.y - 8);
    text("B: " + this.bias.toFixed(2), this.x, height - this.y + 8);

    pop();
  }
}

class Connection {
  constructor(fromNeuron, toNeuron, weight = (5 - Math.random() * 10)) {
    this.fromNeuron = fromNeuron;
    this.toNeuron = toNeuron;
    this.weight = weight;
  }

  propagate() {
    const weightedValue = this.fromNeuron.value * this.weight;
    this.toNeuron.addInput(weightedValue);
  }

  updateWeight(learningRate) {
    const gradient = this.toNeuron.delta * this.fromNeuron.value;
    console.log(this.toNeuron.delta, this.fromNeuron.value);
    this.weight += learningRate * gradient;
  }

  render() {
    const fromX = this.fromNeuron.x;
    const fromY = this.fromNeuron.y;
    const toX = this.toNeuron.x;
    const toY = this.toNeuron.y;

    strokeWeight(Math.log2(Math.abs(this.weight) * 100) - 1);
    stroke(this.weight > 0 ? color(0, 255, 0) : color(255, 0, 0));
    line(fromX, fromY, toX, toY);
  }
}

class Layer {
  constructor(size) {
    this.neurons = [];
    for (let i = 0; i < size; i++) this.neurons.push(new Neuron());
  }

  connectTo(layer) {
    for (let fromNeuron of this.neurons) {
      for (let toNeuron of layer.neurons) {
        const connection = new Connection(fromNeuron, toNeuron);
        fromNeuron.addConnection(connection);
      }
    }
  }

  activate() {
    this.neurons.forEach(neuron => {
      neuron.activate();
    });
  }

  resetInputs() {
    this.neurons.forEach(neuron => neuron.resetInput());
  }

  calculateOutputLayerDeltas(targets) {
    this.neurons.forEach((neuron, i) => {
      const error = neuron.value - targets[i];
      neuron.delta = error * neuron.derivative();
    });
  }

  calculateHiddenLayerDeltas(nextLayer) {
    this.neurons.forEach(neuron => {
      let sumDeltas = 0;
      nextLayer.neurons.forEach(nextNeuron => {
        const connection = neuron.outputConnections.find(conn => conn.toNeuron === nextNeuron);
        sumDeltas += nextNeuron.delta * connection.weight;
      });
      neuron.delta = sumDeltas * neuron.derivative();
    });
  }

  updateWeights(learningRate) {
    this.neurons.forEach(neuron => {
      neuron.outputConnections.forEach(connection => connection.updateWeight(learningRate));
    });
  }
}

class NeuralNetwork extends Entity {

  static NeuronRadius = 70;
  static NeuronGap = 100;
  static LayerGap = 100;

  constructor(layerSizes) {
    super(Transform.bottomLeftCenterPoint(
      (layerSizes.length - 1) * NeuralNetwork.LayerGap + NeuralNetwork.NeuronRadius * 2,
      Math.max(...layerSizes) * NeuralNetwork.NeuronGap
    ))

    this.layers = [];

    for (let size of layerSizes)
      this.layers.push(new Layer(size));

    for (let i = 0; i < this.layers.length - 1; i++)
      this.layers[i].connectTo(this.layers[i + 1]);
  }

  feedForward(input) {
    this.layers[0].neurons.forEach((neuron, i) => {
      neuron.value = input[i];
    });

    for (let i = 1; i < this.layers.length; i++) {
      const prevLayer = this.layers[i - 1];
      const currentLayer = this.layers[i];

      prevLayer.neurons.forEach(neuron => {
        neuron.outputConnections.forEach(connection => {
          connection.propagate();
        });
      });

      currentLayer.activate();

      prevLayer.resetInputs();
    }

    return this.layers[this.layers.length - 1].neurons.map(neuron => neuron.value);
  }

  backpropagate(targets, learningRate) {
    const outputLayerIndex = this.layers.length - 1;

    this.layers[outputLayerIndex].calculateOutputLayerDeltas(targets);

    for (let i = outputLayerIndex - 1; i > 0; i--)
      this.layers[i].calculateHiddenLayerDeltas(this.layers[i + 1]);

    for (let i = 0; i < this.layers.length - 1; i++)
      this.layers[i].updateWeights(learningRate);
  }

  train(input, target, learningRate = 0.1) {
    this.input = input;
    this.target = target;
    this.feedForward(input);
    this.backpropagate(target, learningRate);
  }

  render(simulation) {
    this.layers.forEach((layer, i) => {
      layer.neurons.forEach((neuron, j) => {
        neuron.setRenderParameters(
          this.transform.x + i * (NeuralNetwork.LayerGap + NeuralNetwork.NeuronRadius),
          this.transform.y + j * (NeuralNetwork.NeuronGap + NeuralNetwork.NeuronRadius),
          NeuralNetwork.NeuronRadius
        );
      });
    });

    for (let i = 0; i < this.layers.length - 1; i++) {
      this.layers[i].neurons.forEach((neuron, j) => {
        neuron.outputConnections.forEach(connection => {
          connection.render();
        });
      });
    }

    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.render(simulation);
      });
    });

    if (!this.input) return;

    // render input data like it is a layer at the left of the layer0
    this.layers[0].neurons.forEach((neuron, i) => {
      const input = this.input[i];
      push();
      fill(0);
      stroke(0);
      strokeWeight(1);
      textSize(16);
      textAlign(CENTER, CENTER);
      simulation.flipY();
      text(input.toFixed(2), neuron.x - NeuralNetwork.LayerGap, height - neuron.y);
      pop();
    });

    // render target data like it is a layer at the right of the last layer
    this.layers[this.layers.length - 1].neurons.forEach((neuron, i) => {
      const target = this.target[i];
      push();
      fill(0);
      stroke(0);
      strokeWeight(1);
      textSize(16);
      textAlign(CENTER, CENTER);
      simulation.flipY();
      text(target.toFixed(2), neuron.x + NeuralNetwork.LayerGap, height - neuron.y);
      pop();
    });
  }
}
