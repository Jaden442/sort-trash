let bins = [];
let level = 1; // Initial level
let trashSorted = 0; // Counter for sorted trash items
let totalTrashSorted = 0; // Counter for total sorted trash items
let timer = 30; // seconds
let startTime;
let playAgainButton; // Button to play again
let lastSpawnTime = 0; // Time of the last trash item spawn
let spawnDelay = 2000; // Fixed spawn delay in milliseconds
let trashItems = []; // Array to store trash items
let levelChangeText = ""; // Text to display when level changes
let levelChangeTime = 0; // Time when level change text appears
const baseSpawnDelay = 2000; // Initial spawn delay in milliseconds
let spawnDelayFactor = 1; // Factor to adjust spawn delay
const maxSpawnFactor = 5; // Maximum factor to adjust spawn delay
let bestScore = 0;
let darkMode = false; // Flag for dark mode
let green1 = false; // Flag for dark mode

// Sound variables
let trashSortingSound;
let trashSpawningSound;

function setup() {
  createCanvas(windowWidth, windowHeight); // Adjust canvas size
  createBins();
  startTime = millis();
  playAgainButton = createButton("Play Again"); // Create the play again button
  playAgainButton.hide(); // Hide the button initially
  playAgainButton.mousePressed(restartGame); // Set up button event handler
  
  // Initialize sound effects
  trashSortingSound = new p5.Oscillator(); 
  trashSortingSound.setType('sine');
  trashSortingSound.freq(440);
  trashSortingSound.amp(0);

  trashSpawningSound = new p5.Oscillator(); 
  trashSpawningSound.setType('sine');
  trashSpawningSound.freq(440);
  trashSpawningSound.amp(0);
}

function draw() {
  
  background(255,); // Set background to black during night mode
  fill(0);
  

  // Display bins
  for (let bin of bins) {
    bin.display();
  }

  // Display and move trash items
  for (let i = 0; i < trashItems.length; i++) {
    let item = trashItems[i];
    item.display();
    item.move();

    // Check if the item is caught by a bin
    for (let bin of bins) {
      if (item.isCaught(bin)) {
        trashItems.splice(i, 1);
        trashSorted++;
        totalTrashSorted++;
        trashSortingSound.amp(0.5); // Play sound when trash is sorted
        trashSortingSound.start();
        trashSortingSound.stop(0.1);
        break;
      }
    }

    // Remove items that have gone off the screen
    if (item.y > height) {
      trashItems.splice(i, 1);
      gameOver(); // Display game over screen
      break;
    }
  }

  // Display level
  textSize(20);
  text("Level: " + level, 60, 30);

  // Display total trash sorted
  text("Total Trash Sorted: " + totalTrashSorted, 115, 60);

  // Display level change text
  if (millis() - levelChangeTime < 2000) {
    // Display for 2 seconds
    textSize(32);
    fill(0, 255, 0); // Green color for level change text
    text(levelChangeText, width / 2, height / 2);
  }

  // Update the timer
  timer = max(0, startTime + 1000 * 30 - millis()) / 1000;

  // Increase level when enough trash is sorted
  if (trashSorted >= 10) {
    nextLevel();
    trashSorted = 0; // Reset sorted trash count
  }

  // Spawn new trash item when enough time has passed
  let elapsedTime = millis() - lastSpawnTime;
  if (elapsedTime >= spawnDelay) {
    createTrashItem();
    lastSpawnTime = millis();
    trashSpawningSound.amp(0.5); // Play sound when trash is spawned
    trashSpawningSound.start();
    trashSpawningSound.stop(0.1);
  }
}

// Function to restart the game
function restartGame() {
  level = 1;
  trashSorted = 0;
  startTime = millis();
  playAgainButton.hide(); // Hide the play again button
  trashItems = []; // Reset trash items
  totalTrashSorted = 0; // Reset total trash sorted
  loop(); // Restart the game loop
}

// Bin class
class Bin {
  constructor(x, y, color, label) {
    this.x = x;
    this.y = y;
    this.width = 100; // Increase size for bins
    this.height = 100; // Increase size for bins
    this.color = color;
    this.label = label;
  }

  display() {
    fill(this.color);
    rectMode(CENTER); // Center the rect
    rect(this.x, this.y, this.width, this.height);
    textSize(16); // Adjust text size
    fill(255);
    textAlign(CENTER, CENTER); // Center align text
    text(this.label, this.x, this.y);
  }
}

