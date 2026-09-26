import Card from "./Card";

function CommunityCards({ cards }) {
    return (
        <div className="community-section">
            <h2>Community Cards</h2>

            <div className="cards">
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                    />
                ))}
            </div>
        </div>
    );
}

export default CommunityCards;