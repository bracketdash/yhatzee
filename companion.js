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

const rerollCombos = [
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

const maxLengthMap = [5, 20, 55, 125, 251];

function getPotentialRerolls(
  rerollComboArr,
  diceArr,
  callback,
  potentialRerolls = [],
  sortedPotentialRerolls = []
) {
  const newDiceArr = [...diceArr];
  if (
    sortedPotentialRerolls.length === maxLengthMap[rerollComboArr.length - 1]
  ) {
    callback(potentialRerolls);
    return;
  }
  let carryOver = false;

  // TODO: finish refactoring
  _.each(rerollComboArr, function (rerollDie, rerollIndex) {
    if (rerollIndex && !carryOver) {
      return false;
    }
    if (diceArr[rerollDie] === 6) {
      newDiceArr[rerollDie] = 1;
      carryOver = true;
    } else {
      newDiceArr[rerollDie] += 1;
      carryOver = false;
    }
  });
  const sortedRerollDice = _.clone(newDiceArr).sort().join("");
  const newSortedPotentialRerolls = [...sortedPotentialRerolls];
  if (
    sortedRerollDice !== this.diceArr.join("") &&
    !_.includes(sortedPotentialRerolls, sortedRerollDice)
  ) {
    newSortedPotentialRerolls.push(sortedRerollDice);
    potentialRerolls.push({
      rerollCombo: rerollComboArr.join(""),
      rerollDice: sortedRerollDice,
      highestPoints: this.getPointCombos(
        _.map(sortedRerollDice.split(""), function (val) {
          return parseInt(val, 10);
        })
      )[0].points,
    });
  }
  this.rerollsSimulated += 1;
  if (this.rerollsSimulated % 100) {
    getPotentialRerolls(
      rerollComboArr,
      newDiceArr,
      callback,
      potentialRerolls,
      newSortedPotentialRerolls
    );
  } else {
    setTimeout(function () {
      getPotentialRerolls(
        rerollComboArr,
        newDiceArr,
        callback,
        potentialRerolls,
        newSortedPotentialRerolls
      );
    });
  }
}

function getSuggestion(diceArr, usedCombos, callback) {
  const unusedCombos = pointCombos.filter(
    (_, index) => !usedCombos.includes(index)
  );
  const combos = getCombos(diceArr, unusedCombos);
  callback("Thinking...", combos);
  let potentialRerolls = [];
  let rerollCombosCompleted = 0;
  rerollCombos.forEach((rerollCombo) => {
    getPotentialRerolls(rerollCombo, diceArr, (newPotentialsRerolls) => {
      potentialRerolls = [potentialRerolls, ...newPotentialsRerolls];
      rerollCombosCompleted++;
      if (rerollCombosCompleted === rerollCombos.length) {
        continueMakingRecommendation();
      }
    });
  });

  // TODO: finish refactoring
  var rerollComboGroups = {};
  var rerollComboGroupsArr = [];
  var highestCurrentPoints = combos[0].points;
  function continueMakingRecommendation() {
    self.rerollsSimulated = 0;
    _.each(potentialRerolls, function (potentialReroll) {
      if (!rerollComboGroups["r" + potentialReroll.rerollCombo]) {
        rerollComboGroups["r" + potentialReroll.rerollCombo] = {
          above: 0,
          equal: 0,
          rolls: [],
          total: 0,
          totalPoints: 0,
        };
      }
      if (potentialReroll.highestPoints > highestCurrentPoints) {
        rerollComboGroups["r" + potentialReroll.rerollCombo].above += 1;
      } else if (potentialReroll.highestPoints === highestCurrentPoints) {
        rerollComboGroups["r" + potentialReroll.rerollCombo].equal += 1;
      }
      rerollComboGroups["r" + potentialReroll.rerollCombo].totalPoints +=
        potentialReroll.highestPoints;
      rerollComboGroups["r" + potentialReroll.rerollCombo].rolls.push(
        potentialReroll
      );
      rerollComboGroups["r" + potentialReroll.rerollCombo].total += 1;
    });
    _.each(rerollComboGroups, function (rerollComboGroup, rerollCombo) {
      rerollComboGroup.rerollCombo = rerollCombo.substring(1);
      rerollComboGroup.rating =
        (rerollComboGroup.above /
          (rerollComboGroup.total - rerollComboGroup.equal)) *
        100;
      if (_.isNaN(rerollComboGroup.rating)) {
        rerollComboGroup.rating = 0;
      }
      rerollComboGroup.average =
        rerollComboGroup.totalPoints / rerollComboGroup.total;
      rerollComboGroupsArr.push(rerollComboGroup);
    });
    rerollComboGroupsArr = _.sortBy(rerollComboGroupsArr, [
      "rating",
      "average",
    ]).reverse();
    if (rerollComboGroupsArr.length && rerollComboGroupsArr[0].rating > 50) {
      self.recommendation = "Re-roll ";
      if (rerollComboGroupsArr[0].rerollCombo.length === 5) {
        self.recommendation += "EVERYTHING";
      } else {
        self.recommendation += "the ";
        _.each(
          rerollComboGroupsArr[0].rerollCombo.split(""),
          function (rerollDie, rerollIndex) {
            if (rerollIndex) {
              if (
                rerollIndex ===
                rerollComboGroupsArr[0].rerollCombo.length - 1
              ) {
                if (rerollComboGroupsArr[0].rerollCombo.length > 2) {
                  self.recommendation += ",";
                }
                self.recommendation += " and ";
              } else {
                self.recommendation += ", ";
              }
            }
            self.recommendation += self.diceArr[parseInt(rerollDie, 10)];
          }
        );
      }
      self.recommendation += ".";
      self.recommendReroll = true;
      self.recommendedRerollCombo = rerollComboGroupsArr[0].rerollCombo;
    } else {
      self.recommendation =
        combos[0].name + " for " + highestCurrentPoints + " points.";
      self.recommendReroll = false;
    }
    self.weightedRerollComboRating = rerollComboGroupsArr[0].rating.toFixed(1);
    self.showResults = true;
    self.noResultsMsg = "Ready...";
  }
}