// TrashItem class
class TrashItem {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 60; // Increase size for mobile
    this.speed = random(3, 6); // Regular speed
    this.materials = [
      { label: "Plastic", color: color(255, 0, 0), shape: "bottle" },
      { label: "Paper", color: color(0, 255, 0), shape: "box" },
      { label: "Glass", color: color(0, 0, 255), shape: "glass" },
    ];
    this.material = random(this.materials);
    this.dragging = false;
  }

  display() {
    fill(this.material.color);
    ellipse(this.x, this.y, this.size, this.size);

    // Draw realistic trash item
    if (this.material.shape === "bottle") {
      drawPlasticBottle(this.x, this.y);
    } else if (this.material.shape === "box") {
      drawPaperBox(this.x, this.y);
    } else if (this.material.shape === "glass") {
      drawGlass(this.x, this.y);
    }
  }

  move() {
    this.y += this.speed;
  }

  isCaught(bin) {
    return (
      this.x > bin.x - bin.width / 2 &&
      this.x < bin.x + bin.width / 2 &&
      this.y > bin.y - bin.height / 2 &&
      this.y < bin.y + bin.height / 2 &&
      this.material.label === bin.label
    );
  }
}

// Create bins
function createBins() {
  let binWidth = 100;
  let binHeight = 100;
  let binGap = 200; // Adjust gap between bins
  bins.push(
    new Bin(
      width / 2 - binGap,
      height - binHeight / 2,
      color(255, 0, 0),
      "Plastic"
    )
  );
  bins.push(
    new Bin(width / 2, height - binHeight / 2, color(0, 255, 0), "Paper")
  );
  bins.push(
    new Bin(
      width / 2 + binGap,
      height - binHeight / 2,
      color(0, 0, 255),
      "Glass"
    )
  );
}

// Create new trash items
function createTrashItem() {
  trashItems.push(new TrashItem());
}

// Handle mouse events for dragging and dropping trash items
function touchStarted() {
  for (let item of trashItems) {
    let d = dist(mouseX, mouseY, item.x, item.y);
    if (d < item.size / 2) {
      item.dragging = true;
    }
  }
}

function touchMoved() {
  for (let item of trashItems) {
    if (item.dragging) {
      item.x = mouseX;
      item.y = mouseY;
    }
  }
}

function touchEnded() {
  for (let item of trashItems) {
    item.dragging = false;
  }
}

// Draw realistic trash items
function drawPlasticBottle(x, y) {
  fill(255, 0, 0);
  rect(x - 5, y - 10, 10, 20);
  ellipse(x, y - 10, 15, 15);
  // Add bottle neck
  rect(x - 2, y - 20, 4, 10);
}

function drawPaperBox(x, y) {
  fill(0, 255, 0);
  rect(x - 10, y - 10, 20, 20);
  // Add folded flaps
  rect(x - 10, y - 10, 20, 5);
  rect(x - 10, y + 5, 20, 5);
}

function drawGlass(x, y) {
  fill(0, 0, 255);
  // Draw a star shape for glass
  beginShape();
  for (let i = 0; i < TWO_PI; i += PI / 4) {
    let xoff = cos(i) * 10;
    let yoff = sin(i) * 10;
    vertex(x + xoff, y + yoff);
    xoff = cos(i + PI / 8) * 5;
    yoff = sin(i + PI / 8) * 5;
    vertex(x + xoff, y + yoff);
  }
  endShape(CLOSE);
}

// Function to proceed to the next level
function nextLevel() {
  level++;
  levelChangeText = "Level Up! Your Level: " + level;
  levelChangeTime = millis();
  adjustSpawnDelay();
}

// Adjust spawn delay based on level
function adjustSpawnDelay() {
  if (level <= 5) {
    spawnDelayFactor += 0.2; // Increase spawn frequency gradually for first 5 levels
  } else {
    spawnDelayFactor = min(spawnDelayFactor + 0.1, maxSpawnFactor); // Increase spawn frequency more slowly after level 5
  }

  spawnDelay = baseSpawnDelay / spawnDelayFactor; // Adjust spawn delay
}

// Function to display the game over screen
function gameOver() {
  if (totalTrashSorted > bestScore) {
    bestScore = totalTrashSorted;
    text("You set a new record!: " + bestScore, width / 2, height / 2 + 100);
  }
  textSize(32);
  fill(0);
  text("Sort the correct trash in the correct bins!", width / 2, height / 2 - 150);
  text("Game Over! Your Level: " + level, width / 2, height / 2 - 50);
  text("Total Trash Sorted: " + totalTrashSorted, width / 2, height / 2); // Display total trash sorted
  text("the best score: " + bestScore, width / 2, height / 2 + 50);
  playAgainButton.style("font-size", "20px");

  playAgainButton.position(width / 2 - 50, height / 2 + 150); // Position the play again button
  playAgainButton.show(); // Show the play again button
  noLoop(); // Stop the game loop
}
