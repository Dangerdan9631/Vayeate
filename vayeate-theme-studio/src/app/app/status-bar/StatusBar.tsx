import { useStatusBarViewModel } from './use-status-bar-viewmodel';

export function StatusBar() {
  const {
    showProgressArea,
    queueStatusText,
    runningActionDescriptions,
  } = useStatusBarViewModel();

  return (
    <footer className="status-bar">
      <div className="status-bar-left" />
      <div className="status-bar-right">
        {showProgressArea && (
          <div className="status-progress-area">
            <div className="status-progress-track">
              <div className="status-progress-bar" />
            </div>
            <span className="status-queue-text">{queueStatusText}</span>
            <div className="status-running-popover" role="status">
              <div className="status-running-popover-title">Executing</div>
              <div className="status-running-popover-list">
                {runningActionDescriptions.map((description, index) => (
                  <div className="status-running-popover-item" key={`${description}-${index}`}>
                    {description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
