function ResultModal({
    playerHand,
    computerHand,
    message,
    onNewRound
}) {
    return (
        <div className="result-modal">

            <div className="result-box">

                <h2>Round Complete</h2>

                <p className="result-message">
                    {message}
                </p>

                <div className="result-hands">

                    <div>
                        <h3>Your Hand</h3>
                        <p>
                            {playerHand?.name || "Fold"}
                        </p>
                    </div>

                    <div>
                        <h3>Computer Hand</h3>
                        <p>
                            {computerHand?.name || "Fold"}
                        </p>
                    </div>

                </div>

                <button onClick={onNewRound}>
                    Play Again
                </button>

            </div>

        </div>
    );
}

export default ResultModal;

