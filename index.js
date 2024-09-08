let simulation;
let maze;
let agent;

let autoplay = false;
let totalSteps = 0;
let currentSteps = 0;

function setup() {
  simulation = new Simulation();

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

function keyReleased() {
  if (key === ' ')
    autoplay = !autoplay;

  if (key === "ArrowRight" && !autoplay)
    totalSteps++;
}

function draw() {
  simulation.flipY();
  simulation.update();

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

  simulation.render();
}

function gizmo(x, y) {
  const e = new Entity(new Transform(x, y));

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

