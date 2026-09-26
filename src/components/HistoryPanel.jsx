function HistoryPanel({ history }) {

    return (
        <div className="history-panel">

            <h2>Game History</h2>

            {history.length === 0 ? (
                <p>No games played yet.</p>
            ) : (
                <div className="history-list">

                    {history.map((game) => (
                        <div
                            className="history-item"
                            key={game.id}
                        >
                            <p>
                                <strong>
                                    Game #{game.id}
                                </strong>
                            </p>

                            <p>
                                Result: {game.result}
                            </p>

                            <p>
                                Hand: {game.hand}
                            </p>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default HistoryPanel;

