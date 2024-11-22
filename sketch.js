const rules = {
  X: [
    { rule: "(F[RX][RX]FX)", prob: 0.5 },
    { rule: "(F[RX]FX)", prob: 0.05 },
    { rule: "(F[RX]FX)", prob: 0.05 },
    { rule: "(F[RRX][RX]FX)", prob: 0.1 },
    { rule: "(F[RX][RRX]FX)", prob: 0.1 },
    { rule: "(F[RX][RX]FXA)", prob: 0.05 },
    { rule: "(F[RX][RX]FXB)", prob: 0.5 },
  ],
  F: [
    { rule: "F(F)", prob: 0.8 },
    { rule: "F(FF)", prob: 0.05 },
    { rule: "F", prob: 0.05 },
    { rule: "RFR", prob: 0.05 },
    { rule: "F([RX])", prob: 0.025 },
    { rule: "F([RX])", prob: 0.025 },
  ],
  "(": "",
  ")": "",
  R: [
    { rule: "+", prob: 0.25 },
    { rule: "-", prob: 0.25 },
    { rule: "<", prob: 0.25 },
    { rule: ">", prob: 0.25 },
  ],
};

let len = 7; // Length of stem
let ang = 60; // Angle for rotations
let time = 0;

let drawRules;

let word = "X"; // Initial axiom

const maxGeneration = 6;
let currGeneration = 0;

let growthPercent = 1;
const growthRate = 0.1;

const showGrowth = true;

let mode = 0;
let colour = 0;

var img;
let value = "type";
let showInput = true;
let input;
let video;

function preload() {
  img = loadImage(
    "https://freight.cargo.site/t/original/i/d45d0b3b82fa33ab5508728a9d56ef123e987837b5277dd73c3b850c8408f663/Growing-Virtue.png"
  );
  font = loadFont("Roboto-Bold.otf");
}

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL);
  noStroke();
  toggleInput(true);
  toggleInput(false);

  // Connect to the WebSocket server
  // const socket = new WebSocket('ws://172.20.10.4:5001');
  // // Handle incoming messages
  // socket.onmessage = function (event) {
  //   const modemessage = event.data;
  //   if (modemessage.startsWith("mode:")) {
  //     mode = int(modemessage.split(":")[1]); // Parse and set the mode
  //   }
  // };

  video = createCapture(VIDEO); // Capture the webcam feed
  video.size(640, 480); // Set video dimensions
  video.hide(); // Hide the video element (optional)

  // Initialize L-System drawing rules
  drawRules = {
    A: (t) => {
      push();
      translate(0, -len * t); // Move to the end of the stem
      // box(t*8);
      drawFlower(6, 4, 4, 0.74, 0.4, 1.3); // Draw the flower geometry
      pop();
    },
    B: (t) => {
      push();
      translate(0, -len * t); // Move to the end of the stem
      // fill(colour, 100, 100);
      sphere(t * 6); // Draw the flower geometry
      pop();
    },
    F: (t) => {
      fill("#9ef93f"); // Stem color
      translate(0, (-len / 2) * t); // Move halfway along the stem
      cylinder(len / 8, len * t); // Draw the stem with appropriate thickness
      translate(0, (-len / 2) * t); // Move to the end of the stem
    },
    "+": (t) => rotateZ((PI / 180) * -ang * t),
    "-": (t) => rotateZ((PI / 180) * ang * t),
    "<": (t) => rotateX((PI / 180) * -ang * t),
    ">": (t) => rotateX((PI / 180) * ang * t),
    "[": push, // Save transformation state
    "]": pop, // Restore transformation state
  };

  if (!showGrowth) {
    print("!showGroth");
    fullyGrow();
  }
}

function draw() {
  background(0);

  // time++;
  // let userInput = input.value();
  // print(time);
  if (time >= 5000) {
    mode = 0;
    time = 0;
  }
  // rotateZ(frameRate);
  switch (mode) {
    case 0: //splash
      splashScreen();
      toggleInput(false);
      break;
    case 1:
      time++;
      angle = 60;
      len = 7;
      newDraw(320);
      break;
    case 2:
      time++;
      angle = 90;
      len = 8;
      newDraw(20);
      break;
    case 3:
      time++;
      angle = 30;
      len = 12;
      newDraw(90);
      break;
    case 4:
      time++;
      angle = 45;
      len = 8;
      newDraw(60);
      break;
    default:
      //splash
      splashScreen();
      break;
  }
}

function nextGeneration() {
  if (growthPercent < 1) return; // Skip if growth not complete

  if (currGeneration == maxGeneration) {
    // print("max");
    return;
    // currGeneration = 0;
    // word = "X"; // Reset to initial axiom
  }

  word = generate(word); // Generate the next state
  currGeneration++;
  growthPercent = 0; // Reset growth percentage
}

function fullyGrow() {
  word = "X";
  for (let i = 0; i < maxGeneration; i++) {
    word = generate(word);
  }
}

