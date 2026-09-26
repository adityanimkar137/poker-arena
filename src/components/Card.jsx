function Card({ card, hidden = false }) {
    if (hidden) {
        return (
            <div className="card hidden-card">
                🂠
            </div>
        );
    }

    return (
        <div className="card">
            <span>{card.rank}</span>
            <span>{card.suit}</span>
        </div>
    );
}

export default Card;