let handPose; // 手勢辨識模型
let video;    // 攝影機畫面
let hands = []; // 儲存偵測到的手部資料

const THUMB_TIP = 4;         // 拇指指尖的關鍵點編號
const INDEX_FINGER_TIP = 8;  // 食指指尖的關鍵點編號

// Matter.js 相關變數
const {Engine, Body, Bodies, Composite, Composites, Constraint, Vector} = Matter;
let engine;
let bridge; 
let num = 10;     // 橋樑節點數
let radius = 10;  // 節點半徑
let length = 25;  // 節點間距
let circles = []; // 儲存所有圓形(logo圖)

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"]; 

let logoImg; // 儲存 logo 圖片

function preload() {
  // 載入手勢辨識模型
  handPose = ml5.handPose({maxHands: 1, flipped: true});
  // 載入 logo.jpg 圖片
  logoImg = loadImage('logo.jpg');
}

let obstacles = []; // 儲存障礙物

function setup() {
  createCanvas(640, 480); // 建立畫布
  // 建立攝影機並隱藏預設畫面
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  // 啟動手勢辨識
  handPose.detectStart(video, gotHands);
  
  // 建立物理引擎與橋樑
  engine = Engine.create();
  bridge = new Bridge(num, radius, length);

  // 建立幾個障礙物（矩形）
  obstacles.push({x: 200, y: 150, w: 80, h: 20});
  obstacles.push({x: 400, y: 300, w: 120, h: 30});
  obstacles.push({x: 320, y: 400, w: 60, h: 60});
}

function draw() {
  background(220); // 背景顏色
  Engine.update(engine); // 更新物理引擎
  strokeWeight(2);
  stroke(0);

  // 顯示攝影機畫面
  image(video, 0, 0, width, height);

  // 畫出障礙物
  fill(120, 120, 120, 180);
  noStroke();
  for (let obs of obstacles) {
    rect(obs.x, obs.y, obs.w, obs.h, 8);
  }
  stroke(0);

  // 只有偵測到手部時才產生新的 logo 圓形，且只會下落
  if (hands.length > 0) {
    if (random() < 0.1) {
      circles.push(new Circle());
    }
  }

  // 顯示所有 logo 圓形，並檢查是否要移除
  for (let i = circles.length - 1; i >= 0; i--) {
    circles[i].checkDone();
    circles[i].update();      // 更新位置與碰撞
    circles[i].display();
    if (circles[i].done) {
      circles[i].removeCircle();
      circles.splice(i, 1);
    }
  }

  // 若有偵測到手部
  if (hands.length > 0) {
    let thumb = hands[0].keypoints[THUMB_TIP];
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    fill(0, 255, 0);
    noStroke();
    circle(thumb.x, thumb.y, 10);
    circle(index.x, index.y, 10);
    bridge.bodies[0].position.x = thumb.x;
    bridge.bodies[0].position.y = thumb.y;
    bridge.bodies[bridge.bodies.length - 1].position.x = index.x;
    bridge.bodies[bridge.bodies.length - 1].position.y = index.y;
    bridge.display();
  }
}

// 手勢辨識回傳資料的 callback
function gotHands(results) {
  hands = results; // 儲存手部資料
}

// logo 圓形類別
class Circle {
  constructor() {
    this.x = random(width);      // 隨機 x 座標
    this.y = random(height);     // 隨機 y 座標
    this.r = random(20, 40);     // 隨機半徑
    this.done = false;           // 是否完成(要移除)
    // 只會下落
    this.vx = 0;
    this.vy = random(2, 4);      // 固定向下速度
  }

  checkDone() {
    // 超出畫面就消失
    if (
      this.x + this.r < 0 || this.x - this.r > width ||
      this.y - this.r > height
    ) {
      this.done = true;
    }
  }

  update() {
    // 只會下落
    this.x += this.vx;
    this.y += this.vy;

    // 與障礙物碰撞反彈（只反彈y方向）
    for (let obs of obstacles) {
      let closestX = constrain(this.x, obs.x, obs.x + obs.w);
      let closestY = constrain(this.y, obs.y, obs.y + obs.h);
      let distX = this.x - closestX;
      let distY = this.y - closestY;
      let distance = sqrt(distX * distX + distY * distY);

      if (distance < this.r) {
        // 只反彈y方向
        this.vy *= -1;
        this.y += this.vy * 2;
      }
    }
  }

  display() {
    // 用 logoImg 畫圖，中心點為 (this.x, this.y)
    image(logoImg, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
  }

  removeCircle() {
    // 你的移除邏輯
  }
}
