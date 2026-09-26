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
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
};


/* =========================================================
   COUNT RANKS
========================================================= */

function getRankCounts(cards) {

    const counts = {};

    cards.forEach((card) => {

        counts[card.rank] =
            (counts[card.rank] || 0) + 1;

    });

    return counts;
}


/* =========================================================
   FLUSH
========================================================= */

function isFlush(cards) {

    return cards.every(
        (card) =>
            card.suit === cards[0].suit
    );
}


/* =========================================================
   STRAIGHT
========================================================= */

function getStraightHigh(cards) {

    const values = [
        ...new Set(
            cards.map(
                (card) =>
                    rankValues[card.rank]
            )
        )
    ].sort(
        (a, b) => b - a
    );


    /*
        Normal straight
    */

    for (
        let i = 0;
        i <= values.length - 5;
        i++
    ) {

        const first = values[i];

        if (
            values[i + 1] === first - 1 &&
            values[i + 2] === first - 2 &&
            values[i + 3] === first - 3 &&
            values[i + 4] === first - 4
        ) {

            return first;

        }

    }


    /*
        Ace-low straight:

        A 2 3 4 5
    */

    if (
        values.includes(14) &&
        values.includes(5) &&
        values.includes(4) &&
        values.includes(3) &&
        values.includes(2)
    ) {

        return 5;

    }

    return null;
}


/* =========================================================
   FIVE-CARD HAND EVALUATION
========================================================= */

function evaluateFiveCards(cards) {

    const values = cards
        .map(
            (card) =>
                rankValues[card.rank]
        )
        .sort(
            (a, b) => b - a
        );


    const counts =
        getRankCounts(cards);


    /*
        Groups are sorted by:

        1. Number of cards
        2. Rank value

        Example:

        K K A A 10

        becomes:

        K pair
        A pair
        10 kicker
    */

    const groups =
        Object.entries(counts)
            .map(
                ([rank, count]) => ({
                    rank,
                    value:
                        rankValues[rank],
                    count
                })
            )
            .sort(
                (a, b) => {

                    if (
                        b.count !==
                        a.count
                    ) {

                        return (
                            b.count -
                            a.count
                        );

                    }

                    return (
                        b.value -
                        a.value
                    );

                }
            );


    const flush =
        isFlush(cards);


    const straightHigh =
        getStraightHigh(cards);


    /* =====================================================
       STRAIGHT FLUSH
    ===================================================== */

    if (
        flush &&
        straightHigh !== null
    ) {

        return {
            name: "Straight Flush",
            rank: 8,
            values: [
                straightHigh
            ]
        };

    }


    /* =====================================================
       FOUR OF A KIND
    ===================================================== */

    const four =
        groups.find(
            (group) =>
                group.count === 4
        );


    if (four) {

        const kicker =
            groups
                .filter(
                    (group) =>
                        group.count !== 4
                )
                .map(
                    (group) =>
                        group.value
                )
                .sort(
                    (a, b) => b - a
                )[0];


        return {
            name: "Four of a Kind",
            rank: 7,
            values: [
                four.value,
                kicker
            ]
        };

    }


    /* =====================================================
       FULL HOUSE
    ===================================================== */

    const triplets =
        groups.filter(
            (group) =>
                group.count === 3
        );


    const pairs =
        groups.filter(
            (group) =>
                group.count === 2
        );


    /*
        Important:

        A seven-card hand can contain
        TWO triplets.

        Example:

        K K K 7 7 7 A

        The best full house is:

        K K K 7 7

        Therefore the second triplet
        must be allowed to act as the pair.
    */

    if (
        triplets.length >= 1 &&
        (
            pairs.length >= 1 ||
            triplets.length >= 2
        )
    ) {

        const threeValue =
            triplets[0].value;


        let pairValue;


        if (
            triplets.length >= 2
        ) {

            pairValue =
                triplets[1].value;

        } else {

            pairValue =
                pairs[0].value;

        }


        return {
            name: "Full House",
            rank: 6,
            values: [
                threeValue,
                pairValue
            ]
        };

    }


    /* =====================================================
       FLUSH
    ===================================================== */

    if (flush) {

        return {
            name: "Flush",
            rank: 5,
            values: values
        };

    }


    /* =====================================================
       STRAIGHT
    ===================================================== */

    if (
        straightHigh !== null
    ) {

        return {
            name: "Straight",
            rank: 4,
            values: [
                straightHigh
            ]
        };

    }


    /* =====================================================
       THREE OF A KIND
    ===================================================== */

    if (
        triplets.length >= 1
    ) {

        const threeValue =
            triplets[0].value;


        const kickers =
            groups
                .filter(
                    (group) =>
                        group.count === 1
                )
                .map(
                    (group) =>
                        group.value
                )
                .sort(
                    (a, b) => b - a
                );


        return {
            name: "Three of a Kind",
            rank: 3,
            values: [
                threeValue,
                ...kickers
            ]
        };

    }


    /* =====================================================
       TWO PAIR
    ===================================================== */

    if (
        pairs.length >= 2
    ) {

        const sortedPairs =
            [...pairs].sort(
                (a, b) =>
                    b.value -
                    a.value
            );


        const kicker =
            groups
                .filter(
                    (group) =>
                        group.count === 1
                )
                .map(
                    (group) =>
                        group.value
                )
                .sort(
                    (a, b) => b - a
                )[0];


        return {
            name: "Two Pair",
            rank: 2,
            values: [
                sortedPairs[0].value,
                sortedPairs[1].value,
                kicker
            ]
        };

    }


    /* =====================================================
       ONE PAIR
    ===================================================== */

    if (
        pairs.length === 1
    ) {

        const pairValue =
            pairs[0].value;


        /*
            THIS IS THE IMPORTANT PART.

            All three remaining cards are
            kickers and MUST remain in descending
            order.

            Example:

            K K A 10 7

            becomes:

            [13, 14, 10, 7]

            When two players have the same pair,
            comparison proceeds:

            pair
            ↓
            highest kicker
            ↓
            second kicker
            ↓
            third kicker
        */

        const kickers =
            groups
                .filter(
                    (group) =>
                        group.count === 1
                )
                .map(
                    (group) =>
                        group.value
                )
                .sort(
                    (a, b) => b - a
                );


        return {
            name: "Pair",
            rank: 1,
            values: [
                pairValue,
                ...kickers
            ]
        };

    }


    /* =====================================================
       HIGH CARD
    ===================================================== */

    return {
        name: "High Card",
        rank: 0,
        values: values
    };
}


