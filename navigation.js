function handleKeydown(event) {
  const input = event.target;
  const currentIndex = dice.indexOf(input);
  const isLastInput = currentIndex === inputs.length - 1;
  const isFirstInput = currentIndex === 0;
  const isEmpty = input.value === "";
  const allowedChar = !isNaN(parseInt(event.key));
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
  if (allowedChar) {
    const char = event.key;
    if (!focusInfo.isEmpty && !focusInfo.isLastInput) {
      dice[focusInfo.currentIndex + 1].focus();
      setTimeout(() => {
        const nextInput = focusInfo.inputs[focusInfo.currentIndex + 1];
        if (nextInput) {
          nextInput.value = char;
        }
      }, 0);
    } else {
      input.value = char;
      if (!focusInfo.isLastInput) {
        dice[focusInfo.currentIndex + 1].focus();
      }
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
          dice[focusInfo.currentIndex - 1].focus();
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
