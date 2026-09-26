import { evaluateHand } from "./pokerLogic";

const rankValues = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14
};

/*
    Returns a rough pre-flop strength.

    This is intentionally not a perfect poker solver.
    It gives the computer a believable understanding
    of starting hands.
*/
function getPreflopStrength(cards) {

    if (!cards || cards.length !== 2) {
        return 0;
    }

    const first = rankValues[cards[0].rank];
    const second = rankValues[cards[1].rank];

    const high = Math.max(first, second);
    const low = Math.min(first, second);

    let strength = 0;

    // Pocket pair
    if (first === second) {

        strength = 45 + (high * 3);

        // Premium pairs
        if (high >= 12) {
            strength += 15;
        }

        return Math.min(strength, 100);
    }

    // Both cards are high
    if (high >= 13 && low >= 10) {
        strength += 75;
    } else if (high >= 12 && low >= 10) {
        strength += 65;
    } else if (high >= 11 && low >= 9) {
        strength += 55;
    } else if (high >= 10 && low >= 8) {
        strength += 45;
    } else {
        strength += high * 3;
    }

    // Suited cards
    if (cards[0].suit === cards[1].suit) {
        strength += 8;
    }

    // Connected cards
    if (Math.abs(first - second) === 1) {
        strength += 8;
    } else if (Math.abs(first - second) === 2) {
        strength += 4;
    }

    // Ace bonus
    if (high === 14) {
        strength += 8;
    }

    return Math.min(strength, 100);
}


/*
    Detects whether the computer has a useful draw.
*/
function getDrawStrength(cards) {

    if (!cards || cards.length < 5) {
        return 0;
    }

    let strength = 0;

    // Flush draw
    const suitCounts = {};

    cards.forEach((card) => {
        suitCounts[card.suit] =
            (suitCounts[card.suit] || 0) + 1;
    });

    const hasFlushDraw =
        Object.values(suitCounts).some(
            (count) => count === 4
        );

    if (hasFlushDraw) {
        strength += 18;
    }

    // Straight draw
    const values = [
        ...new Set(
            cards.map(
                (card) => rankValues[card.rank]
            )
        )
    ].sort((a, b) => a - b);

    let longestRun = 1;

    for (let i = 1; i < values.length; i++) {

        if (values[i] === values[i - 1] + 1) {
            longestRun++;
        } else if (
            values[i] !== values[i - 1]
        ) {
            longestRun = 1;
        }

        if (longestRun >= 4) {
            strength += 20;
            break;
        }
    }

    // Ace can participate in low straight
    if (
        values.includes(14) &&
        values.includes(2) &&
        values.includes(3) &&
        values.includes(4)
    ) {
        strength += 15;
    }

    return Math.min(strength, 35);
}


/*
    Gives the AI a changing personality.

    It prevents the computer from behaving identically
    every round.
*/
function getPersonality() {

    const roll = Math.random();

    if (roll < 0.25) {
        return {
            name: "tight",
            aggression: 0.85,
            bluff: 0.08
        };
    }

    if (roll < 0.55) {
        return {
            name: "balanced",
            aggression: 1,
            bluff: 0.16
        };
    }

    if (roll < 0.80) {
        return {
            name: "aggressive",
            aggression: 1.25,
            bluff: 0.24
        };
    }

    return {
        name: "tricky",
        aggression: 1.15,
        bluff: 0.32
    };
}


