const suits = ["♠", "♥", "♦", "♣"];

const ranks = [
    "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "J", "Q", "K", "A"
];

export function createDeck() {
    const deck = [];

    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({
                id: `${rank}-${suit}`,
                suit: suit,
                rank: rank
            });
        }
    }

    return deck;
}

export function shuffleDeck(deck) {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}