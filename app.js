var app = new Vue({
    el: '#app',
    data: {
        pointCombos: [{
            id: 1,
            name: 'Aces',
            used: false,
            max: 5
        }, {
            id: 2,
            name: 'Twos',
            used: false,
            max: 10
        }, {
            id: 3,
            name: 'Threes',
            used: false,
            max: 15
        }, {
            id: 4,
            name: 'Fours',
            used: false,
            max: 20
        }, {
            id: 5,
            name: 'Fives',
            used: false,
            max: 25
        }, {
            id: 6,
            name: 'Sixes',
            used: false,
            max: 30
        }, {
            id: 7,
            name: '3 of A Kind',
            used: false,
            max: 30
        }, {
            id: 8,
            name: '4 of A Kind',
            used: false,
            max: 30
        }, {
            id: 9,
            name: 'Full House',
            used: false,
            max: 28
        }, {
            id: 10,
            name: 'Small Straight',
            used: false,
            max: 30
        }, {
            id: 11,
            name: 'Large Straight',
            used: false,
            max: 40
        }, {
            id: 12,
            name: 'YAHTZEE',
            used: false,
            max: 50
        }, {
            id: 13,
            name: 'Chance',
            used: false,
            max: 30
        }],
        rollsLeft: true,
        dice: '65432',
        availablePointCombos: [],
        showResults: false,
        noResultsMsg: 'Ready...',
        recommendation: '',
        weightedRerollComboRating: '0.0',
        recommendReroll: false,
        recommendedRerollCombo: '',
        recommendedComboId: 1,
        rerollsSimulated: 0
    },
    computed: {
        diceArr: function() {
            return _.map(this.dice.split(''), function(val) {
                return parseInt(val, 10);
            }).sort();
        }
    },
    methods: {
        makeRecommendation: function() {
            var rerollCombos;
            var self = this;
            var potentialRerolls = [];
            var highestCurrentPoints;
            var rerollComboGroups = {};
            var rerollComboGroupsArr = [];
            var rerollCombosCompleted = 0;
            if (this.dice.length !== 5 || _.intersection(this.diceArr, [7, 8, 9, 0]).length) {
                this.noResultsMsg = 'Invalid dice! Example: 36552';
                return;
            }
            this.availablePointCombos = this.getPointCombos(this.diceArr);
            highestCurrentPoints = this.availablePointCombos[0].points;
            if (this.rollsLeft) {
                this.showResults = false;
                this.noResultsMsg = 'Simulating re-rolls and comparing scores...';
                rerollCombos = ['1', '2', '3', '4', '5', '12', '13', '14', '15', '23', '24', '25', '34', '35','45', '123', '124', '125', '134', '135', '145', '234', '235', '245', '345', '1234', '1235', '1245', '1345', '2345', '12345'];
                _.each(rerollCombos, function(rerollCombo) {
                    self.getPotentialRerolls(_.map(rerollCombo.split(''), function(val) {
                        return parseInt(val, 10) - 1;
                    }), _.clone(self.diceArr), [], [], function(newPotentialsRerolls) {
                        potentialRerolls = potentialRerolls.concat(newPotentialsRerolls);
                        rerollCombosCompleted += 1;
                        if (rerollCombosCompleted === 31) {
                            continueMakingRecommendation();
                        }
                    });
                });
            } else {
                finishMakingRecommendation();
            }

            function continueMakingRecommendation() {
                self.rerollsSimulated = 0;
                _.each(potentialRerolls, function(potentialReroll) {
                    if (!rerollComboGroups['r' + potentialReroll.rerollCombo]) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo] = {
                            above: 0,
                            equal: 0,
                            rolls: [],
                            total: 0,
                            totalPoints: 0
                        };
                    }
                    if (potentialReroll.highestPoints > highestCurrentPoints) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo].above += 1;
                    } else if (potentialReroll.highestPoints === highestCurrentPoints) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo].equal += 1;
                    }
                    rerollComboGroups['r' + potentialReroll.rerollCombo].totalPoints += potentialReroll.highestPoints;
                    rerollComboGroups['r' + potentialReroll.rerollCombo].rolls.push(potentialReroll);
                    rerollComboGroups['r' + potentialReroll.rerollCombo].total += 1;
                });
                _.each(rerollComboGroups, function(rerollComboGroup, rerollCombo) {
                    rerollComboGroup.rerollCombo = rerollCombo.substring(1);
                    rerollComboGroup.rating = (rerollComboGroup.above / (rerollComboGroup.total - rerollComboGroup.equal)) * 100;
                    if (_.isNaN(rerollComboGroup.rating)) {
                        rerollComboGroup.rating = 0;
                    }
                    rerollComboGroup.average = rerollComboGroup.totalPoints / rerollComboGroup.total;
                    rerollComboGroupsArr.push(rerollComboGroup);
                });
                rerollComboGroupsArr = _.sortBy(rerollComboGroupsArr, ['rating', 'average']).reverse();
                finishMakingRecommendation();
            }

            function finishMakingRecommendation() {
                if (rerollComboGroupsArr.length && rerollComboGroupsArr[0].rating > 50) {
                    self.recommendation = 'Re-roll ';
                    if (rerollComboGroupsArr[0].rerollCombo.length === 5) {
                        self.recommendation += 'EVERYTHING';
                    } else {
                        self.recommendation += 'the ';
                        _.each(rerollComboGroupsArr[0].rerollCombo.split(''), function(rerollDie, rerollIndex) {
                            if (rerollIndex) {
                                if (rerollIndex === rerollComboGroupsArr[0].rerollCombo.length - 1) {
                                    if (rerollComboGroupsArr[0].rerollCombo.length > 2) {
                                        self.recommendation += ',';
                                    }
                                    self.recommendation += ' and ';
                                } else {
                                    self.recommendation += ', ';
                                }
                            }
                            self.recommendation += self.diceArr[parseInt(rerollDie, 10)];
                        });
                    }
                    self.recommendation += '.';
                    self.recommendReroll = true;
                    self.recommendedRerollCombo = rerollComboGroupsArr[0].rerollCombo;
                } else {
                    self.recommendation = self.availablePointCombos[0].name + ' for ' + highestCurrentPoints + ' points.';
                    self.recommendReroll = false;
                    self.recommendedComboId = self.availablePointCombos[0].id;
                }
                if (self.rollsLeft) {
                    self.weightedRerollComboRating = rerollComboGroupsArr[0].rating.toFixed(1);
                } else {
                    self.weightedRerollComboRating = '0';
                }
                self.showResults = true;
                self.noResultsMsg = 'Ready...';
            }
        },
        newRoll: function() {
            var newDice = '';
            _.times(5, function() {
                newDice += _.random(1, 6);
            });
            this.dice = newDice;
            this.makeRecommendation();
        },
        followRecommendation: function() {
            var self = this;
            var newDiceArr = _.map(this.dice.split(''), function(val) {
                return parseInt(val, 10);
            });
            var rerollIndexObjs = [];
            if (this.recommendReroll) {
                _.each(this.recommendedRerollCombo, function(rerollDie) {
                    var die = self.diceArr[parseInt(rerollDie, 10)];
                    var rerollIndex;
                    var startingIndex;
                    if (rerollIndexObjs.length) {
                        startingIndex = _.find(rerollIndexObjs, {die: die});
                        if (startingIndex) {
                            rerollIndex = _.indexOf(newDiceArr, die, startingIndex.index);
                        } else {
                            rerollIndex = _.indexOf(newDiceArr, die);
                        }
                    } else {
                        rerollIndex = _.indexOf(newDiceArr, die);
                    }
                    rerollIndexObjs.push({
                        die: die,
                        index: rerollIndex
                    });
                    newDiceArr[rerollIndex] = _.random(1, 6);
                });
                this.dice = newDiceArr.join('');
                this.makeRecommendation();
            } else {
                _.find(this.pointCombos, {id: this.recommendedComboId}).used = true;
                this.showResults = false;
            }
        },
        getPotentialRerolls: function(rerollComboArr, rerollDiceArr, potentialRerolls, sortedPotentialRerolls, returnFn) {
            var maxLengthMap = [5, 20, 55, 125, 251];
            var carryOver = false;
            var highestPoints;
            var self = this;
            var sortedRerollDice;
            var sortedPotentialRerolls;
            if (sortedPotentialRerolls.length === maxLengthMap[rerollComboArr.length-1]) {
                returnFn(potentialRerolls);
                return;
            }
            _.each(rerollComboArr, function(rerollDie, rerollIndex) {
                if (rerollIndex && !carryOver) {
                    return false;
                } 
                if (rerollDiceArr[rerollDie] === 6) {
                    rerollDiceArr[rerollDie] = 1;
                    carryOver = true;
                } else {
                    rerollDiceArr[rerollDie] += 1;
                    carryOver = false;
                }
            });
            sortedRerollDice = _.clone(rerollDiceArr).sort().join('');
            if (sortedRerollDice !== this.diceArr.join('') && !_.includes(sortedPotentialRerolls, sortedRerollDice)) {
                sortedPotentialRerolls.push(sortedRerollDice);
                potentialRerolls.push({
                    rerollCombo: rerollComboArr.join(''),
                    rerollDice: sortedRerollDice,
                    highestPoints: this.getPointCombos(_.map(sortedRerollDice.split(''), function(val) {
                        return parseInt(val, 10);
                    }))[0].points
                });
            }
            this.rerollsSimulated += 1;
            if (this.rerollsSimulated % 100) {
                self.getPotentialRerolls(rerollComboArr, rerollDiceArr, potentialRerolls, sortedPotentialRerolls, returnFn);
            } else {
                setTimeout(function() {
                    self.getPotentialRerolls(rerollComboArr, rerollDiceArr, potentialRerolls, sortedPotentialRerolls, returnFn);
                });
            }
        },
        getPointCombos: function(diceArr) {
            var pointCombos = [];
            var self = this;
            _.each(_.filter(this.pointCombos, {used: false}), function(pointCombo) {
                var points = self.getComboPoints(pointCombo.id, diceArr);
                pointCombos.push({
                    id: pointCombo.id,
                    name: pointCombo.name,
                    points: points,
                    max: pointCombo.max
                });
            });
            return _.sortBy(pointCombos, ['points']).reverse();
        },
        getComboPoints: function(comboId, diceArr) {
            var comboPointFunctions = {
                c1: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 1) {
                            points += d;
                        }
                    });
                    return points;
                },
                c2: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 2) {
                            points += d;
                        }
                    });
                    return points;
                },
                c3: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 3) {
                            points += d;
                        }
                    });
                    return points;
                },
                c4: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 4) {
                            points += d;
                        }
                    });
                    return points;
                },
                c5: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 5) {
                            points += d;
                        }
                    });
                    return points;
                },
                c6: function(diceArr) {
                    var points = 0;
                    _.each(diceArr, function(d) {
                        if (d === 6) {
                            points += d;
                        }
                    });
                    return points;
                },
                c7: function(diceArr) {
                    var pass = false;
                    _.each(_.countBy(diceArr), function(count) {
                        if (count > 2) {
                            pass = true;
                        }
                    });
                    if (pass) {
                        return _.sum(diceArr);
                    } else {
                        return 0;
                    }
                },
                c8: function(diceArr) {
                    var pass = false;
                    _.each(_.countBy(diceArr), function(count) {
                        if (count > 3) {
                            pass = true;
                        }
                    });
                    if (pass) {
                        return _.sum(diceArr);
                    } else {
                        return 0;
                    }
                },
                c9: function(diceArr) {
                    var hasThreeOfKind = false;
                    var hasTwoOfKind = false;
                    _.each(_.countBy(diceArr), function(count) {
                        if (count === 3) {
                            hasThreeOfKind = true;
                        } else if (count === 2) {
                            hasTwoOfKind = true;
                        }
                    });
                    if (hasThreeOfKind && hasTwoOfKind) {
                        return 25;
                    } else {
                        return 0;
                    }
                },
                c10: function(diceArr) {
                    var uniqDice = _.uniq(diceArr).join('')
                    if (
                        _.startsWith(uniqDice, '1234') ||
                        _.startsWith(uniqDice, '2345') ||
                        _.startsWith(uniqDice, '3456') ||
                        _.endsWith(uniqDice, '3456') ||
                        _.endsWith(uniqDice, '2345') ||
                        _.endsWith(uniqDice, '1234')
                    ) {
                        return 30;
                    } else {
                        return 0;
                    }
                },
                c11: function(diceArr) {
                    var uniqDice = _.uniq(diceArr).join('')
                    if (
                        _.startsWith(uniqDice, '12345') ||
                        _.startsWith(uniqDice, '23456') ||
                        _.endsWith(uniqDice, '23456') ||
                        _.endsWith(uniqDice, '12345')
                    ) {
                        return 40;
                    } else {
                        return 0;
                    }
                },
                c12: function(diceArr) {
                    if (_.uniq(diceArr).length === 1) {
                        return 50;
                    } else {
                        return 0;
                    }
                },
                c13: function(diceArr) {
                    return _.sum(diceArr);
                }
            };
            return comboPointFunctions['c' + comboId](diceArr);
        }
    }
});
