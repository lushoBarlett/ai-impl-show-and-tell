let simulation;
let maze;
let agent;

let autoplay = false;
let totalSteps = 0;
let currentSteps = 0;

let scene;
let plotScene;

function setup(s = 'plot') {
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

    const linearPlot = new Linear(dataPoints, new Material(color(255, 0, 0)), 0, 0);

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
}

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

  }

  simulation.render();
}

function gizmo(x, y) {
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

