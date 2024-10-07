import { Entity, Material, Simulation, Transform } from './objects';
import { Maze } from './maze';
import { MazeAgent } from './maze-agent';
import { DataPoints, Linear, linear, disc } from './datapoints';
import { NeuralNetwork } from './nn';

let simulation: Simulation;
let maze: Maze;
let agent: MazeAgent;

let autoplay = false;
let totalSteps = 0;
let currentSteps = 0;

let scene: 'maze' | 'plot' | 'nn';
let plotScene: { dataPoints: DataPoints, linearPlot: Linear };

let nn: NeuralNetwork;

const trainingData = [
  { inputs: [0, 0], outputs: [0], },
  { inputs: [1, 0], outputs: [1], },
  { inputs: [0, 1], outputs: [1], },
  { inputs: [1, 1], outputs: [0], },
];

declare global {
  interface Window {
    setup: any;
    draw: any;
    keyReleased: any;
  }
}

window.setup = setup;
window.draw = draw;
window.keyReleased = keyReleased;

function setup(s: 'maze' | 'plot' | 'nn' = 'nn') {
  scene = s;

  simulation = new Simulation();

  if (scene === 'maze') {
    maze = new Maze(20, 20, 300);

    const randomStart = {
      x: Math.floor(random(0, maze.width)),
      y: Math.floor(random(0, maze.height)),
    };

    const randomEnd = {
      x: Math.floor(random(0, maze.width)),
      y: Math.floor(random(0, maze.height)),
    };

    agent = new MazeAgent(maze, randomStart, randomEnd);

    simulation.addEntity(agent);
    simulation.addEntity(maze); // draw maze after agent
  }

  if (scene === 'plot') {
    const dimensions = {
      xstart: 0,
      xend: 100,
      ystart: 0,
      yend: 100,
    };

    const approximate = linear(Math.random() - 0.5, 50);
    const error = disc(Math.random() * 10);
    const dataPoints = new DataPoints(approximate, error, 1000, dimensions);

    const linearPlot = new Linear(dataPoints, 0, 0, new Material(color(255, 0, 0)));

    simulation.addEntity(dataPoints);
    simulation.addEntity(linearPlot);

    const e = new Entity(new Transform(0, 0));
    e.render = function() {
      push();

      textSize(50);
      fill('black');
      strokeWeight(1);
      textAlign(CENTER, CENTER);
      simulation.flipY();
      text(`Cost: ${Math.round(plotScene.linearPlot.cost())}`, width / 2, 50);
      text(`h = ${linearPlot.h.toString(4)}, m = ${linearPlot.m.toString(4)}`, width / 2, 100);

      pop();
    }
    simulation.addEntity(e);

    plotScene = {
      dataPoints,
      linearPlot,
    };
  }

  if (scene === 'nn') {
    nn = new NeuralNetwork([20, 20, 20, 20, 20]);
    simulation.addEntity(nn);
  }
}

// p5.js setup function
// @ts-ignore
function keyReleased() {
  if (key === ' ')
    autoplay = !autoplay;

  if (key === "ArrowRight" && !autoplay)
    totalSteps++;

  if (key === "1")
    setup('maze');

  if (key === "2")
    setup('plot');
}

// p5.js setup function
// @ts-ignore
function draw() {
  simulation.flipY();
  simulation.update();

  switch (scene) {

    case 'maze':
      if (autoplay)
        totalSteps++;

      if (currentSteps < totalSteps) {

        if (agent.isSolvable()) {
          agent.solved() || agent.solve();
          agent.pathEnded() || agent.followPath();
        } else {
          agent.think();
        }

        currentSteps++;
      }
      break;

    case 'plot':
      break;

    case 'nn':
      if (autoplay)
        totalSteps++;

      if (currentSteps < totalSteps) {
        const data = trainingData[currentSteps % trainingData.length];
        nn.train(data.inputs, data.outputs, 0.1);
        currentSteps++;
      }
      break;
  }

  simulation.render();
}

export function gizmo(x: number, y: number) {
  const e = new Entity(new Transform(x, y));

  e.update = function() {
    console.log(this.transform.x, this.transform.y);
  }

  e.render = function() {
    push();

    stroke(255, 0, 0);
    line(this.transform.x, this.transform.y, this.transform.x + 20, this.transform.y);

    stroke(0, 255, 0);
    line(this.transform.x, this.transform.y, this.transform.x, this.transform.y + 20);

    pop();
  }

  return e;
}

