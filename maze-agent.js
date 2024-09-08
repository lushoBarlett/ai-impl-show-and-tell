class Cell extends Transform {
  constructor(x, y, parent = null) {
    super(x, y);
    this.parent = parent;
  }
}

class MazeAgent extends Entity {

  constructor(maze, start, end, strategy = 'BFS') {
    super(new Transform(
      start.x * Maze.PointSize + maze.transform.x,
      start.y * Maze.PointSize + maze.transform.y
    ));

    this.maze = maze;
    this.strategy = strategy;
    this.start = start;
    this.end = end;

    const startCell = new Cell(start.x, start.y, null);

    this.queue = [startCell];
    this.visitArray = [];
    this.path = null;
    this.pathIndex = 0;
  }

  think() {
    if (this.isImpossible())
      throw new Error('No path to destination');

    if (this.queue.length === 0)
      return;

    const c = this.popQueue();

    this.visit(c);

    this.maze.neighbors(c).filter(n => !this.visited(n) && !this.inQueue(n)).forEach(n => {
      this.pushQueue(new Cell(n.x, n.y, c));
    });
  }

  pushQueue(c) {
    // TODO: implement strategy
    this.queue.push(c);
  }

  popQueue() {
    // TODO: implement strategy
    return this.queue.shift();
  }

  inQueue(c) {
    return this.queue.some(q => q.x === c.x && q.y === c.y);
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
    return this.queue.length === 0 && !this.isSolvable();
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
    this.queue.forEach(c => this.maze.drawBoundingBox(c));

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
