// DOM Elements
const mainMenu = document.getElementById('main-menu');

const menuButtons = document.getElementById('menu-buttons');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const accountButton = document.getElementById('account');
const leaderButton = document.getElementById('leader');
const hiScore = document.getElementById('hiscore');

const accountMenu = document.getElementById('account-menu');

const leaderMenu = document.getElementById('leader-menu');

const gameContainer = document.getElementById('game-container');

const scoreElement = document.querySelector(".score");
const noteElement = document.querySelector("footer"); 

//Settings
let gameColor = "white";
let musicVolume;

// Game State
let isDead = false;
let isPaused = false;
let isArrowActive = false;
let isPauseActive = false;
let isEscActive = false;
let isSnakeNamed = false;

//Game Variables
let snakePositions;
let applePosition;
let startTimestamp;
let stepsTaken;
let score;
let speed = 200;

let pauseTimestamp; // Tracks when the game was paused
let elapsedPausedTime = 0; // Tracks total time spent paused

//Input Storage Array
let inputs;

//Game Constants
const width = 15;
const height = 15;

window.onload = function() {
    gameContainer.style.display = 'none';
    pauseButton.style.display = 'none';
    leaderMenu.style.display = 'none';
    accountMenu.style.display = 'none';
};

leaderButton.addEventListener('click', () => {
  menuButtons.style.display = 'none';
  leaderMenu.style.display = 'flex';
  isEscActive = true;
  retrieveTopSnakes();  // Fetch and display the top snakes
});

startButton.addEventListener('click', () => {   
    if(!isSnakeNamed){
    alert('You must first make a Snake using the Account button!')
    return;
   }
    startGame(); 
    startButton.style.display = 'none';
    pauseButton.style.display = 'block';
});

pauseButton.addEventListener('click', () => {
  togglePause();
});

accountButton.addEventListener('click', () =>{
  menuButtons.style.display = 'none';
  accountMenu.style.display = 'flex';
  isEscActive = true;
});

leaderButton.addEventListener('click', () =>{
  menuButtons.style.display = 'none';
  leaderMenu.style.display = 'flex';
  isEscActive = true;
});


function startGame() {
    resetGame();
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block'; 
    isArrowActive = true;
    isPauseActive = true;
    isPaused = false;
    console.log('Game Started!');
}

function pauseGame() {
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
    isArrowActive = false;
    pauseTimestamp = performance.now();
    console.log('Game Paused');
}

function resumeGame() {
    gameContainer.style.display = 'block';
    mainMenu.style.display = 'none';
    isArrowActive = true;
    elapsedPausedTime += performance.now() - pauseTimestamp;
    console.log('Game Resumed');
    window.requestAnimationFrame(main); // Restart game loop
}

function togglePause() {
  isPaused = !isPaused;

  if (isPaused) {
    // Pause: Record pause start time
    pauseGame()
  } else {
    // Resume: Add paused duration to elapsed time
    resumeGame()
  }
}

function returnToMenu() {
    accountMenu.style.display = 'none';
    leaderMenu.style.display = 'none';
    menuButtons.style.display = 'flex';
}

function changeColor() {
  const colorInput = currentScolor;
  gameColor = "#" + colorInput;

  document.documentElement.style.setProperty('--gamecolor', gameColor);
  console.log(gameColor)
}

//Event Listener Declaration
window.addEventListener("keydown", function(event) {
  if(!isPauseActive)
    return;

  if(![" "].includes(event.key))
      return;

  event.preventDefault();
  if(
      event.key == " "
  ) {
    togglePause()
  }
})

window.addEventListener("keydown", function(event) {
  if(!isEscActive)
    return;

  if(!["Escape"].includes(event.key))
      return;

  event.preventDefault();
  if(
    event.key == "Escape"
  ) {
  returnToMenu();
  isEscActive = false;
  }
})



window.addEventListener("keydown", function(event) {
  if (!isArrowActive) 
      return; 
  
  if(!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key))
    return;

  event.preventDefault();
  if (
    event.key == "ArrowLeft" &&
    inputs[inputs.length - 1] != "left" &&
    headDirection() != "right"
  ) {
    inputs.push("left");
    return;
  }
  if (
    event.key == "ArrowUp" &&
    inputs[inputs.length - 1] != "up" &&
    headDirection() != "down"
  ) {
    inputs.push("up");
    return;
  }
  if (
    event.key == "ArrowRight" &&
    inputs[inputs.length - 1] != "right" &&
    headDirection() != "left"
  ) {
    inputs.push("right");
    return;
  }
  if (
    event.key == "ArrowDown" &&
    inputs[inputs.length - 1] != "down" &&
    headDirection() != "up"
  ) {
    inputs.push("down");
    return;
  }
});

//Grid Instantiation
const grid = document.querySelector(".grid");
for (let i = 0; i < width * height; i++) {
  const content = document.createElement("div");
  content.setAttribute("class", "content");
  content.setAttribute("id", i); // Just for debugging, not used

  const tile = document.createElement("div");
  tile.setAttribute("class", "tile");
  tile.appendChild(content);

  grid.appendChild(tile);
}

const tiles = document.querySelectorAll(".grid .tile .content");

