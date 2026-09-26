function StatsPanel({ stats }) {

    return (
        <div className="stats-panel">

            <h2>Game Statistics</h2>

            <div className="stats-grid">

                <div>
                    <strong>
                        {stats.games}
                    </strong>

                    <span>
                        Games
                    </span>
                </div>


                <div>
                    <strong>
                        {stats.wins}
                    </strong>

                    <span>
                        Wins
                    </span>
                </div>


                <div>
                    <strong>
                        {stats.losses}
                    </strong>

                    <span>
                        Losses
                    </span>
                </div>


                <div>
                    <strong>
                        {stats.ties}
                    </strong>

                    <span>
                        Ties
                    </span>
                </div>

            </div>

        </div>
    );
}

export default StatsPanel;