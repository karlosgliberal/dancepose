// 1920x 1080
let system;
let systemDos;
let repeller;
let repellerDos;

let strength = -0;

var myAcceleration = 0.2;
var myAccelerationMin = 0.1;
var myAccelerationMax = 2;
var myAccelerationStep = 0.1;

var mySpin = 0;
var mySpinMin = -10;
var mySpinMax = 2;
var mySpinStep = 1;

var acceleration = 0;

//var myGravity = 0;

let repellerPositionDos = [1600, 900];
let repellerPosition = [200, 90];

let gui;

let r = 0;
let g = 255;
let b = 255;
var movida = 0;

var scalarStrength = 0.0001;
var constriccion = 1;

function setup() {
  //noCursor();
  createCanvas(windowWidth, windowHeight);
  console.log(windowWidth, windowHeight);
  //createCanvas(1920, 1080);
  system = new ParticleSystem(
    createVector(width / 2 + 200, height / 2),
    color(0, 0, 0)
  );
  systemDos = new ParticleSystem(
    createVector(width / 2 - 200, height / 2),
    color(0, 0, 0)
  );

  background(255);

  //   gui = createGui("WCMM");
  //   gui.addGlobals("mySpin", "myAcceleration");
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    mySpin = -1;
  }
  if (keyCode === RIGHT_ARROW) {
    mySpin = 1;
  }
  if (keyCode === DOWN_ARROW) {
    movida = 1;
  }
  if (keyCode === UP_ARROW) {
    movida = 0;
  }
  if (keyCode == 65) {
    constriccion = constriccion - 1;
    console.log(scalarStrength);
  }
  if (keyCode == 83) {
    constriccion = constriccion + 1;
  }
  if (keyCode == 81) {
    scalarStrength = scalarStrength - 0.001;
    console.log(scalarStrength);
  }
  if (keyCode == 87) {
    scalarStrength = scalarStrength + 0.001;
  }
}

function draw() {
  if (frameCount <= 133) {
    system.addParticle();
  }

  if (frameCount <= 116) {
    systemDos.addParticle();
  }

  fill(255);
  noStroke();
  rect(0, 0, width, height);

  let gravity = createVector(0, 0);
  system.applyForce(gravity);
  let gravitydDos = createVector(0, 0);
  systemDos.applyForce(gravitydDos);

  repeller = new Repeller(
    repellerPosition[0] + mouseX,
    repellerPosition[1] + mouseY
  );
  repellerDos = new Repeller(
    repellerPositionDos[0] - mouseX,
    repellerPositionDos[1] - mouseY
  );

  system.applyRepeller(repeller);
  systemDos.applyRepeller(repellerDos);

  system.run();
  repeller.display();
  systemDos.run();
  repellerDos.display();
  strength = mySpin;
}

class Particle {
  constructor(position, colorP) {
    this.acceleration = createVector(-0, -0);
    this.velocity = createVector(
      random(-myAcceleration, myAcceleration),
      random(-myAcceleration, myAcceleration)
    );
    this.position = position.copy();
    this.lifespan = 500.0;
    this.mass = 2;
    this.colorParticle = colorP;
  }

  run() {
    this.update();
    this.display();
  }

  applyForce(force) {
    this.force = force.copy();
    force.div(this.mass);
    if (movida == 0) {
      this.acceleration.add(force);
    } else {
      this.acceleration.sub(force);
    }
    this.display();
  }

  // Method to update position
  update() {
    if (movida == 0) {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
    } else {
      this.velocity.add(this.acceleration);
      this.position.sub(this.velocity);
      this.acceleration.div(2);
    }

    this.lifespan -= 2;
  }

  // Method to display
  display() {
    fill(this.colorParticle);
    let triangleSize = 20;
    let x = this.position.x;
    let y = this.position.y;

    push();
    translate(x, y);
    rotate(22);
    triangle(0, 0, triangleSize, 0, triangleSize / 2, triangleSize);
    pop();
  }

  // Is the particle still useful?
  isDead() {
    //return this.lifespan < 0;
  }
}

class ParticleSystem {
  constructor(position, colorP) {
    this.origin = position.copy();
    this.particles = [];
    this.colorParticle = colorP;
  }

  addParticle() {
    this.particles.push(new Particle(this.origin, this.colorParticle));
  }

  applyForce(force) {
    for (let p of this.particles) {
      p.applyForce(force);
    }
  }

  applyRepeller(r) {
    for (let p of this.particles) {
      this.force = r.repel(p);
      p.applyForce(this.force);
    }
  }

  run() {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.run();
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

// Repeller class
class Repeller {
  constructor(x, y) {
    this.position = new p5.Vector(x, y);
    this.r = 5;
  }

  display() {
    fill(245);
    ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
  }

  repel(p) {
    //[full] This is the same repel algorithm we used in Chapter 2: forces based on gravitational attraction.

    this.dir = new p5.Vector.sub(this.position, p.position);
    this.d = this.dir.mag();
    this.dir.normalize();
    this.d = constrain(this.d, 1, constriccion);

    this.force = (-scalarStrength * strength) / (this.d * this.d);
    this.dir.mult(this.force);

    return this.dir;
    //[end]
  }
}
