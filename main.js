// ===========
// global variable
// ===========
// letters
const letters = "abcdefghijklmnopqrstuvwxyz";
// array
let lettersArray = Array.from(letters);

// select letters container

let lettersContainer = document.querySelector(".letters");

// generate letters
lettersArray.forEach((letter) => {
  // create span
  let span = document.createElement("span");
  // create letter text node
  let theLetter = document.createTextNode(letter);
  // append letter to span
  span.appendChild(theLetter);
  // add class on span
  span.className = "letter-box";
  // append span to the letters container
  lettersContainer.appendChild(span);
});

let words = {};
let randomValue = "";
let wrongAttempts = 0;
let guessSpans;
let Draw;
let hintUsed = false;
let currentDifficulty = "easy";
let gameTimer;
// Get the saved score from localStorage if it exists
score = parseInt(localStorage.getItem("score")) || 0; // currentscore
document.querySelector(".score").textContent = `Score: ${score}`;
let startTime; // record when start word

// points based on level
const wordPoints = {
  easy: 10,
  medium: 20,
  hard: 30,
};
const wrongPenalty = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// fetch json
fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    words = data;
    // startGame();
    const startBtn = document.getElementById("start-btn");
    const difficultySelect = document.getElementById("difficulty");

    if (!startBtn || !difficultySelect) {
      console.warn("start-btn or difficulty select not found in DOM");
      return;
    }

    startBtn.addEventListener("click", () => {
      currentDifficulty = difficultySelect.value || "easy";
      startGame(currentDifficulty);
      const diffBox = document.querySelector(".difficulty-select");
      if (diffBox) diffBox.style.display = "none";
      // add timer based on difficulty

      let timerBox = document.querySelector(".timer");
      if (!timerBox) {
        timerBox = document.createElement("div");
        timerBox.className = "timer";
        document.querySelector(".game-info").appendChild(timerBox);
      }
    });
  })
  .catch((error) => {
    console.log("Error, loading words: ", error);
  });
// start timer
function startTimer() {
  clearInterval(gameTimer);
  let timerBox = document.querySelector(".timer");
  if (!timerBox) {
    timerBox = document.createElement("div");
    timerBox.className = "timer";
    document.querySelector(".game-info").appendChild(timerBox);
  }
  let timeLimit =
    currentDifficulty === "easy"
      ? 90
      : currentDifficulty === "medium"
      ? 60
      : 40;
  timerBox.innerHTML = `<span id="time-left">${timeLimit} Sec</span>`;

  gameTimer = setInterval(() => {
    timeLimit--;
    document.getElementById("time-left").textContent = `${timeLimit} Sec`;
    if (timeLimit <= 0) {
      clearInterval(gameTimer);
      lettersContainer.classList.add("finished");
      endGame(false);
    }
  }, 1000);
}

// ============
// start game
// ============

