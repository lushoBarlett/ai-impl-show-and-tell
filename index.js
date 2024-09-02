class Transform {
    constructor(x, y) {
        this.xpos = x;
        this.ypos = y;
    }

    translate(x, y) {
        this.xpos += x;
        this.ypos += y;
    }

    coordinateSystem(canvas) {
        this.canvas = canvas;
    }

    get x() {
        return this.xpos;
    }

    get y() {
        return this.canvas.height - this.ypos;
    }
}

class Entity {
    constructor(transform) {
        this.transform = transform;
    }

    update(_deltaTime) { }

    coordinateSystem(canvas) {
        this.transform.coordinateSystem(canvas);
    }

    render(ctx) {
        // draw gizmo

        // x-axis arrow
        ctx.fillStyle = 'red';
        ctx.fillRect(this.transform.x, this.transform.y, 20, -5);

        // y-axis arrow
        ctx.fillStyle = 'green';
        ctx.fillRect(this.transform.x, this.transform.y, 5, -20);

        // origin point
        ctx.fillStyle = 'black';
        ctx.fillRect(this.transform.x, this.transform.y, 5, -5);
    }
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
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.adjustCanvasSize();
        window.addEventListener('resize', this.adjustCanvasSize.bind(this));

        this.entities = [];
        this.lastTime = 0;
        this.running = false;
    }

    adjustCanvasSize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    addEntity(entity) {
        entity.coordinateSystem(this.canvas);
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);

        if (index > -1)
            this.entities.splice(index, 1);
    }

    resetScene() {
        this.entities = [];
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update(deltaTime) {
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    render() {
        this.clear();
        this.entities.forEach(entity => entity.render(this.ctx));
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime / 1000);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.running = false;
    }
}

const simulation = new Simulation('main');

const e1 = new Entity(new Transform(simulation.canvas.width / 2, simulation.canvas.height / 2));
e1.update = function (d) {
    this.speedx = 0;
    this.speedy = 0;
    this.speedx += (Math.random() - 0.5) * d * 10;
    this.speedy += (Math.random() - 0.5) * d * 10;
    this.transform.translate(this.speedx * 100, this.speedy * 100);
}

for (let i = 0; i < 10; i++) {
    // clone this bitch
    const enew = Object.assign({}, e1);
    enew.__proto__ = e1.__proto__;
    simulation.addEntity(enew);
}

simulation.start();

