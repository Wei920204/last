let video;
let handpose;
let predictions = [];

let droneX;
let droneY;
let obstacles = [];
let score = 0;
let gameOver = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  droneX = width / 2;
  droneY = height - 100;

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  setInterval(() => {
    if (!gameOver) {
      obstacles.push({ x: random(50, width - 50), y: -20 });
    }
  }, 1000);
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  drawDrone();
  moveObstacles();
  drawScore();

  if (predictions.length > 0) {
    let hand = predictions[0];
    let palm = hand.annotations.palmBase[0];
    droneX = width - palm[0]; // 左右反轉以對應視角
  }

  if (gameOver) {
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
  }
}

function drawDrone() {
  fill(0, 255, 255);
  ellipse(droneX, droneY, 50, 30);
}

function moveObstacles() {
  fill(255, 100, 100);
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let ob = obstacles[i];
    ob.y += 5;
    ellipse(ob.x, ob.y, 40, 40);

    if (dist(droneX, droneY, ob.x, ob.y) < 40) {
      gameOver = true;
    }

    if (ob.y > height && !gameOver) {
      score++;
      obstacles.splice(i, 1);
    }
  }
}

function drawScore() {
  fill(255);
  textSize(20);
  text("Score: " + score, 10, 25);
}