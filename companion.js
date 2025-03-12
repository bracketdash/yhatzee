function sum(diceArr) {
  return diceArr.reduce((sum, current) => sum + current, 0);
}

function getMultiplesPoints(diceArr, ofWhat) {
  return diceArr.reduce(
    (sum, current) => (current === ofWhat ? sum + current : sum),
    0
  );
}

function getOfAKindPoints(diceArr, howMany) {
  const counts = new Map();
  if (
    diceArr.some((value) => {
      if (counts.has(value)) {
        const currentCount = counts.get(value);
        if (currentCount === howMany - 1) {
          return true;
        } else {
          counts.set(value, currentCount + 1);
        }
      } else {
        counts.set(value, 1);
      }
    })
  ) {
    return sum(diceArr);
  } else {
    return 0;
  }
}

function isFullHouse(diceArr) {
  const counts = new Map();
  diceArr.forEach((value) => {
    if (counts.has(value)) {
      counts.set(value, counts.get(value) + 1);
    } else {
      counts.set(value, 1);
    }
  });
  let hasThreeOfKind = false;
  let hasTwoOfKind = false;
  counts.forEach((count) => {
    if (count === 3) {
      hasThreeOfKind = true;
    } else if (count === 2) {
      hasTwoOfKind = true;
    }
  });
  return hasThreeOfKind && hasTwoOfKind;
}

function isStraight(diceArr, size) {
  let consecutives = 1;
  return diceArr.slice(1).some((value, index) => {
    if (value === diceArr[index] + 1) {
      consecutives++;
      if (consecutives === size) {
        return true;
      }
    } else {
      consecutives = 1;
    }
  });
}

const pointCombos = [
  {
    name: "Aces",
    max: 5,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 1),
  },
  {
    name: "Twos",
    max: 10,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 2),
  },
  {
    name: "Threes",
    max: 15,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 3),
  },
  {
    name: "Fours",
    max: 20,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 4),
  },
  {
    name: "Fives",
    max: 25,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 5),
  },
  {
    name: "Sixes",
    max: 30,
    getPoints: (diceArr) => getMultiplesPoints(diceArr, 6),
  },
  {
    name: "3 of a Kind",
    max: 30,
    getPoints: (diceArr) => getOfAKindPoints(diceArr, 3),
  },
  {
    name: "4 of a Kind",
    max: 30,
    getPoints: (diceArr) => getOfAKindPoints(diceArr, 4),
  },
  {
    name: "Full House",
    max: 28,
    getPoints: (diceArr) => (isFullHouse(diceArr) ? 25 : 0),
  },
  {
    name: "Small Straight",
    max: 30,
    getPoints: (diceArr) => (isStraight(diceArr, 4) ? 30 : 0),
  },
  {
    name: "Large Straight",
    max: 40,
    getPoints: (diceArr) => (isStraight(diceArr, 5) ? 40 : 0),
  },
  {
    name: "YAHTZEE",
    max: 50,
    getPoints: (diceArr) =>
      diceArr.every((value) => value === diceArr[0]) ? 50 : 0,
  },
  {
    name: "Chance",
    max: 30,
    getPoints: (diceArr) => sum(diceArr),
  },
];

function getCombos(diceArr, unusedCombos) {
  const combos = unusedCombos.map(({ name, max, getPoints }, index) => ({
    name,
    points: getPoints(diceArr),
    max,
  }));
  return combos
    .filter(({ points }) => points > 0)
    .sort((a, b) => b.points - a.points);
}

const rerollOptions = [
  [0],
  [1],
  [2],
  [3],
  [4],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
  [0, 1, 2],
  [0, 1, 3],
  [0, 1, 4],
  [0, 2, 3],
  [0, 2, 4],
  [0, 3, 4],
  [1, 2, 3],
  [1, 2, 4],
  [1, 3, 4],
  [2, 3, 4],
  [0, 1, 2, 3],
  [0, 1, 2, 4],
  [0, 1, 3, 4],
  [0, 2, 3, 4],
  [1, 2, 3, 4],
];

const dieValues = [1, 2, 3, 4, 5, 6];

function getSuggestion(diceArr, usedCombos) {
  const unusedCombos = pointCombos.filter(
    (_, index) => !usedCombos.includes(index)
  );
  const combos = getCombos(diceArr, unusedCombos);
  rerollOptions.forEach((rerollOption) => {
    const rerollOptionLength = rerollOption.length;
    dieValues
      .filter((value) => value !== diceArr[rerollOption[0]])
      .forEach((otherValueA) => {
        if (rerollOptionLength > 1) {
          dieValues
            .filter((value) => value !== diceArr[rerollOption[1]])
            .forEach((otherValueB) => {
              if (rerollOptionLength > 2) {
                dieValues
                  .filter((value) => value !== diceArr[rerollOption[1]])
                  .forEach((otherValueC) => {
                    if (rerollOptionLength > 3) {
                      dieValues
                        .filter((value) => value !== diceArr[rerollOption[1]])
                        .forEach((otherValueD) => {
                          // use otherValueA, otherValueB, otherValueC, and otherValueD
                        });
                    } else {
                      // just use otherValueA, otherValueB, and otherValueC
                    }
                  });
              } else {
                // just use otherValueA and otherValueB
              }
            });
        } else {
          // TODO: replace diceArr[x] with otherValueA and record the highest-point combo we can get
        }
      });
  });
}