/* =========================================================
   FIVE-CARD COMBINATIONS
========================================================= */

function getFiveCardCombinations(cards) {

    const combinations = [];


    for (
        let a = 0;
        a < cards.length - 4;
        a++
    ) {

        for (
            let b = a + 1;
            b < cards.length - 3;
            b++
        ) {

            for (
                let c = b + 1;
                c < cards.length - 2;
                c++
            ) {

                for (
                    let d = c + 1;
                    d < cards.length - 1;
                    d++
                ) {

                    for (
                        let e = d + 1;
                        e < cards.length;
                        e++
                    ) {

                        combinations.push([
                            cards[a],
                            cards[b],
                            cards[c],
                            cards[d],
                            cards[e]
                        ]);

                    }

                }

            }

        }

    }

    return combinations;
}


/* =========================================================
   VALUE COMPARISON
========================================================= */

function compareValues(
    firstValues,
    secondValues
) {

    const length =
        Math.max(
            firstValues.length,
            secondValues.length
        );


    /*
        Compare from left to right.

        Example:

        Player:
        [13, 14, 10, 7]

        Computer:
        [13, 14, 9, 8]

        Pair:
        13 = 13

        First kicker:
        14 = 14

        Second kicker:
        10 > 9

        Therefore:

        Player wins.
    */

    for (
        let i = 0;
        i < length;
        i++
    ) {

        const first =
            firstValues[i] || 0;

        const second =
            secondValues[i] || 0;


        if (
            first > second
        ) {

            return 1;

        }


        if (
            first < second
        ) {

            return -1;

        }

    }


    return 0;
}


/* =========================================================
   BEST HAND FROM 5-7 CARDS
========================================================= */

export function evaluateHand(cards) {

    if (
        cards.length < 5
    ) {

        return {
            name: "Not Enough Cards",
            rank: -1,
            values: []
        };

    }


    const combinations =
        getFiveCardCombinations(cards);


    let bestHand = null;


    combinations.forEach(
        (combination) => {

            const result =
                evaluateFiveCards(
                    combination
                );


            if (
                bestHand === null
            ) {

                bestHand = result;

                return;

            }


            /*
                First compare hand category.
            */

            if (
                result.rank >
                bestHand.rank
            ) {

                bestHand = result;

                return;

            }


            /*
                If categories are equal,
                compare every kicker/value
                from highest to lowest.
            */

            if (
                result.rank ===
                bestHand.rank
            ) {

                const comparison =
                    compareValues(
                        result.values,
                        bestHand.values
                    );


                if (
                    comparison > 0
                ) {

                    bestHand =
                        result;

                }

            }

        }
    );


    return bestHand;
}


/* =========================================================
   FINAL HAND COMPARISON
========================================================= */

export function compareHands(
    playerHand,
    computerHand
) {

    /*
        First compare category.

        Pair < Two Pair < Three of a Kind...
    */

    if (
        playerHand.rank >
        computerHand.rank
    ) {

        return "player";

    }


    if (
        computerHand.rank >
        playerHand.rank
    ) {

        return "computer";

    }


    /*
        Same category.

        Now compare:

        Pair:
        pair → kicker 1 → kicker 2 → kicker 3

        Two Pair:
        pair 1 → pair 2 → kicker

        Trips:
        trips → kicker 1 → kicker 2

        etc.
    */

    const comparison =
        compareValues(
            playerHand.values,
            computerHand.values
        );


    if (
        comparison > 0
    ) {

        return "player";

    }


    if (
        comparison < 0
    ) {

        return "computer";

    }


    return "tie";
}