// get random property
function startGame(difficulty = currentDifficulty) {
  startTimer(); // start new word
  startTime = new Date().getTime();
  wrongAttempts = 0;
  // reset ui from any previous run
  document.querySelector(".letters-guess").innerHTML = "";
  lettersContainer.classList.remove("finished");
  hintUsed = false;
  const hintBtnEl = document.getElementById("hint-btn");
  if (hintBtnEl) {
    hintBtnEl.disabled = false;
    hintBtnEl.classList.remove("clicked");
  }

  // Check if data exists in words
  if (!words || Object.keys(words).length === 0) {
    console.error("No categories or words available in words.json");
    alert(
      "Error: No words available to start the game. Please check the words.json file."
    );
    return;
  }

  // all categories
  let allKeys = Object.keys(words);

  //  choose random category
  let randomPropName = allKeys[Math.floor(Math.random() * allKeys.length)];
  //filtering based on levels
  let filteredWords = words[randomPropName].filter((word) => {
    let len = word.replace(/\s+/g, "").length;
    if (difficulty === "easy") return len <= 5;
    if (difficulty === "medium") return len > 5 && len <= 8;
    if (difficulty === "hard") return len > 8;
    return false;
  });
  // if there are no category available try another category
  let attempts = 0;
  const maxAttempts = allKeys.length;
  while (filteredWords.length === 0 && attempts < maxAttempts) {
    randomPropName = allKeys[Math.floor(Math.random() * allKeys.length)];
    filteredWords = words[randomPropName].filter((word) => {
      let len = word.replace(/\s+/g, "").length;
      if (difficulty === "easy") return len <= 5;
      if (difficulty === "medium") return len > 5 && len <= 8;
      if (difficulty === "hard") return len > 8;
      return false;
    });
    attempts++;
  }

  // If you still don't find suitable words after trying all the categories
  if (filteredWords.length === 0) {
    console.warn(
      "No matching words found for this difficulty, choosing random fallback"
    );
    filteredWords = words[randomPropName];
    if (filteredWords.length === 0) {
      console.error(`No words available in category '${randomPropName}'.`);
      alert(
        "Error: No words available in the selected category. Please check the words.json file."
      );
      return;
    }
  }

  // Select a random word from the filtered words
  randomValue = filteredWords[Math.floor(Math.random() * filteredWords.length)];

  // reset
  // set category info
  document.querySelector(".game-info .category span").innerHTML =
    randomPropName;
  //select letters guess element
  let letterGuessContainer = document.querySelector(".letters-guess");
  letterGuessContainer.innerHTML = "";
  // convert chosen word to array
  let lettersAndSpace = Array.from(randomValue);
  // creates spans depends on word
  lettersAndSpace.forEach((letter) => {
    // create empty span
    let emptyspan = document.createElement("span");
    // if letter is space
    if (letter === " ") {
      // add class to the span
      emptyspan.className = "white-space";
    }
    // append span to the letters guess container
    letterGuessContainer.appendChild(emptyspan);
  });

  // select guess spans
  guessSpans = document.querySelectorAll(".letters-guess span");

  Draw = document.querySelector(".hangman-draw");
  Draw.className = "hangman-draw";
  const timerBox = document.querySelector(".timer");
  if (timerBox) timerBox.style.display = "block";
}
// handle clicking on lettes
document.addEventListener("click", (e) => {
  const diffBox = document.querySelector(".difficulty-select");
  if ((diffBox && diffBox.style.display !== "none") || !randomValue) return;
  if (!Draw) Draw = document.querySelector(".hangman-draw");
  if (!lettersContainer) lettersContainer = document.querySelector(".letters");
  // ignore any clicked on button
  if (e.target.id === "hint-btn") return;
  // set status
  let TheStatus = false;

  if (
    e.target.className === "letter-box" &&
    !e.target.classList.contains("clicked") &&
    !lettersContainer.classList.contains("finished")
  ) {
    e.target.classList.add("clicked");

    // get clicked letter
    let ClickedLetter = e.target.innerHTML.toLowerCase();

    // the chosen word
    let ChosenWord = Array.from(randomValue.toLowerCase());
    // console.log(ChosenWord);

    // If the clicked letter matches one in the word

    ChosenWord.forEach((wordLetter, WordIndex) => {
      if (ClickedLetter == wordLetter) {
        // set status to correct
        TheStatus = true;
        guessSpans[WordIndex].innerHTML = ClickedLetter;
      }
    });

    // out looping
    // if letter is wrong
    if (TheStatus !== true) {
      // increase the wrong attempts
      wrongAttempts++;
      // add class on the draw element
      Draw.classList.add(`wrong-${wrongAttempts}`);
      // play fail sound
      let failSound = document.getElementById("fail");
      failSound.currentTime = 0;
      failSound.play();
      if (wrongAttempts === 8) {
        lettersContainer.classList.add("finished");
        endGame(false);
      }
    } else {
      // play success sound
      let successSound = document.getElementById("success");
      successSound.currentTime = 0;
      successSound.play();

      // check if player win
      let allFilled = Array.from(guessSpans)
        .filter((span) => !span.classList.contains("white-space"))
        .every((span) => span.innerHTML !== "");

      if (allFilled) {
        lettersContainer.classList.add("finished");
        addScore();
        endGame(true);
      }
    }
  }
});
// ==============
//===== hints ===
// ==============
const hintBtn = document.getElementById("hint-btn");
if (hintBtn) {
  hintBtn.addEventListener("click", () => {
    if (!Draw || !lettersContainer || !guessSpans || !randomValue) return;

    if (hintUsed) return; // if used return it
    hintUsed = true;
    // increase wrongattempts
    wrongAttempts++;
    Draw.classList.add(`wrong-${wrongAttempts}`);

    // choose letter random didnt discover it
    let hiddenIndexes = [];
    guessSpans.forEach((span, index) => {
      if (span.innerHTML === "") hiddenIndexes.push(index);
    });

    if (hiddenIndexes.length > 0) {
      let randomIndex =
        hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];
      let letterToShow = randomValue[randomIndex].toUpperCase();
      guessSpans[randomIndex].innerHTML = letterToShow;

      // select letter from letter box
      document.querySelectorAll(".letter-box").forEach((box) => {
        if (box.innerHTML.toUpperCase() === letterToShow) {
          box.classList.add("clicked");
        }
      });
    }
    // disable after use it
    const hintBtn = document.getElementById("hint-btn");
    hintBtn.disabled = true;
    hintBtn.classList.add("clicked");

    // if hint the user end game
    let allFilled = true;
    guessSpans.forEach((span) => {
      if (span.innerHTML === "") {
        allFilled = false;
      }
    });
    if (allFilled) {
      lettersContainer.classList.add("finished");
      addScore();
      endGame(true);
    }
    // after using hint wrongattempts =8
    if (wrongAttempts === 8) {
      lettersContainer.classList.add("finished");
      endGame(false);
    }
  });
}
// ============
// ===how to paly
// ============
const howIcon = document.getElementById("how-btn");
howIcon.addEventListener("click", () => {
  // check if popup open
  if (document.querySelector(".popup-info")) return;
  const infoPopup = document.createElement("div");
  infoPopup.className = "popup-info";
  infoPopup.innerHTML = `
  <h2>How TO Play</h2>
  <p>[1] At the first Choose the difficulty level before starting.</p>
  <p>[2] Keep an eye on the time (easy: 90s, Medium:60s, Hard:40s) </p>
  <p>[3] Try to guess the hidden word based on its category (Word From) before the man is hanged.</p>
  <p>[4] Click letters to guess them.</p>
  <p>[5] Each mistake adds part of the hangman (You can make ONLY 7 mistakes).</p>
  <p>[6] The score is calculated based on the difficulty level It varies depending on the level.
  <p>[7] You can use one Hint only (but it costs one attempt !!) .</p>
  <h3 class="msg">Enjoy your time <i class="fa-regular fa-heart"></i></h3>
  <button id="close-popup-btn"> Close </button>
  `;
  document.body.appendChild(infoPopup);
  document.getElementById("close-popup-btn").addEventListener("click", () => {
    infoPopup.remove();
  });
});

