function linear(m, h) {
  return (x) => m * x + h;
}

function disc(r) {
  return (x, y) => {
    const distance = Math.random() * r;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: x + distance * Math.cos(angle),
      y: y + distance * Math.sin(angle),
    };
  }
}

class DataPoints extends Entity {

  constructor(approximate, error, pointAmount, { xstart, xend, ystart, yend }) {
    super(Transform.bottomLeftCenterPoint(3 * width / 4, 3 * height / 4));

    this.width = 3 * width / 4;
    this.height = 3 * height / 4;

    this.approximate = approximate;
    this.error = error;

    this.pointAmount = pointAmount;

    this.xstart = xstart;
    this.xend = xend;
    this.ystart = ystart;
    this.yend = yend;

    this.generateDataPoints();
  }

  generateDataPoints() {
    this.dataPoints = [];

    for (let i = 0; i < this.pointAmount; i++) {
      const x = lerpstep(this.xstart, this.xend, i / this.pointAmount);
      const y = this.approximate(x);
      const finalPoint = this.error(x, y);
      this.dataPoints.push(finalPoint);
    }
  }

  render() {
    push();

    // axes
    stroke(0);
    strokeWeight(3);
    line(this.transform.x, this.transform.y, this.transform.x + this.width, this.transform.y);
    line(this.transform.x, this.transform.y + this.height, this.transform.x, this.transform.y);

    // data points
    fill(0);
    stroke(0);

    for (let i = 0; i < this.dataPoints.length; i++) {
      const { x, y } = this.dataPoints[i];
      const screenx = map(x, this.xstart, this.xend, this.transform.x, this.transform.x + this.width);
      const screeny = map(y, this.ystart, this.yend, this.transform.y, this.transform.y + this.height);
      circle(screenx, screeny, 5);
    }

    pop();
  }
}

class Linear extends Shape {

  constructor(plot, material, m, h) {
    super(plot.transform, material);

    this.m = m;
    this.h = h;

    this.plot = plot;
  }

  pointData() {
    const approximation = linear(this.m, this.h);

    let points = [];

    for (let i = 0; i < this.plot.dataPoints.length; i++) {
      const { x, y } = this.plot.dataPoints[i];
      const yhat = approximation(x);
      points.push({ x, y, yhat });
    }

    return points;
  }

  cost(reducer) {
    reducer = reducer || ((cost, { y, yhat }) => cost + Math.pow(yhat - y, 2));

    return this.pointData().reduce(reducer, 0) / this.plot.dataPoints.length;
  }

  update() {
    this.h -= 0.01 * this.cost((cost, { x, y, yhat }) => cost + (yhat - y));
    this.m -= 0.00001 * this.cost((cost, { x, y, yhat }) => cost + (yhat - y) * x);
  }

  render() {
    push();

    stroke(this.material.color);
    strokeWeight(3);

    const startscreenx = map(
      this.plot.xstart,
      this.plot.xstart, this.plot.xend,
      this.transform.x, this.transform.x + this.plot.width
    );

    const startscreeny = map(
      this.h,
      this.plot.ystart, this.plot.yend,
      this.transform.y, this.transform.y + this.plot.height
    );

    const endscreenx = map(
      this.plot.xend,
      this.plot.xstart, this.plot.xend,
      this.transform.x, this.transform.x + this.plot.width
    );

    const endscreeny = map(
      this.h + this.m * this.plot.xend,
      this.plot.ystart, this.plot.yend,
      this.transform.y, this.transform.y + this.plot.height);

    line(startscreenx, startscreeny, endscreenx, endscreeny);

    pop();
  }
}

function lerpstep(a, b, t) {
  return a + t * (b - a);
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
