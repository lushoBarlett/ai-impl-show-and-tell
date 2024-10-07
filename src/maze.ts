import { Entity, Transform } from "./objects";

export class Maze extends Entity {

  static PointSize = 50;
  static StrokeWeight = 5;

  width: number;
  height: number;

  walls: { p: Transform, dir: string }[] = [];

  constructor(w: number, h: number, n: number) {
    super(Transform.bottomLeftCenterPoint(w * Maze.PointSize, h * Maze.PointSize));

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
  // To prevent duplicates and to facilitate things, only up and right
  // directions can be used.
  generateRandomWalls(n: number) {
    this.walls = [];

    const CHOOSEDIR = ['UP', 'RIGHT'];

    for (let i = 0; i < n; i++) {

      let p, dir;

      do {
        p = new Transform(floor(random(this.width)), floor(random(this.height)));

        dir = CHOOSEDIR[floor(random(2))];

      } while (this.outOfBounds(p, dir) || this.chosen(p, dir));

      this.walls.push({ p, dir });
    }

    return this.walls;
  }

  outOfBounds(p: { x: number, y: number }, dir: string) {
    return (
      dir === 'UP' && p.y === this.height - 1 ||
      dir === 'DOWN' && p.y === 0 ||
      dir === 'LEFT' && p.x === 0 ||
      dir === 'RIGHT' && p.x === this.width - 1
    );
  }

  chosen(p: { x: number, y: number }, dir: string) {
    return this.walls.some(({ p: pc, dir: dirc }) => pc.x === p.x && pc.y === p.y && dirc === dir);
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
    strokeWeight(Maze.StrokeWeight);

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

  drawBoundingBox({ x, y }: Transform) {
    rect(
      this.transform.x + x * Maze.PointSize,
      this.transform.y + y * Maze.PointSize,
      Maze.PointSize,
      Maze.PointSize
    );
  }

  neighbors({ x, y }: Transform) {
    const n = [];

    if (!this.outOfBounds({ x, y }, 'UP') && !this.chosen({ x, y }, 'UP'))
      n.push({ x, y: y + 1 });

    if (!this.outOfBounds({ x, y }, 'DOWN') && !this.chosen({ x, y: y - 1 }, 'UP')) // compare walls with UP instead of DOWN
      n.push({ x, y: y - 1 });

    if (!this.outOfBounds({ x, y }, 'LEFT') && !this.chosen({ x: x - 1, y }, 'RIGHT')) // compare walls with RIGHT instead of LEFT
      n.push({ x: x - 1, y });

    if (!this.outOfBounds({ x, y }, 'RIGHT') && !this.chosen({ x, y }, 'RIGHT'))
      n.push({ x: x + 1, y });

    return n;
  }
}