// ===========
// score
// ===========

function addScore() {
  // time left
  let endTime = new Date().getTime();
  let timeTaken = Math.floor((endTime - startTime) / 1000);

  // main points
  let points = wordPoints[currentDifficulty];

  // points minus when wrong
  points -= wrongAttempts * wrongPenalty[currentDifficulty];
  // bouns if finish before the time end
  let maxTime =
    currentDifficulty === "easy"
      ? 90
      : currentDifficulty === "medium"
      ? 60
      : 40;
  if (timeTaken < maxTime) {
    points += Math.floor((maxTime - timeTaken) / 5);
  }
  if (points < 0) points = 0;
  score += points;
  localStorage.setItem("score", score);
  document.querySelector(".score").textContent = `Score: ${score}`;
}

// reset game
function resetGame() {
  clearInterval(gameTimer);
  lettersContainer.classList.remove("finished");
  wrongAttempts = 0;
  hintUsed = false;
  if (Draw) Draw.className = "hangman-draw";
  document.querySelector(".letters-guess").innerHTML = "";
  document
    .querySelectorAll(".letter-box")
    .forEach((b) => b.classList.remove("clicked"));
  startGame(currentDifficulty);
}
// reset button
const startBtn = document.getElementById("start");
if (startBtn) startBtn.disabled = false;
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    clearInterval(gameTimer);
    // reset score
    score = 0;

    localStorage.setItem("score", score);
    document.querySelector(".score").textContent = `Score: ${score}`;
    // show diddiculty select
    const diffBox = document.querySelector(".difficulty-select");
    if (diffBox) diffBox.style.display = "block";
    // hide timer box
    const timerBox = document.querySelector(".timer");
    if (timerBox) timerBox.style.display = "none";
    // reset variables
    hintUsed = false;
    wrongAttempts = 0;
    // hintBtn.disabled = true;
    lettersContainer.classList.add("finished");
    document.querySelector(".letters-guess").innerHTML = "";
    document.querySelector(".hangman-draw").className = "hangman-draw";
    document
      .querySelectorAll(".letter-box")
      .forEach((b) => b.classList.remove("clicked"));
    randomValue = "";
  });
}

// ============
// end game function
// ============
function endGame(isWin) {
  // stop timer
  clearInterval(gameTimer);
  // create popup div
  let div = document.createElement("div");

  // create text
  if (isWin) {
    // play win or lose sound
    let winSound = document.getElementById("game-won");
    winSound.currentTime = 0;
    winSound.play();
  } else {
    let loseSound = document.getElementById("game-over");
    loseSound.currentTime = 0;
    loseSound.play();
    // score when loss
    let penalty = wrongAttempts * wrongPenalty[currentDifficulty];
    score -= penalty;
    if (score < 0) score = 0;
  }
  localStorage.setItem("score", score);
  document.querySelector(".score").textContent = `Score: ${score}`;

  // ==========
  // create popup div
  // ==========
  let divText = document.createElement("div");
  if (isWin) {
    divText.innerHTML = ` <i class="fa-regular fa-face-kiss-wink-heart icon-pop"></i> <br>
      <strong>Congrats You Win!</strong> <br>
      You made <strong>${wrongAttempts}</strong> mistakes.<br> 
      The word was <strong>${randomValue}</strong>.<br>
      Would you play again?<br>
      <button id="play-again">Play Again</button>
    `;
  } else {
    divText = document.createElement("div");
    divText.innerHTML = ` <i class="fa-solid fa-heart-crack icon-pop"></i> <br>
    Game Over!<br>
      The word was <strong>${randomValue}</strong>.<br>
      <button id="play-again">Play Again</button>
    `;
  }

  // append text to div
  div.appendChild(divText);
  // add class on div
  div.className = "popup";
  // append to the body
  document.body.appendChild(div);
  document.getElementById("play-again").addEventListener("click", () => {
    document.querySelector(".popup").remove();
    resetGame();
  });
  document.querySelector(".score").textContent = `Score: ${score}`;
}
