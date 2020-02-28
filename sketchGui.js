// just learning
// credits do Daniel Shiffman
// 1920x 1080
let value = 1;

var v = [];
var w = [];

var myStela = 255;

var myRotate = 0.2;
var myRotateMin = 0.2;
var myRotateMax = 0.9;
var myRotateStep = 0.1;

var mySeparte = 1.5;
var mySeparateMin = 0.2;
var mySeparatMax = 2;
var mySeparateStep = 0.1;

var myAling = 1.0;
var myAlingMin = 0.1;
var myAlingMax = 100.0;
var myAlingStep = 1.0;

var myScale = 1;
var myScaleMin = 1;
var myScaleMax = 10.0;
var myScaleStep = 0.1;

var mySpin = 2;
var mySpinMin = 1;
var mySpinMax = 10;
var mySpinStep = 1;

var gui;

function setup() {
  background(255, 255, 255);
  createCanvas(1920, 1080);

  noStroke();
  rectMode;
  for (var i = 0; i < 249; i++) {
    v.push(
      new Vehicle(random(500, width / 2), random(height), color(140, 0, 0))
    );
  }

  for (var i = 0; i < 249; i++) {
    v.push(
      new Vehicle(
        random(width / 2, width - 200),
        random(height - 200),
        color(0, 0, 0, myStela)
      )
    );
  }
  gui = createGui("WCMM");
  gui.addGlobals(
    "myStela",
    "myRotate",
    "myScale",
    "myAling",
    "mySpin",
    "mySeparte"
  );
}

function draw() {
  //translate(width / 2, height / 2);
  rectMode(CENTER);
  scale(myScale);
  background(255, 255, 255, myStela);
  // rotate(cos(frameRate));
  for (var i = 0; i < v.length; i++) {
    v[i].flock(v);
    v[i].update();
  }
  for (var i = 0; i < w.length; i++) {
    w[i].flock(w);
    w[i].update();
  }
}

function Vehicle(x, y, colorTriangulo) {
  this.location = createVector(x, y);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.acceleration = createVector(0, 0);
  this.maxSpeed = 3;
  this.maxForce = 0.0003;
  this.r = 10;
  this.color = colorTriangulo;

  this.show = function() {
    fill(this.color);
    // code commented causes rotation flickering
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    triangle(300, 100, 320, 100, 310, 80);
    pop();
  };

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.location.add(this.velocity);
    this.acceleration.mult(1);
    this.checkEdges();
    this.show();
  };

  this.checkEdges = function() {
    this.location.x = mouseX;
    this.acceleration.limit(40);
    this.location.y = mouseY;
  };
  // this.checkEdges = function() {
  //   if (this.location.x > windowWidth) {
  //     this.location.x = 0;
  //     this.color = color(random(0, 100), 220, 0, myStela);
  //     this.velocity.add(this.acceleration / 40);
  //   }
  //   if (this.location.x < 0) {
  //     this.location.x = mouseX;
  //     this.color = color(random(0, 100), 0, 100, myStela);
  //     this.velocity.add(this.acceleration + 40);
  //   }
  //   if (this.location.y > windowHeight) {
  //     this.location.y = mouseY;
  //     this.color = color(random(0, 10), 200, 0, myStela);
  //     this.velocity.add(this.acc - 200eleration * 40);
  //   }
  //   if (this.location.y < 0) {
  //     this.location.y = mouseY;
  //     this.color = color(random(0, 100), 200, 100, myStela);
  //     this.velocity.add(this.acceleration * 40);
  //   }
  // };

  this.flock = function(boids) {
    var separate = this.separate(boids); // #1 rule - steer to avoid collision
    var align = this.align(boids); // #2 rule - steer the same direction of others boids
    var cohesion = this.cohesion(boids); // #3 rule - steer towards the center of others boids

    //weight forces
    separate.mult(mySeparte);
    align.mult(myAling);
    cohesion.mult(mySpin);

    this.applyForce(separate);
    this.applyForce(align);
    this.applyForce(cohesion);
  };

  this.separate = function(boids) {
    // check against all boids and separate (points away - to the average direction of all others boids)
    var desiredSeparation = 30;
    var sum = createVector(0, 0);
    var totalNearBy = 0;

    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.location, boids[i].location); //returns number
      if (d > 0 && d < desiredSeparation) {
        // bigger than 0 so it don't check itself
        var diff = p5.Vector.sub(this.location, boids[i].location); //returns vector
        diff.normalize();
        diff.div(d); // the closer the distance, the stronger the force
        sum.add(diff);
        totalNearBy++;
      }
    }
    if (totalNearBy > 0) {
      sum.div(totalNearBy);
    }
    if (sum.mag() > 0) {
      sum.normalize();
      sum.mult(this.maxSpeed); // go as fast to the right direction

      var steer = p5.Vector.sub(sum, this.velocity); // steer = desired - velocity
      steer.limit(this.maxForce);
      return steer;
    }
    return sum; // return no force if nothing near by
  };

  this.align = function(boids) {
    // average direction of closest boids
    var lookAtDist = 100;
    var sum = createVector(0, 0);
    var totalNearBy = 0;

    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.location, boids[i].location);
      if (d > 0 && d < lookAtDist) {
        sum.add(boids[i].velocity);
        totalNearBy++;
      }
    }

    if (totalNearBy > 0) {
      sum.div(totalNearBy);
      sum.normalize();
      sum.mult(this.maxSpeed); // go to that direction at max speed

      var steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  };

  this.cohesion = function(boids) {
    // almost identical to "align"
    var lookAtDist = 100;
    var sum = createVector(0, 0);
    var totalNearBy = 0;

    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.location, boids[i].location);
      if (d > 0 && d < lookAtDist) {
        sum.add(boids[i].location); //location instead velocity
        totalNearBy++;
      }
    }

    if (totalNearBy > 0) {
      sum.div(totalNearBy);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  };

  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.location);
    desired.normalize();
    desired.mult(this.maxSpeed);

    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
    //this.applyForce(steer);
  };
  this.applyForce = function(force) {
    this.acceleration.add(force);
  };
}
