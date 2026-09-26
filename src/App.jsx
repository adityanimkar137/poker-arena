import {
    useState,
    useMemo,
    useCallback
} from "react";

import {
    createDeck,
    shuffleDeck
} from "./utils/deck";

import Player from "./components/Player";
import CommunityCards from "./components/CommunityCards";
import ActionPanel from "./components/ActionPanel";
import StatsPanel from "./components/StatsPanel";
import RaiseControl from "./components/RaiseControl";
import HistoryPanel from "./components/HistoryPanel";
import ResultModal from "./components/ResultModal";
import SettingsPanel from "./components/SettingsPanel";

import {
    computerDecision
} from "./utils/computerAI";

import {
    evaluateHand,
    compareHands
} from "./utils/pokerLogic";

import useLocalStorage from "./hooks/useLocalStorage";

function App() {

    const [stats, setStats] =
        useLocalStorage(
            "pokerArenaStats",
            {
                games: 0,
                wins: 0,
                losses: 0,
                ties: 0
            }
        );

    const [history, setHistory] =
        useLocalStorage(
            "pokerArenaHistory",
            []
        );

    const [playerCards, setPlayerCards] =
        useState([]);

    const [computerCards, setComputerCards] =
        useState([]);

    const [communityCards, setCommunityCards] =
        useState([]);

    const [playerChips, setPlayerChips] =
        useState(1000);

    const [computerChips, setComputerChips] =
        useState(1000);

    const [pot, setPot] =
        useState(0);

    const [deck, setDeck] =
        useState([]);

    const [gameStage, setGameStage] =
        useState("waiting");

    const [currentBet, setCurrentBet] =
        useState(0);

    const [playerBet, setPlayerBet] =
        useState(0);

    const [computerBet, setComputerBet] =
        useState(0);

    const [raiseAmount, setRaiseAmount] =
        useState(50);

    const [playerHand, setPlayerHand] =
        useState(null);

    const [computerHand, setComputerHand] =
        useState(null);

    const [message, setMessage] =
        useState(
            "Click New Round to start."
        );

    const [playerTurn, setPlayerTurn] =
        useState(false);

    const [showSettings, setShowSettings] =
        useState(false);


    /*
     * CURRENT PLAYER HAND
     */

    const currentPlayerHand =
        useMemo(() => {

            const allCards = [
                ...playerCards,
                ...communityCards
            ];

            return evaluateHand(allCards);

        }, [
            playerCards,
            communityCards
        ]);


    /*
     * HISTORY
     */

    function addHistory(
        result,
        hand
    ) {

        const newGame = {
            id: Date.now(),
            result: result,
            hand: hand
        };

        setHistory(
            (previousHistory) => [
                newGame,
                ...previousHistory
            ]
        );
    }


    /*
     * STATISTICS
     */

    function updateStats(result) {

        setStats(
            (previousStats) => {

                const updatedStats = {
                    games:
                        previousStats.games + 1,

                    wins:
                        previousStats.wins,

                    losses:
                        previousStats.losses,

                    ties:
                        previousStats.ties
                };

                if (result === "Win") {
                    updatedStats.wins++;
                }

                if (result === "Loss") {
                    updatedStats.losses++;
                }

                if (result === "Tie") {
                    updatedStats.ties++;
                }

                return updatedStats;
            }
        );
    }


    /*
     * START NEW ROUND
     */

    function dealNewRound() {

        if (
            playerChips <= 0 ||
            computerChips <= 0
        ) {

            setMessage(
                "A player has no chips. Reset the game to continue."
            );

            return;
        }

        const newDeck =
            shuffleDeck(
                createDeck()
            );

        setPlayerCards([
            newDeck[0],
            newDeck[1]
        ]);

        setComputerCards([
            newDeck[2],
            newDeck[3]
        ]);

        setCommunityCards([]);

        setDeck(
            newDeck.slice(4)
        );

        setPot(0);

        setCurrentBet(0);

        setPlayerBet(0);

        setComputerBet(0);

        setRaiseAmount(50);

        setPlayerHand(null);

        setComputerHand(null);

        setGameStage("preflop");

        setMessage(
            "Your turn"
        );

        setPlayerTurn(true);
    }


    /*
     * SHOWDOWN
     */

    const showdown =
        useCallback(() => {

            const playerAllCards = [
                ...playerCards,
                ...communityCards
            ];

            const computerAllCards = [
                ...computerCards,
                ...communityCards
            ];

            const playerResult =
                evaluateHand(
                    playerAllCards
                );

            const computerResult =
                evaluateHand(
                    computerAllCards
                );

            setPlayerHand(
                playerResult
            );

            setComputerHand(
                computerResult
            );

            const winner =
                compareHands(
                    playerResult,
                    computerResult
                );


            /*
             * PLAYER WINS
             */

            if (
                winner === "player"
            ) {

                setMessage(
                    `You win with ${playerResult.name}!`
                );

                addHistory(
                    "Win",
                    playerResult.name
                );

                updateStats("Win");

                setPlayerChips(
                    playerChips + pot
                );
            }


            /*
             * COMPUTER WINS
             */

            else if (
                winner === "computer"
            ) {

                setMessage(
                    `Computer wins with ${computerResult.name}!`
                );

                addHistory(
                    "Loss",
                    computerResult.name
                );

                updateStats("Loss");

                setComputerChips(
                    computerChips + pot
                );
            }


            /*
             * TIE
             */

            else {

                setMessage(
                    `It's a tie! Both have ${playerResult.name}.`
                );

                addHistory(
                    "Tie",
                    playerResult.name
                );

                updateStats("Tie");

                const halfPot =
                    Math.floor(
                        pot / 2
                    );

                setPlayerChips(
                    playerChips +
                    halfPot
                );

                setComputerChips(
                    computerChips +
                    (pot - halfPot)
                );
            }

            setPot(0);

            setGameStage(
                "showdown"
            );

            setPlayerTurn(false);

        }, [
            playerCards,
            computerCards,
            communityCards,
            playerChips,
            computerChips,
            pot
        ]);


    /*
     * MOVE TO NEXT POKER STREET
     */

    const moveToNextStage =
        useCallback(() => {

            /*
             * PREFLOP -> FLOP
             */

            if (
                gameStage ===
                "preflop"
            ) {

                setCommunityCards(
                    deck.slice(0, 3)
                );

                setDeck(
                    deck.slice(3)
                );

                setGameStage(
                    "flop"
                );

                setCurrentBet(0);

                setPlayerBet(0);

                setComputerBet(0);

                setRaiseAmount(50);

                setMessage(
                    "Flop dealt. Your turn."
                );

                setPlayerTurn(true);
            }


            /*
             * FLOP -> TURN
             */

            else if (
                gameStage ===
                "flop"
            ) {

                setCommunityCards([
                    ...communityCards,
                    deck[0]
                ]);

                setDeck(
                    deck.slice(1)
                );

                setGameStage(
                    "turn"
                );

                setCurrentBet(0);

                setPlayerBet(0);

                setComputerBet(0);

                setRaiseAmount(50);

                setMessage(
                    "Turn dealt. Your turn."
                );

                setPlayerTurn(true);
            }


            /*
             * TURN -> RIVER
             */

            else if (
                gameStage ===
                "turn"
            ) {

                setCommunityCards([
                    ...communityCards,
                    deck[0]
                ]);

                setDeck(
                    deck.slice(1)
                );

                setGameStage(
                    "river"
                );

                setCurrentBet(0);

                setPlayerBet(0);

                setComputerBet(0);

                setRaiseAmount(50);

                setMessage(
                    "River dealt. Your turn."
                );

                setPlayerTurn(true);
            }


            /*
             * RIVER -> SHOWDOWN
             */

            else if (
                gameStage ===
                "river"
            ) {

                showdown();
            }

        }, [
            gameStage,
            deck,
            communityCards,
            showdown
        ]);


    /*
     * COMPUTER TURN
     *
     * The AI now receives:
     * - hole cards
     * - community cards
     * - current bet
     * - its own bet
     * - pot
     *
     * This allows the new poker AI to make
     * situation-based decisions.
     */

    const computerAction =
        useCallback(() => {

            const decision =
                computerDecision({
                    computerCards,
                    communityCards,
                    currentBet,
                    computerBet,
                    pot
                });


            /*
             * FOLD
             */

            if (
                decision.action ===
                "fold"
            ) {

                setMessage(
                    "Computer folded. You win!"
                );

                addHistory(
                    "Win",
                    "Opponent Folded"
                );

                updateStats("Win");

                setPlayerChips(
                    playerChips + pot
                );

                setPot(0);

                setGameStage(
                    "showdown"
                );

                setPlayerTurn(false);

                return;
            }


            /*
             * CHECK
             */

            if (
                decision.action ===
                "check"
            ) {

                setMessage(
                    "Computer checked."
                );

                setPlayerTurn(false);

                setTimeout(() => {
                    moveToNextStage();
                }, 700);

                return;
            }


            /*
             * CALL
             */

            if (
                decision.action ===
                "call"
            ) {

                const amountToCall =
                    Math.max(
                        0,
                        currentBet -
                        computerBet
                    );

                /*
                 * Nothing to call.
                 * Treat as check.
                 */

                if (
                    amountToCall === 0
                ) {

                    setMessage(
                        "Computer checked."
                    );

                    setPlayerTurn(false);

                    setTimeout(() => {
                        moveToNextStage();
                    }, 700);

                    return;
                }

                const actualCall =
                    Math.min(
                        amountToCall,
                        computerChips
                    );

                setComputerChips(
                    computerChips -
                    actualCall
                );

                setComputerBet(
                    computerBet +
                    actualCall
                );

                setPot(
                    pot +
                    actualCall
                );


                /*
                 * COMPUTER ALL-IN
                 */

                if (
                    actualCall <
                    amountToCall
                ) {

                    setMessage(
                        "Computer went all-in!"
                    );

                    setPlayerTurn(false);

                    setTimeout(() => {
                        moveToNextStage();
                    }, 700);

                    return;
                }

                setMessage(
                    `Computer called $${actualCall}.`
                );

                setPlayerTurn(false);

                setTimeout(() => {
                    moveToNextStage();
                }, 700);

                return;
            }


            /*
             * RAISE
             */

            if (
                decision.action ===
                "raise"
            ) {

                /*
                 * The new AI chooses its own
                 * raise amount.
                 */

                const computerRaiseAmount =
                    Math.max(
                        50,
                        decision.amount || 50
                    );


                /*
                 * A raise means:
                 *
                 * current bet
                 * +
                 * AI's chosen raise
                 */

                const newBet =
                    currentBet +
                    computerRaiseAmount;


                const additionalAmount =
                    newBet -
                    computerBet;


                /*
                 * AI cannot spend more
                 * chips than it has.
                 */

                const actualAmount =
                    Math.min(
                        additionalAmount,
                        computerChips
                    );


                /*
                 * Nothing available to bet.
                 */

                if (
                    actualAmount <= 0
                ) {

                    setMessage(
                        "Computer checked."
                    );

                    setPlayerTurn(true);

                    return;
                }


                /*
                 * Remove chips from computer.
                 */

                setComputerChips(
                    computerChips -
                    actualAmount
                );


                /*
                 * Update computer's
                 * contribution.
                 */

                const updatedComputerBet =
                    computerBet +
                    actualAmount;

                setComputerBet(
                    updatedComputerBet
                );


                /*
                 * Add money to pot.
                 */

                setPot(
                    pot +
                    actualAmount
                );


                /*
                 * New table bet.
                 */

                setCurrentBet(
                    updatedComputerBet
                );


                /*
                 * ALL-IN
                 */

                if (
                    actualAmount <
                    additionalAmount
                ) {

                    setMessage(
                        "Computer went all-in!"
                    );

                    setPlayerTurn(false);

                    setTimeout(() => {
                        moveToNextStage();
                    }, 700);

                    return;
                }


                /*
                 * NORMAL RAISE
                 */

                setMessage(
                    `Computer raised to $${updatedComputerBet}.`
                );

                setPlayerTurn(true);
            }

        }, [
            computerCards,
            communityCards,
            currentBet,
            computerBet,
            computerChips,
            pot,
            moveToNextStage,
            playerChips
        ]);


    /*
     * PLAYER CHECK
     */

    const handleCheck =
        useCallback(() => {

            if (!playerTurn) {
                return;
            }

            if (currentBet > 0) {

                setMessage(
                    "You cannot check. Call or raise."
                );

                return;
            }

            setMessage(
                "You checked."
            );

            setPlayerTurn(false);

            setTimeout(() => {
                computerAction();
            }, 500);

        }, [
            playerTurn,
            currentBet,
            computerAction
        ]);


    /*
     * PLAYER CALL
     */

    const handleCall =
        useCallback(() => {

            if (!playerTurn) {
                return;
            }

            const amountToCall =
                Math.max(
                    0,
                    currentBet -
                    playerBet
                );


            if (
                amountToCall <= 0
            ) {

                setMessage(
                    "There is no bet to call."
                );

                return;
            }


            const actualCall =
                Math.min(
                    amountToCall,
                    playerChips
                );


            setPlayerChips(
                playerChips -
                actualCall
            );

            setPlayerBet(
                playerBet +
                actualCall
            );

            setPot(
                pot +
                actualCall
            );


            /*
             * PLAYER ALL-IN
             */

            if (
                actualCall <
                amountToCall
            ) {

                setMessage(
                    "You went all-in!"
                );

                setPlayerTurn(false);

                setTimeout(() => {
                    moveToNextStage();
                }, 700);

                return;
            }


            setMessage(
                `You called $${actualCall}.`
            );

            setPlayerTurn(false);

            setTimeout(() => {
                moveToNextStage();
            }, 500);

        }, [
            playerTurn,
            currentBet,
            playerBet,
            playerChips,
            pot,
            moveToNextStage
        ]);


    /*
     * PLAYER RAISE
     */

    const handleRaise =
        useCallback(() => {

            if (!playerTurn) {
                return;
            }

            if (raiseAmount < 50) {

                setMessage(
                    "Raise must be at least $50."
                );

                return;
            }


            /*
             * Raise amount is added
             * on top of the current bet.
             */

            const newBet =
                currentBet +
                raiseAmount;


            const additionalAmount =
                newBet -
                playerBet;


            if (
                additionalAmount <= 0
            ) {

                setMessage(
                    "Invalid raise."
                );

                return;
            }


            const actualAmount =
                Math.min(
                    additionalAmount,
                    playerChips
                );


            setPlayerChips(
                playerChips -
                actualAmount
            );

            setPlayerBet(
                playerBet +
                actualAmount
            );

            setPot(
                pot +
                actualAmount
            );


            const updatedPlayerBet =
                playerBet +
                actualAmount;


            setCurrentBet(
                updatedPlayerBet
            );


            /*
             * PLAYER ALL-IN
             */

            if (
                actualAmount <
                additionalAmount
            ) {

                setMessage(
                    "You went all-in!"
                );

                setPlayerTurn(false);

                setTimeout(() => {
                    moveToNextStage();
                }, 700);

                return;
            }


            setMessage(
                `You raised to $${updatedPlayerBet}.`
            );

            setPlayerTurn(false);

            setTimeout(() => {
                computerAction();
            }, 500);

        }, [
            playerTurn,
            currentBet,
            raiseAmount,
            playerBet,
            playerChips,
            pot,
            computerAction,
            moveToNextStage
        ]);


    /*
     * PLAYER FOLD
     */

    const handleFold =
        useCallback(() => {

            if (!playerTurn) {
                return;
            }

            setMessage(
                "You folded. Computer wins!"
            );

            addHistory(
                "Loss",
                "You Folded"
            );

            updateStats("Loss");

            setComputerChips(
                computerChips + pot
            );

            setPot(0);

            setGameStage(
                "showdown"
            );

            setPlayerTurn(false);

        }, [
            playerTurn,
            computerChips,
            pot
        ]);


    /*
     * RESET STATISTICS + HISTORY
     */

    function resetData() {

        setStats({
            games: 0,
            wins: 0,
            losses: 0,
            ties: 0
        });

        setHistory([]);

        setShowSettings(false);

        setMessage(
            "Statistics and history reset."
        );
    }


    const maxRaiseAmount =
        playerChips;


    const gameOver =
        playerChips <= 0 ||
        computerChips <= 0;


    return (
        <div className="game">

            <header className="game-header">

                <h1>
                    Poker Arena
                </h1>

                <button
                    onClick={() =>
                        setShowSettings(
                            !showSettings
                        )
                    }
                >
                    {showSettings
                        ? "Close Settings"
                        : "Settings"}
                </button>

            </header>


            {showSettings && (
                <SettingsPanel
                    onResetData={
                        resetData
                    }
                />
            )}


            <p className="message">
                {message}
            </p>


            <Player
                name="Computer"
                cards={computerCards}
                chips={computerChips}
                isComputer={true}
                revealCards={
                    gameStage ===
                    "showdown"
                }
            />


            <CommunityCards
                cards={communityCards}
            />


            <div className="pot">

                <h2>
                    Pot
                </h2>

                <p>
                    ${pot}
                </p>

            </div>


            <Player
                name="You"
                cards={playerCards}
                chips={playerChips}
                isComputer={false}
            />


            {!gameOver &&
                gameStage !==
                "showdown" &&
                gameStage !==
                "waiting" && (

                <>

                    <ActionPanel
                        currentBet={
                            currentBet
                        }
                        playerBet={
                            playerBet
                        }
                        playerChips={
                            playerChips
                        }
                        onCheck={
                            handleCheck
                        }
                        onCall={
                            handleCall
                        }
                        onFold={
                            handleFold
                        }
                    />


                    <RaiseControl
                        raiseAmount={
                            raiseAmount
                        }
                        onRaiseAmountChange={
                            setRaiseAmount
                        }
                        onRaise={
                            handleRaise
                        }
                        maxAmount={
                            maxRaiseAmount
                        }
                    />

                </>
            )}


            <div className="controls">

                <button
                    onClick={
                        dealNewRound
                    }
                    disabled={
                        gameStage !==
                            "waiting" &&
                        gameStage !==
                            "showdown"
                    }
                >
                    New Round
                </button>

            </div>


            {gameStage !==
                "waiting" && (

                <>

                    <h3>
                        Stage:{" "}
                        {gameStage}
                    </h3>


                    <h3>
                        Turn:{" "}
                        {playerTurn
                            ? "Your Turn"
                            : "Computer Turn"}
                    </h3>


                    <div className="current-hand">

                        <h3>
                            Current Hand
                        </h3>

                        <p>
                            {
                                currentPlayerHand.name
                            }
                        </p>

                    </div>

                </>
            )}


            {gameOver && (

                <div className="game-over">

                    <h2>
                        Game Over
                    </h2>

                    <p>
                        A player has run out
                        of chips.
                    </p>

                    <p>
                        Use Settings to reset
                        your game data.
                    </p>

                </div>
            )}


            <StatsPanel
                stats={stats}
            />


            <HistoryPanel
                history={history}
            />


            {gameStage ===
                "showdown" && (

                <ResultModal
                    playerHand={
                        playerHand
                    }
                    computerHand={
                        computerHand
                    }
                    message={
                        message
                    }
                    onNewRound={
                        dealNewRound
                    }
                />

            )}

        </div>
    );
}

export default App;
