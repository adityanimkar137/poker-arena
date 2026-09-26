
function SettingsPanel({
    onResetData
}) {
    return (
        <div className="settings-panel">

            <h2>Settings</h2>

            <button
                onClick={onResetData}
            >
                Reset Statistics & History
            </button>

        </div>
    );
}

export default SettingsPanel;