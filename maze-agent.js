class Cell extends Transform {
  constructor(x, y, parent = null) {
    super(x, y);
    this.parent = parent;
  }
}

class Strategy {
  constructor() {
    this.queue = [];
  }

  push(_cell) {}
  pop() {}

  ended() {
    return this.queue.length === 0;
  }

  has(cell) {
    return this.queue.some(c => c.x === cell.x && c.y === cell.y);
  }
}

class BFS extends Strategy {
  push(cell) {
    this.queue.push(cell);
  }

  pop() {
    return this.queue.shift();
  }
}

class DFS extends Strategy {
  push(cell) {
    this.queue.push(cell);
  }

  pop() {
    return this.queue.pop();
  }
}

class AStar extends Strategy {
  constructor(end) {
    super();
    this.end = end;
  }

  push(cell) {
    this.queue.push(cell);
  }

  // cost = g(n) + h(n) = largo del camino recorrido + distancia manhattan al destino
  cost(cell) {
    return Math.abs(cell.x - this.end.x) + Math.abs(cell.y - this.end.y);
  }

  pop() {
    let minCell = this.queue[0];

    for (const cell of this.queue)
      if (this.cost(cell) < this.cost(minCell))
        minCell = cell;

    this.queue = this.queue.filter(c => c !== minCell);

    return minCell;
  }
}

class MazeAgent extends Entity {

  constructor(maze, start, end, strategy = null) {
    super(new Transform(
      start.x * Maze.PointSize + maze.transform.x,
      start.y * Maze.PointSize + maze.transform.y
    ));

    this.maze = maze;
    this.strategy = strategy || new BFS();
    this.start = start;
    this.end = end;

    const startCell = new Cell(start.x, start.y, null);

    this.strategy.push(startCell);
    this.visitArray = [];
    this.path = null;
    this.pathIndex = 0;
  }

  think() {
    if (this.isImpossible())
      throw new Error('No path to destination');

    if (this.strategy.ended())
      return;

    const c = this.strategy.pop();

    this.visit(c);

    this.maze.neighbors(c).filter(n => !this.visited(n) && !this.strategy.has(n)).forEach(n => {
      this.strategy.push(new Cell(n.x, n.y, c));
    });
  }

  visit(c) {
    this.visitArray.push(c);
  }

  visited(c) {
    return this.visitArray.some(v => v.x === c.x && v.y === c.y);
  }

  solve() {
    if (!this.isSolvable())
      throw new Error('Maze is not solvable');

    this.path = [];

    let c = this.visitArray.find(v => v.x === this.end.x && v.y === this.end.y);

    this.path.push(c);

    while (c.parent) {
      this.path.push(c.parent);
      c = c.parent;
    }

    if (this.path.length === 0)
      throw new Error('No path to destination');

    this.path.reverse();
  }

  isSolvable() {
    return this.visitArray.some(v => v.x === this.end.x && v.y === this.end.y);
  }

  isImpossible() {
    return this.strategy.ended() && !this.isSolvable();
  }

  solved() {
    return this.path && this.path.length > 0;
  }

  followPath() {
    if (!this.path || this.path.length === 0)
      throw new Error('No path to follow');

    const next = this.path[this.pathIndex++];

    this.transform.x = next.x * Maze.PointSize + this.maze.transform.x;
    this.transform.y = next.y * Maze.PointSize + this.maze.transform.y;
  }

  pathEnded() {
    return this.pathIndex === this.path.length;
  }

  render() {
    // render the thinking blocks (cells currently in the queue)
    noStroke();
    fill(255, 0, 0, 100);
    this.strategy.queue.forEach(c => this.maze.drawBoundingBox(c));

    // render the visited blocks
    fill(0, 255, 0, 100);
    this.visitArray.forEach(c => this.maze.drawBoundingBox(c));

    // render path if it exists
    if (this.path) {
      fill(0, 0, 255, 100);
      this.path.forEach(c => this.maze.drawBoundingBox(c));
    }

    // render the end point
    fill(200, 0, 100);
    circle(this.end.x * Maze.PointSize + this.maze.transform.x + Maze.PointSize / 2, this.end.y * Maze.PointSize + this.maze.transform.y + Maze.PointSize / 2, Maze.PointSize / 2);

    // render the agent at its current position
    fill(0, 0, 0);
    circle(this.transform.x + Maze.PointSize / 2, this.transform.y + Maze.PointSize / 2, Maze.PointSize / 2);
  }

}
