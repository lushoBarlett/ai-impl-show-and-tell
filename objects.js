class Transform {

  static bottomLeftCenterPoint(w, h) {
    return new Transform(
      (width - w) / 2,
      (height - h) / 2,
    );
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(transform) {
    return this.x === transform.x && this.y === transform.y;
  }
}

class Entity {
  constructor(transform) {
    this.transform = transform;
  }

  update() {}

  render() {}
}

class Material {
  constructor(color) {
    this.color = color;
  }
}

class Shape extends Entity {
  constructor(transform, material) {
    super(transform);
    this.material = material;
  }
}

class Simulation {
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

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
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
