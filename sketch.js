let video; // 用來存放攝影機影像
let handpose; // ml5 的手部辨識模型
let predictions = []; // 存放手部辨識結果

let droneX; // 無人機的 X 座標
let droneY; // 無人機的 Y 座標
let obstacles = []; // 障礙物陣列
let score = 0; // 分數
let gameOver = false; // 遊戲結束狀態

function setup() {
  createCanvas(640, 480); // 建立畫布
  video = createCapture(VIDEO); // 啟用攝影機
  video.size(width, height); // 設定攝影機影像大小
  video.hide(); // 隱藏原始攝影機畫面

  droneX = width / 2; // 無人機初始 X 位置（畫面中央）
  droneY = height - 100; // 無人機初始 Y 位置（畫面底部上方）

  handpose = ml5.handpose(video, modelReady); // 啟用手部辨識模型
  handpose.on("predict", results => {
    predictions = results; // 取得手部辨識結果
  });

  // 每秒新增一個障礙物（若遊戲尚未結束）
  setInterval(() => {
    if (!gameOver) {
      obstacles.push({ x: random(50, width - 50), y: -20 }); // 障礙物從畫面上方隨機位置生成
    }
  }, 1000);
}

function modelReady() {
  console.log("Handpose model loaded!"); // 模型載入完成提示
}

function draw() {
  background(0); // 黑色背景
  image(video, 0, 0, width, height); // 顯示攝影機畫面

  drawDrone(); // 畫出無人機
  moveObstacles(); // 移動並繪製障礙物
  drawScore(); // 顯示分數

  // 若有偵測到手部，根據手掌位置控制無人機 X 座標
  if (predictions.length > 0) {
    let hand = predictions[0];
    let palm = hand.annotations.palmBase[0];
    droneX = width - palm[0]; // 左右反轉以符合玩家視角
  }

  // 遊戲結束時顯示 Game Over
  if (gameOver) {
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
  }
}

// 畫出無人機（以橢圓表示）
function drawDrone() {
  fill(0, 255, 255);
  ellipse(droneX, droneY, 50, 30);
}

// 移動障礙物、檢查碰撞與計分
function moveObstacles() {
  fill(255, 100, 100);
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let ob = obstacles[i];
    ob.y += 5; // 障礙物往下移動
    ellipse(ob.x, ob.y, 40, 40); // 畫出障礙物

    // 檢查無人機與障礙物碰撞
    if (dist(droneX, droneY, ob.x, ob.y) < 40) {
      gameOver = true;
    }

    // 障礙物超出畫面且遊戲未結束時，分數加一並移除障礙物
    if (ob.y > height && !gameOver) {
      score++;
      obstacles.splice(i, 1);
    }
  }
}

// 顯示分數
function drawScore() {
  fill(255);
  textSize(20);
  text("Score: " + score, 10, 25);
}
