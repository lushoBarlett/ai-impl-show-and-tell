let simulation;

function setup() {
  simulation = new Simulation();
  simulation.addEntity(new Maze(20, 20, 200));
}

function draw() {
  simulation.flipY();
  simulation.update();
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

