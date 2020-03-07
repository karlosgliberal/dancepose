/*
nose - nariz
Eye - ojo
Ear - oreja
Shoulder - hombro
Elbow - code
Wrist - muñeca
Hip - cadera
Knee -rodilla
Ankle - tobillo
*/

let video;
let poseNet;
let poses = [];

let particles = [];
let e = new p5.Ease();
let ox, oy;
let colors = [];
const canvasScale = 0.5;
let clicked = false;
let paso = "default";

function setup() {
  createCanvas(960, 540);

  // noCursor();
  video = createVideo("fredastaire.mp4", videoLoaded);

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on("pose", function(results) {
    poses = results;
  });
  video.hide();

  colors[0] = color(247, 23, 53, 220);
  colors[1] = color(65, 234, 212, 220);
  colors[2] = color(255, 159, 28, 220);

  colors[3] = color(247, 23, 53, 220);
  colors[4] = color(255, 255, 255, 220);
  colors[5] = color(1, 22, 39, 220);

  strokeWeight(2);
  angleMode(DEGREES);
  strokeJoin(ROUND);
  textAlign(CENTER, CENTER);
  textSize(100);
}

function videoLoaded() {
  video.size(960, 540);
}

function modelReady() {
  // select('#status').html('Model Loaded');
}

function draw() {
  background(230);

  if (!clicked) {
    text("CLICK TO PLAY", width / 2, height / 2);
  }

  image(video, 0, 0, width, height);
  drawParticles();

  if (video.time() > 4) {
    paso = "uno";
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].display();
  }

  for (let j = 0; j < particles.length; j++) {
    if (particles[j].isFinished && paso == "default") {
      if (frameCount % 50 == 0) {
        particles.splice(j, 1);
      }
    } else if (particles[j].isFinished && paso == "uno") {
      particles.splice(j, 1);
    }
  }
}

function mousePressed() {
  if (!clicked) {
    video.volume(0);
    video.loop();
    clicked = true;
  }
}

function drawParticles() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];

      switch (paso) {
        case "uno":
          if (
            frameCount % 2 == 0 &&
            (keypoint.part === "rightAnkle" || keypoint.part === "leftAnkle") &&
            keypoint.score > 0.15
          ) {
            createParticle(keypoint.position.x, keypoint.position.y, paso);
          }
          break;
        default:
          if (
            frameCount % 2 == 0 &&
            (keypoint.part === "rightWrist" || keypoint.part === "leftWrist") &&
            keypoint.score > 0.15
          ) {
            createParticle(keypoint.position.x, keypoint.position.y, paso);
          }
      }
    }
  }
}

function createParticle(keypointx, keypointy, paso) {
  let targetX = keypointx;
  let targetY = keypointy;

  let randomTheta = random(360);
  let randomR = random(5);

  let X = targetX + randomR * cos(randomTheta);
  let Y = targetY + randomR * sin(randomTheta);

  let dis = dist(targetX, targetY, X, Y);
  let C;
  if (paso == "default") {
    C = floor(random(3));
  } else {
    C = floor(random(3, 6));
  }
  let Rmax = dis > 20 ? 35 - dis : random(2, 8);

  particles.push(new Particle(X, Y, C, Rmax, paso));
  particles.push(new Particle(X, Y, C, Rmax, paso));
  //particles.push(new Particle(X, Y, C, Rmax));
}

function Particle(tmpX, tmpY, tmpC, tmpRmax, paso) {
  this.pos = createVector(tmpX, tmpY);
  this.paso = paso;
  this.rMax = tmpRmax;
  this.theta = random(360);
  this.thetaSpeed = random(-4);
  this.r = 0;
  this.delta = 0;
  this.speed = (1 * 1.5) / 30;
  this.life = this.rMax * 2;
  this.isDeg = false;
  this.isFinished = false;
  this.colorIndex = tmpC;
  this.ySpeed = 2;
  this.isFill = false;
  this.xNoise = random(1.0);

  this.display = function() {
    if (!this.isDeg) {
      this.r = this.rMax * e.circularOut(this.delta);

      this.delta += this.speed;
      if (this.delta > 1.0) {
        this.delta = 1.0;
        this.isDeg = true;
      }
    } else {
      this.r = this.rMax * e.circularOut(this.delta);
      this.delta -= this.speed * 1.5;
      if (this.delta < 0.0) {
        this.delta = 0.0;
        this.isFinished = true;
      }
    }

    fill(colors[this.colorIndex]);
    noStroke();

    this.pos.x = tmpX + this.xNoise + map(noise(this.xNoise), 0, 1, -10, 50);

    if (this.isFill) {
      fill(colors[this.colorIndex]);
      noStroke();
    } else {
      noFill();
      stroke(colors[this.colorIndex]);
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.theta);

    rect(this.r, this.r, this.r, this.r);
    strokeWeight(3);

    if (paso == "default") {
      point(10, 10);
    }
    pop();

    this.theta += this.thetaSpeed;
    if (paso == "default") {
      this.pos.y += this.ySpeed;
    } else {
      this.pos.y -= this.ySpeed;
    }
    //this.pos.x -= this.ySpeed;
    this.xNoise += 0.01;
  };
}
