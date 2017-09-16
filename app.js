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
        recommendedComboId: 1
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
            if (this.dice.length !== 5 || _.intersection(this.diceArr, [7, 8, 9, 0]).length) {
                this.noResultsMsg = 'Invalid dice! Example: 36552';
                return;
            }
            this.availablePointCombos = this.getPointCombos(this.diceArr);
            highestCurrentPoints = this.availablePointCombos[0].points;
            if (this.rollsLeft) {
                rerollCombos = ['1', '2', '3', '4', '5', '12', '13', '14', '15', '23', '24', '25', '34', '35','45', '123', '124', '125', '134', '135', '145', '234', '235', '245', '345', '1234', '1235', '1245', '1345', '2345', '12345'];
                _.each(rerollCombos, function(rerollCombo) {
                    potentialRerolls = potentialRerolls.concat(self.getPotentialRerolls(_.map(rerollCombo.split(''), function(val) {
                        return parseInt(val, 10) - 1;
                    }), _.clone(self.diceArr), []));
                });
                _.each(potentialRerolls, function(potentialReroll) {
                    if (!rerollComboGroups['r' + potentialReroll.rerollCombo]) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo] = {
                            above: 0,
                            equal: 0,
                            total: 0
                        };
                    }
                    if (potentialReroll.highestPoints > highestCurrentPoints) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo].above += 1;
                    } else if (potentialReroll.highestPoints === highestCurrentPoints) {
                        rerollComboGroups['r' + potentialReroll.rerollCombo].equal += 1;
                    }
                    rerollComboGroups['r' + potentialReroll.rerollCombo].total += 1;
                });
                _.each(rerollComboGroups, function(rerollComboGroup, rerollCombo) {
                    rerollComboGroup.rerollCombo = rerollCombo.substring(1);
                    rerollComboGroup.rating = (rerollComboGroup.above / rerollComboGroup.total) * 100;
                    rerollComboGroupsArr.push(rerollComboGroup);
                });
                rerollComboGroupsArr = _.sortBy(rerollComboGroupsArr, ['rating']).reverse();
            }
            if (rerollComboGroupsArr.length && rerollComboGroupsArr[0].rating > 50) {
                this.recommendation = 'Re-roll ';
                if (rerollComboGroupsArr[0].rerollCombo.length === 5) {
                    this.recommendation += 'EVERYTHING';
                } else {
                    this.recommendation += 'the ';
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
                this.recommendation += '.';
                this.recommendReroll = true;
                this.recommendedRerollCombo = rerollComboGroupsArr[0].rerollCombo;
            } else {
                this.recommendation = this.availablePointCombos[0].name + ' for ' + highestCurrentPoints + ' points.';
                this.recommendReroll = false;
                this.recommendedComboId = this.availablePointCombos[0].id;
            }
            if (this.rollsLeft) {
                this.weightedRerollComboRating = rerollComboGroupsArr[0].rating.toFixed(1);
            } else {
                this.weightedRerollComboRating = '0';
            }
            this.showResults = true;
            this.noResultsMsg = 'Ready...';
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
                    console.log('newDiceArr[' + rerollIndex + '] = ' + newDiceArr[rerollIndex]);
                });
                this.dice = newDiceArr.join('');
                this.makeRecommendation();
            } else {
                _.find(this.pointCombos, {id: this.recommendedComboId}).used = true;
                this.showResults = false;
            }
        },
        getPotentialRerolls: function(rerollComboArr, rerollDiceArr, potentialRerolls) {
            var maxLengthMap = [5, 20, 55, 125, 251];
            var carryOver = false;
            if (potentialRerolls.length === maxLengthMap[rerollComboArr.length-1]) {
                return potentialRerolls;
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
            if (rerollDiceArr.join('') !== this.diceArr.join('')) {
                potentialRerolls.push({
                    rerollCombo: rerollComboArr.join(''),
                    rerollDice: rerollDiceArr.join(''),
                    highestPoints: this.getPointCombos(rerollDiceArr)[0].points
                });
            }
            return this.getPotentialRerolls(rerollComboArr, rerollDiceArr, potentialRerolls);
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
