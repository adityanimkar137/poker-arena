import Card from "./Card";

function Player({
    name,
    cards,
    chips,
    isComputer,
    revealCards = false
}) {
    return (
        <div className="player">

            <h2>{name}</h2>

            <div className="cards">

                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        hidden={
                            isComputer &&
                            !revealCards
                        }
                    />
                ))}

            </div>

            <p>
                Chips: ${chips}
            </p>

        </div>
    );
}

export default Player;