/*
    Main poker decision function.

    The AI considers:
    - actual hand
    - pre-flop strength
    - draws
    - pot odds
    - aggression
    - bluff probability
    - random variation
*/
export function computerDecision({
    computerCards = [],
    communityCards = [],
    currentBet = 0,
    computerBet = 0,
    pot = 0
}) {

    const personality = getPersonality();

    const allCards = [
        ...computerCards,
        ...communityCards
    ];

    const hand = evaluateHand(allCards);

    const preflopStrength =
        getPreflopStrength(
            computerCards
        );

    const drawStrength =
        getDrawStrength(allCards);

    /*
        Before the flop we don't have enough cards
        to evaluate a real poker hand.
    */
    let handStrength;

    if (communityCards.length === 0) {
        handStrength = preflopStrength;
    } else {

        const categoryStrength = {
            0: 20,
            1: 43,
            2: 58,
            3: 70,
            4: 82,
            5: 88,
            6: 94,
            7: 98,
            8: 100
        };

        handStrength =
            categoryStrength[hand.rank] || 20;

        handStrength += drawStrength;

        handStrength = Math.min(
            handStrength,
            100
        );
    }

    const amountToCall =
        Math.max(
            0,
            currentBet - computerBet
        );

    /*
        Pot pressure.

        A $50 call into a $500 pot is treated
        differently from a $50 call into a $100 pot.
    */
    const potAfterCall =
        pot + amountToCall;

    const potPressure =
        potAfterCall > 0
            ? amountToCall / potAfterCall
            : 0;

    /*
        Bluffing becomes more likely when the AI
        isn't facing a huge bet.
    */
    let bluffChance =
        personality.bluff;

    if (potPressure > 0.35) {
        bluffChance *= 0.55;
    }

    /*
        Randomness prevents predictable patterns.
    */
    const randomFactor =
        Math.random() * 18 - 9;

    const effectiveStrength =
        handStrength *
        personality.aggression +
        randomFactor;

    /*
        Very strong hands.

        A master does NOT always raise.

        Sometimes it calls to hide strength.
    */
    if (effectiveStrength >= 88) {

        const slowPlay =
            Math.random() < 0.32;

        if (slowPlay) {
            return {
                action: "call",
                amount: amountToCall,
                reason: "slow-play"
            };
        }

        return {
            action: "raise",
            amount: 50 +
                Math.floor(Math.random() * 101),
            reason: "strong-hand"
        };
    }


    /*
        Strong made hands.
    */
    if (effectiveStrength >= 72) {

        const raiseChance =
            0.35 *
            personality.aggression;

        if (
            Math.random() <
            raiseChance
        ) {
            return {
                action: "raise",
                amount:
                    50 +
                    Math.floor(
                        Math.random() * 76
                    ),
                reason: "value-raise"
            };
        }

        if (amountToCall > 0) {
            return {
                action: "call",
                amount: amountToCall,
                reason: "strong-call"
            };
        }

        return {
            action: "check",
            amount: 0,
            reason: "strong-check"
        };
    }


    /*
        Medium hands.

        These are important because the AI should
        not fold every time it isn't strong.
    */
    if (effectiveStrength >= 50) {

        if (amountToCall === 0) {

            if (
                Math.random() <
                0.30 *
                personality.aggression
            ) {
                return {
                    action: "raise",
                    amount:
                        50 +
                        Math.floor(
                            Math.random() * 51
                        ),
                    reason: "pressure"
                };
            }

            return {
                action: "check",
                amount: 0,
                reason: "medium-check"
            };
        }

        /*
            Sometimes defend a medium hand.
        */
        if (
            potPressure < 0.25 ||
            Math.random() < 0.45
        ) {
            return {
                action: "call",
                amount: amountToCall,
                reason: "pot-defense"
            };
        }

        /*
            Occasionally turn a medium hand
            into a pressure raise.
        */
        if (
            Math.random() <
            0.15 *
            personality.aggression
        ) {
            return {
                action: "raise",
                amount:
                    50 +
                    Math.floor(
                        Math.random() * 51
                    ),
                reason: "pressure-raise"
            };
        }

        return {
            action: "fold",
            amount: 0,
            reason: "medium-fold"
        };
    }


    /*
        Weak hands / draws.

        This is where believable bluffing happens.
    */

    const hasDraw =
        drawStrength >= 15;

    /*
        Semi-bluff:
        weak made hand + meaningful draw.
    */
    if (
        hasDraw &&
        Math.random() <
        0.55 * personality.aggression
    ) {

        if (
            Math.random() < 0.55
        ) {
            return {
                action: "raise",
                amount:
                    50 +
                    Math.floor(
                        Math.random() * 101
                    ),
                reason: "semi-bluff"
            };
        }

        if (
            amountToCall === 0 ||
            potPressure < 0.30
        ) {
            return {
                action: "call",
                amount: amountToCall,
                reason: "draw"
            };
        }
    }


    /*
        Pure bluff.

        The AI deliberately continues with
        weak hands some of the time.
    */
    if (
        Math.random() <
        bluffChance
    ) {

        if (
            Math.random() < 0.60
        ) {
            return {
                action: "raise",
                amount:
                    50 +
                    Math.floor(
                        Math.random() * 126
                    ),
                reason: "bluff"
            };
        }

        if (
            amountToCall === 0
        ) {
            return {
                action: "check",
                amount: 0,
                reason: "bluff-check"
            };
        }
    }


    /*
        Weak hand facing a small bet.

        The AI occasionally makes a cheap call
        instead of instantly folding.
    */
    if (
        amountToCall > 0 &&
        potPressure < 0.18 &&
        Math.random() < 0.35
    ) {
        return {
            action: "call",
            amount: amountToCall,
            reason: "cheap-call"
        };
    }


    /*
        Final decision.
    */
    if (amountToCall === 0) {
        return {
            action: "check",
            amount: 0,
            reason: "weak-check"
        };
    }

    return {
        action: "fold",
        amount: 0,
        reason: "weak-fold"
    };
}


/*
    Kept for compatibility with the previous AI.
*/
export function getHandStrength(hand) {

    if (!hand || hand.rank < 0) {
        return 0;
    }

    const categoryStrength = {
        0: 20,
        1: 43,
        2: 58,
        3: 70,
        4: 82,
        5: 88,
        6: 94,
        7: 98,
        8: 100
    };

    return categoryStrength[hand.rank] || 0;
}