function generate(word) {
  let next = "";

  for (let c of word) {
    if (c in rules) {
      let rule = rules[c];

      if (Array.isArray(rule)) {
        next += chooseOne(rule);
      } else {
        next += rules[c];
      }
    } else {
      next += c;
    }
  }

  return next;
}

function chooseOne(ruleSet) {
  let n = random(); // Random number between 0 and 1
  let t = 0;
  for (let r of ruleSet) {
    t += r.prob;
    if (t > n) return r.rule;
  }
  return "";
}

function drawLsysLerp(state, t) {
  t = constrain(t, 0, 1);

  let lerpOn = false;

  push();
  for (let c of state) {
    if (c === "(") {
      lerpOn = true;
      continue;
    }

    if (c === ")") {
      lerpOn = false;
      continue;
    }

    let lerpT = lerpOn ? t : 1;

    if (c in drawRules) {
      drawRules[c](lerpT);
    }
  }
  pop();
}

function drawFlower(r, c, p, f1, f2, f3) {
  let v = [];
  let rows = r; // Number of rows for flower geometry
  let cols = c; // Number of columns for flower geometry
  let petals = p; // Number of petals in the flower

  // Create vertices for the flower geometry
  for (let theta = 0; theta < rows; theta++) {
    v.push([]);
    for (let phi = 0; phi < cols; phi++) {
      let r =
        (0.1 *
          (60 * pow(abs(sin((((phi * 360) / cols) * petals) / 2)), 1) + 200) *
          theta) /
        rows;
      let x = r * cos((phi * 360) / cols);
      let y = r * sin((phi * 360) / cols);
      let z =
        vShape(200, r / 100, f1, f2, f3) -
        200 +
        bump(1.5, r / 100, 3, (phi * 360) / cols);
      let pos = createVector(x, y, 0.5 * z + 100);
      v[theta].push(pos);
    }
  }

  // Draw the flower using vertices
  for (let theta = 0; theta < v.length - 1; theta++) {
    for (let phi = 0; phi < v[theta].length; phi++) {
      fill(colour, 100 - theta * 6, 100); // Gradient effect
      let nextPhi = (phi + 1) % v[theta].length;

      beginShape();
      vertex(v[theta][phi].x, v[theta][phi].y, v[theta][phi].z);
      vertex(v[theta + 1][phi].x, v[theta + 1][phi].y, v[theta + 1][phi].z);
      vertex(
        v[theta + 1][nextPhi].x,
        v[theta + 1][nextPhi].y,
        v[theta + 1][nextPhi].z
      );
      vertex(v[theta][nextPhi].x, v[theta][nextPhi].y, v[theta][nextPhi].z);
      endShape(CLOSE);
    }
  }
}

function vShape(A, r, a, b, c) {
  return A * pow(Math.E, -b * pow(abs(r), c)) * pow(abs(r), a);
}

function bump(A, r, f, angle) {
  return 1 + A * pow(r, 2) * sin(f * angle);
}

function newDraw(setColour) {
  // print(frameRate());

  // Animate growth
  if (showGrowth) {
    if (growthPercent < 1) {
      const mod = currGeneration + growthPercent;
      growthPercent += growthRate / mod;
    } else {
      nextGeneration();
    }
  }

  // Set up camera and view
  translate(0, height / 3, -width / 2);
  rotateY(frameCount * 0.001); // Slow rotation for better visualization
  colour = setColour;
  // Draw the L-System
  drawLsysLerp(word, growthPercent);

  textSize(512);
  fill(128);
  textAlign(CENTER, CENTER);
  textFont(font);
  let userInput = input.value();
  text(userInput, 0, 0);
}

function keyPressed() {
  if (key == "c") {
    currGeneration = 0;
    word = "X";
    // new user
  }
  if (key == "1") {
    currGeneration = 0;
    word = "X";
    mode = 1;
    time = 0;
    value = "love";
    toggleInput(true);
  }
  if (key == "2") {
    currGeneration = 0;
    word = "X";
    mode = 2;
    time = 0;
    value = "courage";
    toggleInput(true);
  }
  if (key == "3") {
    currGeneration = 0;
    word = "X";
    mode = 3;
    time = 0;
    value = "integrity";
    toggleInput(true);
  }
  if (key == "4") {
    currGeneration = 0;
    word = "X";
    mode = 4;
    time = 0;
    toggleInput(true);
  }
  if (key == "0") {
    mode = 0;
    toggleInput(false);
  }
  if (keyCode == 32) {
    image(video, 0, 0, width, height);
    saveCanvas("webcam_snapshot", "png"); // Save the canvas as an image
    window.print();
  }
}

function splashScreen() {
  background(0);
  imageMode(CENTER);
  drawFlower(6, 12, 5, 0.74, 0.3, 1.4);
  image(img, 0, 0, 800, 160);
}

function toggleInput(showInput) {
  if (showInput) {
    input = createInput(value);
    input.elt.focus();
    input.position(-1000, 0);
  } else {
    input.remove();
  }
}