//Game Reset
function resetGame() {
  
    // Reset positions
    snakePositions = [168, 169, 170, 171];
    applePosition = 100; // Initially the apple is always at the same position to make sure it's reachable
  
    // Reset game progress
    startTimestamp = undefined;
    pauseTimestamp = undefined;
    elapsedPausedTime = 0;
    stepsTaken = -1; // It's -1 because then the snake will start with a step
    score = 0;
    isDead = false;
  
    // Reset inputs
    inputs = [];
  
    // Reset header
    scoreElement.innerText = "0";
  
    // Reset footer
    noteElement.innerHTML = `It all begins here. You can feel the hunger clawing from the inside.`;


    // Reset tiles
    for (const tile of tiles) setTile(tile);
  
    // Render apple
    setTile(tiles[applePosition], {
      "background-color": gameColor,
      "border-radius": "50%"
    });
  
    // Render snake
    for (const i of snakePositions.slice(1)) {
      const snakePart = tiles[i];
      snakePart.style.backgroundColor = gameColor;
  
      // Set up transition directions for head and tail
      if (i == snakePositions[snakePositions.length - 1])
        snakePart.style.left = 0;
      if (i == snakePositions[0]) snakePart.style.right = 0;
    }

    window.requestAnimationFrame(main);
}

//Main Loop
function main(timestamp) {
  try {
    // Handle paused state
    if (isPaused) {
      pauseTimestamp = timestamp; // Record when paused
      return;
    }

    if (isDead) {
      return;
    }

    // Initialize start timestamp
    if (startTimestamp == undefined) startTimestamp = timestamp;

    // Calculate elapsed time excluding paused duration
    const totalElapsedtime = timestamp - startTimestamp - elapsedPausedTime;
    const stepsShouldHaveTaken = Math.floor(totalElapsedtime / speed);

    // Take steps if needed
    if (stepsTaken < stepsShouldHaveTaken) {
      step();
      stepsTaken++;

      // Handle apple consumption
      const headPosition = snakePositions[snakePositions.length - 1];
      if (headPosition == applePosition) {
        score++;
        scoreElement.innerText = score;
        addNewApple();
      }
    }

    
    // Continue animation loop
    window.requestAnimationFrame(main);
  } catch (error) {
    noteElement.innerHTML = `${error.message} Press space to reset the temporal field.`;
  }
}

function step() {
  const newHeadPosition = getNextPosition();
  snakePositions.push(newHeadPosition);

  if (newHeadPosition != applePosition) {
    const previousTail = tiles[snakePositions[0]];
    previousTail.style.backgroundColor = "transparent";
    snakePositions.shift();
  }

  const head = tiles[newHeadPosition];
  head.style.backgroundColor = gameColor;
}

function addNewApple() {
  var newApplePosition = Math.floor(Math.random() * tiles.length);
  while (snakePositions.includes(newApplePosition)) {
    newApplePosition = Math.floor(Math.random() * tiles.length);
  }

  // clear the previous apple
  const previousApple = tiles[applePosition];
  previousApple.style.cssText = `
    background-color: ${gameColor};
    border-radius: 0%;
  `;

  // cet the new apple position
  applePosition = newApplePosition;
  const newAppleTile = tiles[applePosition];
  newAppleTile.style.cssText = `
    background-color: ${gameColor};
    border-radius: 50%;
  `;
}

function getNextPosition() {
  const headPosition = snakePositions[snakePositions.length - 1];

  const snakeDirection = inputs.shift() || headDirection();
 
  switch(snakeDirection) {
    case "right" : {
      const nextPosition = headPosition + 1;
      if (nextPosition % width == 0) wallDeath();
      if (snakePositions.includes(nextPosition)) selfDeath();
      return nextPosition;
    }
    case "left" : {
      const nextPosition = headPosition - 1;
      if (nextPosition % width == width - 1) wallDeath();
      if (snakePositions.includes(nextPosition)) selfDeath();
      return nextPosition;
    }
    case "down" : {
      const nextPosition = headPosition + width;
      if (nextPosition > width * height - 1) wallDeath();
      if (snakePositions.includes(nextPosition)) selfDeath();
      return nextPosition;
    }
    case "up" : {
      const nextPosition = headPosition - width;
      if (nextPosition < 0) wallDeath();
      if (snakePositions.includes(nextPosition)) selfDeath();
      return nextPosition;
    }
  }
}

function wallDeath(){
  startButton.style.display = 'block';
  pauseButton.style.display = 'none';
  isArrowActive = false;
  isDead = true;
  setHiScore();
  throw Error("The snake hit the walls of Eden, but lacked the force to shatter the barrier.")
}

function selfDeath(){
  startButton.style.display = 'block';
  pauseButton.style.display = 'none';
  isArrowActive = false;
  isDead = true;
  setHiScore();
  throw Error("The snake, whose hunger can never be sated, ended up devouring itself.")
}

function setHiScore() {
  const currentName = document.getElementById("currentsname").innerText;
  const currentHiScore = parseInt(document.getElementById("hiscore").innerText);
  
  if (score > currentHiScore) {
      // Update the displayed score
      document.getElementById("hiscore").innerText = score;

      // Send the updated score to the server
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "phpjs.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      xhr.onload = function () {
          if (this.status == 200) {
              console.log("High score updated successfully.");
          } else {
              console.error("Failed to update high score:", this.responseText);
          }
      };

      // Send snake name and new score to the server
      xhr.send(`action=updateHiScore&sname=${encodeURIComponent(currentName)}&hiscore=${score}`);
  }
}

function headDirection() {
  const snakeHead = snakePositions[snakePositions.length - 1]; 
  const snakeNeck = snakePositions[snakePositions.length - 2]; 
  const directionComparator = snakeHead - snakeNeck;

  if (directionComparator === 1) return "right"; 
  else if (directionComparator === -1) return "left"; 
  else if (directionComparator === width) return "down";
  else if (directionComparator === -width) return "up"; 
}

function setTile(element, overrides = {}) {
  const defaults = {
    width: "100%",
    height: "100%",
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto",
    "background-color": "transparent"
  };
  const cssProperties = { ...defaults, ...overrides };
  element.style.cssText = Object.entries(cssProperties)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
}