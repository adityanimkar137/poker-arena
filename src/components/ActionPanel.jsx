function ActionPanel({
    currentBet,
    playerBet,
    playerChips,
    onCheck,
    onCall,
    onFold
}) {

    const amountToCall =
        Math.max(
            0,
            currentBet - playerBet
        );

    const canCall =
        amountToCall > 0 &&
        playerChips > 0;

    const canCheck =
        amountToCall === 0;

    return (
        <div className="action-panel">

            <h2>
                Your Actions
            </h2>

            <p>
                Current Bet: ${currentBet}
            </p>

            <p>
                Amount to Call: ${amountToCall}
            </p>

            <p>
                Your Chips: ${playerChips}
            </p>

            <div className="action-buttons">

                <button
                    onClick={onCheck}
                    disabled={!canCheck}
                >
                    Check
                </button>

                <button
                    onClick={onCall}
                    disabled={!canCall}
                >
                    {playerChips < amountToCall
                        ? `Call $${playerChips}`
                        : `Call $${amountToCall}`}
                </button>

                <button
                    onClick={onFold}
                >
                    Fold
                </button>

            </div>

        </div>
    );
}

export default ActionPanel;