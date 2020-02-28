// just learning
// credits do Daniel Shiffman

var v = [];
function setup() {
  createCanvas(windowWidth, windowHeight);
  fill(0);
  noStroke();
  for (var i = 0; i < 50; i++) {
    v.push(new Vehicle(random(width), random(height)));
  }
}

function draw() {
  background(220, 220, 220);
  for (var i = 0; i < v.length; i++) {
    v[i].flock(v);
    v[i].update();
  }
}

function Vehicle(x, y) {
  this.location = createVector(x, y);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.acceleration = createVector(0, 0);
  this.maxSpeed = 4;
  this.maxForce = 0.03;
  this.r = 10;

  this.show = function() {
    // code commented causes rotation flickering
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    triangle(-30, -10, 0, 0, -30, 10);
    pop();
  };

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
    this.checkEdges();
    this.show();
  };

  this.checkEdges = function() {
    if (this.location.x > windowWidth) this.location.x = 0;
    if (this.location.x < 0) this.location.x = windowWidth;
    if (this.location.y > windowHeight) this.location.y = 0;
    if (this.location.y < 0) this.location.y = windowHeight;
  };

  this.flock = function(boids) {
    var separate = this.separate(boids); // #1 rule - steer to avoid collision
    var align = this.align(boids); // #2 rule - steer the same direction of others boids
    var cohesion = this.cohesion(boids); // #3 rule - steer towards the center of others boids

    //weight forces
    separate.mult(1.5);
    align.mult(1.0);
    cohesion.mult(1.0);

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
