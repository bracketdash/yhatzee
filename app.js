const dice = Array.from(document.querySelectorAll(".dice > input"));
const used = document.querySelector(".used");
const suggestion = document.querySelector(".suggestion");
const yourCombos = document.querySelector(".your-combos");

function checkBoard() {
  const diceArr = [];
  dice.forEach(({ value }) => {
    if (value) {
      diceArr.push(parseInt(value, 10));
    }
  });
  if (diceArr.length !== 5) {
    suggestion.innerHTML = "Enter your dice above for an AI suggestion.";
    suggestion.classList.add("no-suggestion");
    yourCombos.classList.add("hidden");
    return;
  }
  const usedCombos = [];
  used.querySelectorAll("label > input").forEach((usedCombo) => {
    if (usedCombo.checked) {
      usedCombos.push(parseInt(usedCombo.id.replace("combo-used-", ""), 10));
    }
  });
  suggestion.classList.remove("no-suggestion");
  yourCombos.classList.remove("hidden");
  getSuggestion(diceArr.sort(), usedCombos, (message, combos) => {
    suggestion.innerHTML = message;
    yourCombos.querySelector("tbody").innerHTML = combos
      .map(
        ({ name, points, max }) =>
          `<tr><td>${name}</td><td>${points}</td><td>${max}</td></tr>`
      )
      .join("");
  });
}

function generateUsedOptions() {
  used.innerHTML = pointCombos
    .map(
      ({ name }, index) =>
        `<label><input type="checkbox" id="combo-used-${index}" /> ${name}</label>`
    )
    .join("");
  used.querySelectorAll("label").forEach((usedCombo) => {
    usedCombo.addEventListener("click", checkBoard);
  });
}

function handleKeydown(event) {
  const input = event.target;
  const currentIndex = dice.indexOf(input);
  const isLastInput = currentIndex === 4;
  const isFirstInput = currentIndex === 0;
  const isEmpty = input.value === "";
  const controlKeys = [
    "ArrowRight",
    "ArrowLeft",
    "Backspace",
    "Delete",
    "Enter",
  ];
  if (controlKeys.includes(event.key) || event.key.length === 1) {
    event.preventDefault();
  }
  const asNumber = parseInt(event.key);
  if (!isNaN(asNumber) && asNumber > 0 && asNumber < 7) {
    input.value = event.key;
    if (!isLastInput) {
      dice[currentIndex + 1].focus();
    }
    checkBoard();
  } else if (controlKeys.includes(event.key)) {
    switch (event.key) {
      case "ArrowRight":
        if (!isLastInput) {
          dice[currentIndex + 1].focus();
        }
        break;
      case "ArrowLeft":
        if (!isFirstInput) {
          dice[currentIndex - 1].focus();
        }
        break;
      case "Backspace":
        if (isEmpty) {
          if (!isFirstInput) {
            const prevInput = dice[currentIndex - 1];
            prevInput.value = "";
            dice[currentIndex - 1].focus();
          }
        } else {
          input.value = "";
        }
        checkBoard();
        break;
      case "Delete":
        input.value = "";
        if (!isLastInput) {
          dice[currentIndex + 1].focus();
        }
        checkBoard();
        break;
    }
  }
}

generateUsedOptions();

dice.forEach((input) => {
  input.addEventListener("keydown", handleKeydown);
});

dice[0].focus();
