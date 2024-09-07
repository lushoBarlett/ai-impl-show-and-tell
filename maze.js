class Maze extends Entity {

  static PointSize = 50;

  constructor(w, h, n) {
    // center the maze on the screen
    super(new Transform(
      (width - w * Maze.PointSize) / 2,
      (height - h * Maze.PointSize) / 2
    ));

    this.width = w;
    this.height = h;

    if (n > (w - 1) * h + (h - 1) * w) {
      console.warn("Too many walls, setting to maximum possible walls");
      n = (w - 1) * h + (h - 1) * w;
    }

    this.generateRandomWalls(n);
  }

  // a wall is the set { p1, p2 }
  // where p1 and p2 are consecutive 2D points.
  //
  // the random maze is generate by selecting a point randomly
  // and then selecting a random direction where we can't move to
  // because there's a wall there. So we have (p, DIR) as our representation
  //
  // The valid points are from (0, 0) to (width - 1, height - 1)
  // To prevent duplicates and to facilitate things, only down and left
  // directions can be used.
  generateRandomWalls(n) {
    this.walls = [];

    const CHOOSEDIR = ['DOWN', 'LEFT'];

    for (let i = 0; i < n; i++) {

      let p, dir;

      do {
        p = new Transform(floor(random(this.width)), floor(random(this.height)));

        dir = CHOOSEDIR[floor(random(2))];

      } while (outOfBounds(p, dir, this.width, this.height) || chosen(this.walls, p, dir));

      this.walls.push({ p, dir });
    }

    return this.walls;

    function outOfBounds(p, dir, width, height) {
      return (
        dir === 'UP' && p.y === height - 1 ||
        dir === 'DOWN' && p.y === 0 ||
        dir === 'LEFT' && p.x === 0 ||
        dir === 'RIGHT' && p.x === width - 1
      );
    }

    function chosen(walls, p, dir) {
      return walls.some(({ p: pc, dir: dirc }) => pc.x == p.x && pc.y == p.y && dirc == dir);
    }
  }

  // to render the walls, a line between p1 and p2 is drawn
  // for each wall in the walls array
  /*
   *
   * |    p1    |
   * |==========| <- line in the down case
   * |    p2    |
   */
  // also draw the line around the whole maze
  render() {
    push();

    stroke(0);
    strokeWeight(5);

    line(
      this.transform.x, this.transform.y,
      this.transform.x + this.width * Maze.PointSize, this.transform.y);

    line(
      this.transform.x, this.transform.y,
      this.transform.x, this.transform.y + this.height * Maze.PointSize);

    line(
      this.transform.x + this.width * Maze.PointSize, this.transform.y,
      this.transform.x + this.width * Maze.PointSize, this.transform.y + this.height * Maze.PointSize);

    line(
      this.transform.x, this.transform.y + this.height * Maze.PointSize,
      this.transform.x + this.width * Maze.PointSize, this.transform.y + this.height * Maze.PointSize);

    stroke(100);

    for (const { p: { x, y }, dir } of this.walls) {
      const botleft = {
        x: this.transform.x + x * Maze.PointSize,
        y: this.transform.y + y * Maze.PointSize,
      };

      switch (dir) {
        case 'UP':
          line(
            botleft.x, botleft.y + Maze.PointSize,
            botleft.x + Maze.PointSize, botleft.y + Maze.PointSize);
          break;

        case 'DOWN':
          line(
            botleft.x, botleft.y,
            botleft.x + Maze.PointSize, botleft.y);
          break;

        case 'LEFT':
          line(
            botleft.x, botleft.y,
            botleft.x, botleft.y + Maze.PointSize);
          break;

        case 'RIGHT':
          line(
            botleft.x + Maze.PointSize, botleft.y,
            botleft.x + Maze.PointSize, botleft.y + Maze.PointSize);
          break;
      }
    }

    pop();
  }
}
