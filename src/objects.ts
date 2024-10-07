import { Color } from "p5";

export class Transform {

  x: number;
  y: number;

  static bottomLeftCenterPoint(w: number, h: number) {
    return new Transform(
      (width - w) / 2,
      (height - h) / 2,
    );
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(transform: Transform) {
    return this.x === transform.x && this.y === transform.y;
  }
}

export class Entity {

  transform: Transform;

  constructor(transform: Transform) {
    this.transform = transform;
  }

  update() {}

  render(_simulation: Simulation) {}
}

export class Material {

  color: Color;

  constructor(color: Color) {
    this.color = color;
  }
}

export class Shape extends Entity {

  material: Material;

  constructor(transform: Transform, material: Material) {
    super(transform);
    this.material = material;
  }
}

export class Simulation {

  entities: Entity[];
  lastTime: number;
  running: boolean;

  constructor() {
    createCanvas(document.body.clientWidth, document.body.clientHeight);
    this.entities = [];
    this.lastTime = 0;
    this.running = false;
  }

  flipY() {
    translate(0, height);
    scale(1, -1);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity) {
    const index = this.entities.indexOf(entity);

    if (index > -1) this.entities.splice(index, 1);
  }

  resetScene() {
    this.entities = [];
  }

  clear() {
    background(255);
  }

  update() {
    this.entities.forEach(entity => entity.update());
  }

  render() {
    this.clear();
    this.entities.forEach(entity => entity.render(this));
  }
}

