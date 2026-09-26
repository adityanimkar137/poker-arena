
function RaiseControl({
    raiseAmount,
    onRaiseAmountChange,
    onRaise,
    maxAmount
}) {

    return (
        <div className="raise-control">

            <label>
                Raise Amount
            </label>

            <input
                type="number"
                min="50"
                max={maxAmount}
                value={raiseAmount}
                onChange={(event) =>
                    onRaiseAmountChange(
                        Number(event.target.value)
                    )
                }
            />

            <button
                onClick={onRaise}
                disabled={
                    raiseAmount < 50 ||
                    raiseAmount > maxAmount
                }
            >
                Raise ${raiseAmount}
            </button>

        </div>
    );
}

export default RaiseControl;

